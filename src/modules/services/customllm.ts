import {
  buildPromptParts,
  computeChunkBudget,
  estimateTokens,
  getPref,
  getServiceSecret,
  getString,
  runWithConcurrency,
  setServiceSecret,
  splitTextForContext,
} from "../../utils";
import { version } from "../../../package.json";
import { FluentMessageId } from "../../../typings/i10n";
import { TranslateService } from "./base";
import {
  extractDeltaFromLine,
  extractResponseText,
  findHeaderUnsafeChar,
  findUnsafeHeader,
  formatCodePoint,
  inspectResponse,
  isResponsesApiEndpoint,
  normalizeApiKey,
  parseCustomHeaders,
  parseCustomParams,
  resolveChatEndpoint,
} from "./openaiResponse";
import { hasSourceTextPlaceholder } from "./gptPrompt";

// Re-exported so the helper keeps a single documented entry point.
export { extractResponseText, resolveChatEndpoint };

const SERVICE_ID = "customllm";
const PREF = SERVICE_ID;

/** Fallback used only when the `contextWindow` preference is empty/invalid. */
const DEFAULT_CONTEXT_WINDOW = 264000;

/** Tokens reserved for the answer when `maxTokens` is set to "provider default". */
const DEFAULT_OUTPUT_RESERVE = 4096;

/** Chunks of one long text are translated in parallel by default. */
const DEFAULT_CONCURRENCY = 3;

/**
 * Provider presets. They only pre-fill the Base URL and the Model ID when the
 * user picks one - both fields stay fully editable and are never read back
 * from this table at request time.
 */
const PROVIDER_PRESETS: Record<
  string,
  { labelKey: FluentMessageId; baseUrl?: string; model?: string }
> = {
  custom: {
    labelKey: "service-customllm-provider-custom",
  },
  deepseek: {
    labelKey: "service-customllm-provider-deepseek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-flash",
  },
  opencode: {
    labelKey: "service-customllm-provider-opencode",
    baseUrl: "https://opencode.ai/zen/v1",
    model: "deepseek-v4-flash",
  },
  "opencode-go": {
    labelKey: "service-customllm-provider-opencode-go",
    baseUrl: "https://opencode.ai/zen/go/v1",
    model: "deepseek-v4-flash",
  },
};

/**
 * The DOM id of the API key field and the endpoint preview inside the
 * service settings dialog.
 */
const API_KEY_FIELD_ID = "customllm-api-key";
const ENDPOINT_PREVIEW_ID = "customllm-endpoint-preview";
const TEST_STATUS_ID = "customllm-test-status";

/**
 * Latest value typed into the API key field of the settings dialog.
 *
 * `undefined` means "the field was never touched", in which case the stored
 * secret is left untouched on save.
 */
let pendingApiKey: string | undefined;

interface CustomLlmConfig {
  /** Resolved request URL. */
  endpoint: string;
  model: string;
  temperature: number;
  stream: boolean;
  /** 0 means "let the provider decide". */
  maxTokens: number;
  contextWindow: number;
  apiKey: string;
  /** Extra body fields merged into the JSON request body. */
  customParams: Record<string, any>;
  /** Extra HTTP headers, merged last so they win over the defaults. */
  customHeaders: Record<string, string>;
  /** Sent as `x-opencode-session` when non-empty. */
  sessionId: string;
  /** How many chunks of a long text may be translated at the same time. */
  concurrency: number;
}

/** Reads a raw preference or form value by key. */
type ValueReader = (key: string) => unknown;

function prefReader(key: string): unknown {
  return getPref(key);
}

function readString(read: ValueReader, key: string): string {
  const value = read(key);
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
}

function readBoolean(
  read: ValueReader,
  key: string,
  fallback: boolean,
): boolean {
  const value = read(key);
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return String(value) !== "false";
}

function readInteger(read: ValueReader, key: string, fallback: number): number {
  const parsed = parseInt(readString(read, key), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readConfig(read: ValueReader, apiKey: string): CustomLlmConfig {
  const temperature = parseFloat(readString(read, `${PREF}.temperature`));
  const maxTokens = readInteger(read, `${PREF}.maxTokens`, 0);
  const contextWindow = readInteger(
    read,
    `${PREF}.contextWindow`,
    DEFAULT_CONTEXT_WINDOW,
  );
  return {
    endpoint: resolveChatEndpoint(readString(read, `${PREF}.baseUrl`)),
    model: readString(read, `${PREF}.model`),
    temperature: Number.isFinite(temperature) ? temperature : 1,
    stream: readBoolean(read, `${PREF}.stream`, true),
    maxTokens: maxTokens > 0 ? maxTokens : 0,
    contextWindow: contextWindow > 0 ? contextWindow : DEFAULT_CONTEXT_WINDOW,
    apiKey: normalizeApiKey(apiKey),
    customParams: parseCustomParams(readString(read, `${PREF}.customParams`)),
    customHeaders: parseCustomHeaders(
      readString(read, `${PREF}.customHeaders`),
    ),
    sessionId: readString(read, `${PREF}.sessionId`),
    concurrency: Math.max(
      1,
      readInteger(read, `${PREF}.concurrency`, DEFAULT_CONCURRENCY),
    ),
  };
}

/**
 * Build the request headers.
 *
 * The gateways behind OpenCode Go/Zen require the client to identify itself
 * with a real user agent and to send a stable session id, so both are sent by
 * default. Other providers ignore them.
 */
export function buildHeaders(cfg: CustomLlmConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
    "api-key": cfg.apiKey,
    "User-Agent": `Zotero-PDF-Translate/${version} (Custom LLM)`,
  };
  if (cfg.sessionId) {
    headers["x-opencode-session"] = cfg.sessionId;
  }
  return { ...headers, ...cfg.customHeaders };
}

/** Validate everything needed to send a request; throws a readable error. */
function assertConfigured(cfg: CustomLlmConfig) {
  if (!cfg.endpoint) {
    throw new Error(getString("service-customllm-error-baseUrl"));
  }
  if (!cfg.model) {
    throw new Error(getString("service-customllm-error-model"));
  }
  if (!cfg.apiKey) {
    throw new Error(getString("service-customllm-error-apiKey"));
  }
  // Header values are limited to ISO-8859-1. A key holding anything else is
  // not a real key (a pasted prompt, or a copy-paste accident), and Zotero
  // would otherwise fail with an unreadable "ByteString" TypeError.
  const unsafeKey = findHeaderUnsafeChar(cfg.apiKey);
  if (unsafeKey) {
    throw new Error(
      getString("service-customllm-error-apiKey-charset", {
        args: {
          index: unsafeKey.index + 1,
          code: formatCodePoint(unsafeKey.codePoint),
          length: cfg.apiKey.length,
        },
      }),
    );
  }
  // The same restriction applies to every other header we send, including the
  // ones the user added by hand.
  const unsafeHeader = findUnsafeHeader(buildHeaders(cfg));
  if (unsafeHeader) {
    throw new Error(
      getString("service-customllm-error-header-charset", {
        args: {
          header: unsafeHeader.name,
          index: unsafeHeader.index + 1,
          code: formatCodePoint(unsafeHeader.codePoint),
        },
      }),
    );
  }
}

function httpStatusHint(status: number): string {
  if (status === 401 || status === 403) {
    return getString("service-customllm-error-hint-401");
  }
  if (status === 404) {
    return getString("service-customllm-error-hint-404");
  }
  if (status === 429) {
    return getString("service-customllm-error-hint-429");
  }
  if (status >= 500) {
    return getString("service-customllm-error-hint-5xx");
  }
  return "";
}

function formatHttpError(
  status: number,
  body: string,
  statusText?: string,
): string {
  const hint = httpStatusHint(status);
  const head = `HTTP ${status}${statusText ? ` ${statusText}` : ""}${
    hint ? ` - ${hint}` : ""
  }`;
  const detail = (body || "").trim();
  if (!detail) {
    return head;
  }
  return `${head}\n${detail.length > 800 ? `${detail.slice(0, 800)}...` : detail}`;
}

function describeRequestFailure(error: unknown): string {
  if (error && typeof error === "object") {
    const anyError = error as any;
    const status = typeof anyError.status === "number" ? anyError.status : 0;
    // Zotero rejects with an UnexpectedStatusException that carries the
    // underlying XMLHttpRequest in `.xmlhttp`.
    const body =
      anyError.responseText ??
      anyError.response ??
      anyError.xmlhttp?.responseText;
    if (status) {
      return formatHttpError(
        status,
        typeof body === "string" ? body : "",
        anyError.statusText,
      );
    }
  }
  const detail = error instanceof Error ? error.message : String(error);
  return `${getString("service-customllm-error-hint-network")}\n${detail}`;
}

function buildRequestBody(
  cfg: CustomLlmConfig,
  system: string,
  user: string,
  useResponsesApi: boolean,
  stream: boolean,
): Record<string, any> {
  const messages = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  const body: Record<string, any> = useResponsesApi
    ? {
        model: cfg.model,
        input: messages,
        temperature: cfg.temperature,
        stream,
      }
    : {
        model: cfg.model,
        messages,
        temperature: cfg.temperature,
        stream,
      };
  if (cfg.maxTokens > 0) {
    // Custom request parameters below may override this on purpose.
    if (useResponsesApi) {
      body.max_output_tokens = cfg.maxTokens;
    } else {
      body.max_tokens = cfg.maxTokens;
    }
  }
  return { ...body, ...cfg.customParams };
}

/**
 * Build the error shown when the provider answered but sent no text.
 *
 * Thinking models spend the whole output budget on hidden reasoning before
 * writing any answer, which is by far the most common cause.
 */
function describeEmptyAnswer(rawBody: string): string {
  const info = inspectResponse(rawBody);
  if (info?.hasReasoning && !info.hasContent) {
    return getString("service-customllm-error-empty-reasoning", {
      args: {
        tokens: info.reasoningTokens,
        reason: info.finishReason || "-",
      },
    });
  }
  if (info?.finishReason === "length") {
    return getString("service-customllm-error-empty-truncated");
  }
  return getString("service-customllm-error-empty");
}

/**
 * Send one completion request.
 *
 * Returns the answer text together with the raw body, so callers can inspect
 * the provider's own diagnostics when the answer is empty.
 *
 * @param onPartial called with the text received so far while streaming.
 */
async function requestCompletionRaw(
  cfg: CustomLlmConfig,
  system: string,
  user: string,
  onPartial?: (textSoFar: string) => void,
): Promise<{ text: string; rawBody: string }> {
  const useResponsesApi = isResponsesApiEndpoint(cfg.endpoint);
  const body = buildRequestBody(cfg, system, user, useResponsesApi, cfg.stream);

  let streamed = "";
  let buffer = "";
  let preLength = 0;

  let xhr: XMLHttpRequest;
  try {
    xhr = await Zotero.HTTP.request("POST", cfg.endpoint, {
      headers: buildHeaders(cfg),
      body: JSON.stringify(body),
      responseType: "text",
      // Read error bodies ourselves instead of letting Zotero reject them,
      // so the provider's message can be shown to the user.
      successCodes: false,
      requestObserver: (xmlhttp: XMLHttpRequest) => {
        if (!cfg.stream || !onPartial) {
          return;
        }
        xmlhttp.onprogress = (e: any) => {
          const responseText: string = e.target.response || "";
          buffer += responseText.slice(preLength);
          preLength = responseText.length;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            streamed += extractDeltaFromLine(line, useResponsesApi);
          }
          // Clear timeouts caused by stream transfers.
          if (e.target.timeout) {
            e.target.timeout = 0;
          }
          onPartial(streamed);
        };
      },
    });
  } catch (e) {
    throw new Error(describeRequestFailure(e));
  }

  if (!xhr || xhr.status < 200 || xhr.status >= 300) {
    throw new Error(
      formatHttpError(
        xhr?.status ?? 0,
        xhr?.responseText || "",
        xhr?.statusText,
      ),
    );
  }

  const rawBody = xhr.responseText || "";
  const full = extractResponseText(rawBody, useResponsesApi);
  return { text: (full || streamed).trim(), rawBody };
}

/**
 * Send one completion request and return the translated text.
 *
 * An empty answer is never useful, so it is turned into an error explaining
 * the likely cause and quoting the provider's own response.
 */
async function requestCompletion(
  cfg: CustomLlmConfig,
  system: string,
  user: string,
  onPartial?: (textSoFar: string) => void,
): Promise<string> {
  const { text, rawBody } = await requestCompletionRaw(
    cfg,
    system,
    user,
    onPartial,
  );
  if (!text) {
    const detail = rawBody.trim().slice(0, 800);
    throw new Error(
      `${describeEmptyAnswer(rawBody)}${detail ? `\n${detail}` : ""}`,
    );
  }
  return text;
}

/**
 * Send a tiny request to verify Base URL + API key + Model ID.
 *
 * Exported for the "Test connection" button of the settings dialog.
 */
export async function testCustomLlmConnection(cfg: {
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  customParams?: Record<string, any>;
  customHeaders?: Record<string, string>;
  sessionId?: string;
}): Promise<{
  endpoint: string;
  reply: string;
  elapsedMs: number;
  /** Set when the provider answered but sent no text (e.g. only reasoning). */
  emptyReply: boolean;
  finishReason: string;
  reasoningTokens: number;
}> {
  const endpoint = resolveChatEndpoint(cfg.baseUrl);
  const full: CustomLlmConfig = {
    endpoint,
    model: (cfg.model || "").trim(),
    temperature: Number.isFinite(cfg.temperature as number)
      ? (cfg.temperature as number)
      : 1,
    stream: false,
    // The connection test does not cap the answer: a thinking model needs room
    // for its reasoning before it writes any text, and a tiny cap made the
    // test fail even though the endpoint, the key and the model were fine.
    maxTokens: cfg.maxTokens && cfg.maxTokens > 0 ? cfg.maxTokens : 0,
    contextWindow: DEFAULT_CONTEXT_WINDOW,
    apiKey: normalizeApiKey(cfg.apiKey),
    customParams: cfg.customParams || {},
    customHeaders: cfg.customHeaders || {},
    sessionId: cfg.sessionId || "",
    concurrency: 1,
  };
  // Reuse the same validation as a real translation, so the "Test connection"
  // button reports exactly the same problem.
  assertConfigured(full);
  const started = Date.now();
  // A valid HTTP response already proves the endpoint, the key and the model,
  // so an answer without text is reported as a warning rather than a failure.
  const { text, rawBody } = await requestCompletionRaw(
    full,
    "You are a connectivity test. Reply with the single word: pong",
    "ping",
  );
  const diagnostics = inspectResponse(rawBody);
  return {
    endpoint,
    reply: (text || "").trim(),
    elapsedMs: Date.now() - started,
    emptyReply: !(text || "").trim(),
    finishReason: diagnostics?.finishReason || "",
    reasoningTokens: diagnostics?.reasoningTokens || 0,
  };
}

// =======================================================
//            Settings dialog helpers
// =======================================================

function readDomValue(doc: Document, key: string): unknown {
  const element = doc.querySelector(`[data-setting-key="${key}"]`) as
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement
    | null;
  if (!element) {
    return undefined;
  }
  const tag = element.tagName.toLowerCase();
  if (tag === "input" && (element as HTMLInputElement).type === "checkbox") {
    return (element as HTMLInputElement).checked;
  }
  const type = element.getAttribute("data-setting-type");
  const value = element.value;
  if (type === "number") {
    return Number(value);
  }
  return value;
}

function updateEndpointPreview(doc: Document) {
  const preview = doc.getElementById(ENDPOINT_PREVIEW_ID);
  if (!preview) {
    return;
  }
  const baseUrl = String(readDomValue(doc, `${PREF}.baseUrl`) ?? "");
  const resolved = resolveChatEndpoint(baseUrl);
  preview.textContent =
    resolved || getString("service-customllm-dialog-resolvedUrl-empty");
}

function applyProviderPreset(ev: Event) {
  const select = ev.target as HTMLSelectElement;
  const preset = PROVIDER_PRESETS[select?.value];
  if (!preset) {
    return;
  }
  const doc = select.ownerDocument;
  const setValue = (key: string, value?: string) => {
    if (!value) {
      return;
    }
    const input = doc.querySelector(
      `[data-setting-key="${key}"]`,
    ) as HTMLInputElement | null;
    if (input) {
      input.value = value;
    }
  };
  setValue(`${PREF}.baseUrl`, preset.baseUrl);
  setValue(`${PREF}.model`, preset.model);
  updateEndpointPreview(doc);
}

/**
 * The API key lives in Zotero's shared secret store, so it is never written
 * into the plugin's preferences and shows up in "Manage Keys" like any other
 * service key.
 */
function readApiKeyFromDialog(doc: Document): string {
  if (pendingApiKey !== undefined) {
    return pendingApiKey;
  }
  const field = doc.getElementById(API_KEY_FIELD_ID) as HTMLInputElement | null;
  return field ? field.value : getServiceSecret(SERVICE_ID);
}

// =======================================================
//            Service definition
// =======================================================

export const CustomLLM: TranslateService = {
  id: SERVICE_ID,
  type: "sentence",
  helpUrl: "https://github.com/spx86/zotero-pdf-translate#custom-llm-providers",

  defaultSecret: "",
  secretValidator(secret: string) {
    const trimmed = (secret || "").trim();
    return {
      secret: trimmed,
      status: trimmed.length > 0,
      info: trimmed
        ? getString("service-customllm-secret-set")
        : getString("service-customllm-secret-empty"),
    };
  },

  async translate(data) {
    const cfg = readConfig(prefReader, data.secret);
    assertConfigured(cfg);

    const refreshHandler = addon.api.getTemporaryRefreshHandler({ task: data });
    data.result = getString("status-translating");
    refreshHandler();

    // The instruction part of the prompt is identical for every chunk.
    const { system } = buildPromptParts(
      `${PREF}.prompt`,
      data.langfrom,
      data.langto,
      "",
      data,
    );
    const budget = computeChunkBudget(
      cfg.contextWindow,
      estimateTokens(system),
      cfg.maxTokens || DEFAULT_OUTPUT_RESERVE,
    );
    const chunks = splitTextForContext(data.raw, budget);

    // Each chunk keeps its own slot, so the parts can be translated in
    // parallel and are still joined in the original order.
    const parts: string[] = new Array(chunks.length).fill("");
    let finished = 0;

    const showProgress = () => {
      const body = parts
        .filter((part) => part)
        .join("\n\n")
        .trim();
      if (chunks.length <= 1) {
        data.result = body;
      } else {
        data.result = `${getString("service-customllm-progress", {
          args: { index: finished, total: chunks.length },
        })}\n\n${body}`;
      }
      refreshHandler();
    };

    const translateChunk = async (index: number) => {
      const { system: systemPart, user } = buildPromptParts(
        `${PREF}.prompt`,
        data.langfrom,
        data.langto,
        chunks[index],
        data,
      );
      parts[index] = await requestCompletion(
        cfg,
        systemPart,
        user,
        (partial) => {
          parts[index] = partial;
          showProgress();
        },
      );
      parts[index] = parts[index].trim();
      finished++;
      showProgress();
    };

    await runWithConcurrency(
      chunks.map((_, index) => index),
      cfg.concurrency,
      translateChunk,
    );

    data.result = parts
      .filter((part) => part)
      .join("\n\n")
      .replace(/^\n\n/, "");
    refreshHandler();
  },

  config(settings) {
    // Every dialog session starts with "the key field was not touched".
    pendingApiKey = undefined;

    const providerOptions = Object.entries(PROVIDER_PRESETS).map(
      ([value, preset]) => ({
        value,
        label: getString(preset.labelKey),
      }),
    );

    settings
      .addSetting(
        getString("service-customllm-dialog-provider"),
        `${PREF}.provider`,
        {
          tag: "select",
          namespace: "html",
          styles: {
            minWidth: "400px",
            width: "-moz-available",
          },
          children: providerOptions.map((option) => ({
            tag: "option",
            namespace: "html",
            properties: {
              innerHTML: option.label,
              value: option.value,
            },
          })),
          listeners: [
            {
              type: "change",
              listener: (ev: Event) => applyProviderPreset(ev),
            },
          ],
        },
      )
      .addTextSetting({
        prefKey: `${PREF}.baseUrl`,
        nameKey: "service-customllm-dialog-baseUrl",
        placeholder: "https://api.deepseek.com/v1",
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
          wordBreak: "break-word",
        },
        properties: {
          textContent: getString("service-customllm-dialog-baseUrl-hint"),
        },
      })
      .addStaticRow(getString("service-customllm-dialog-resolvedUrl"), {
        tag: "div",
        namespace: "html",
        id: ENDPOINT_PREVIEW_ID,
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
          wordBreak: "break-all",
        },
        properties: {
          textContent:
            resolveChatEndpoint((getPref(`${PREF}.baseUrl`) as string) || "") ||
            getString("service-customllm-dialog-resolvedUrl-empty"),
        },
      })
      .addTextSetting({
        prefKey: `${PREF}.model`,
        nameKey: "service-customllm-dialog-model",
        placeholder: "deepseek-flash",
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
        },
        properties: {
          textContent: getString("service-customllm-dialog-model-hint"),
        },
      })
      .addStaticRow(getString("service-customllm-dialog-apiKey"), {
        tag: "input",
        namespace: "html",
        id: API_KEY_FIELD_ID,
        attributes: {
          type: "password",
          placeholder: getString("service-customllm-dialog-apiKey-placeholder"),
        },
        styles: {
          minWidth: "400px",
        },
        properties: {
          value: getServiceSecret(SERVICE_ID),
        },
        listeners: [
          {
            type: "input",
            listener: (ev: Event) => {
              pendingApiKey = (ev.target as HTMLInputElement).value;
            },
          },
        ],
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
        },
        properties: {
          textContent: getString("service-customllm-dialog-apiKey-hint"),
        },
      })
      .addNumberSetting({
        prefKey: `${PREF}.contextWindow`,
        nameKey: "service-customllm-dialog-contextWindow",
        min: 1024,
        max: 2000000,
        step: 1024,
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
        },
        properties: {
          textContent: getString("service-customllm-dialog-contextWindow-hint"),
        },
      })
      .addNumberSetting({
        prefKey: `${PREF}.concurrency`,
        nameKey: "service-customllm-dialog-concurrency",
        min: 1,
        max: 16,
        step: 1,
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
        },
        properties: {
          textContent: getString("service-customllm-dialog-concurrency-hint"),
        },
      })
      .addNumberSetting({
        prefKey: `${PREF}.maxTokens`,
        nameKey: "service-customllm-dialog-maxTokens",
        min: 0,
        max: 200000,
        step: 256,
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
        },
        properties: {
          textContent: getString("service-customllm-dialog-maxTokens-hint"),
        },
      })
      .addNumberSetting({
        prefKey: `${PREF}.temperature`,
        nameKey: "service-customllm-dialog-temperature",
        min: 0,
        max: 2,
        step: 0.1,
      })
      .addTextAreaSetting({
        prefKey: `${PREF}.prompt`,
        nameKey: "service-customllm-dialog-prompt",
        placeholder: getString("service-customllm-dialog-prompt"),
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
        },
        properties: {
          textContent: getString("service-gpt-dialog-prompt-hint", {
            args: {
              variables: "${langFrom}, ${langTo}, ${sourceText}",
              required: "${sourceText}",
            },
          }),
        },
      })
      .addCheckboxSetting({
        prefKey: `${PREF}.stream`,
        nameKey: "service-customllm-dialog-stream",
      })
      .addCustomParamsSetting({
        prefKey: `${PREF}.customParams`,
        nameKey: "service-customllm-dialog-custom-request",
        desc: getString("service-customllm-dialog-custom-request-description"),
      })
      .addTextSetting({
        prefKey: `${PREF}.sessionId`,
        nameKey: "service-customllm-dialog-sessionId",
        placeholder: "zpt-...",
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
        },
        properties: {
          textContent: getString("service-customllm-dialog-sessionId-hint"),
        },
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
        },
        properties: {
          textContent: getString("service-customllm-dialog-thinking-hint"),
        },
      })
      .addCustomHeadersSetting({
        prefKey: `${PREF}.customHeaders`,
        nameKey: "service-customllm-dialog-custom-headers",
        desc: getString("service-customllm-dialog-custom-headers-description"),
      })
      .addButton(getString("service-customllm-dialog-test"), "customllm-test", {
        noClose: true,
        callback: async (ev: Event) => {
          const doc = (ev.target as HTMLElement).ownerDocument;
          const status = doc.getElementById(TEST_STATUS_ID);
          const setStatus = (text: string) => {
            if (status) {
              status.textContent = text;
            }
          };
          setStatus(getString("service-customllm-test-running"));
          try {
            const read = (key: string) =>
              readDomValue(doc, key) ?? getPref(key);
            const cfg = readConfig(read, readApiKeyFromDialog(doc));
            const baseUrl = String(read(`${PREF}.baseUrl`) ?? "");
            const result = await testCustomLlmConnection({
              baseUrl,
              model: cfg.model,
              apiKey: cfg.apiKey,
              temperature: cfg.temperature,
              maxTokens: cfg.maxTokens,
              customParams: cfg.customParams,
              customHeaders: cfg.customHeaders,
              sessionId: cfg.sessionId,
            });
            if (result.emptyReply) {
              // The endpoint, the key and the model are fine - the model just
              // did not write any text, which is what a thinking model does
              // when it runs out of output budget while thinking.
              setStatus(
                getString("service-customllm-test-ok-empty", {
                  args: {
                    model: cfg.model,
                    ms: result.elapsedMs,
                    tokens: result.reasoningTokens,
                    reason: result.finishReason || "-",
                  },
                }),
              );
            } else {
              setStatus(
                `${getString("service-customllm-test-ok", {
                  args: {
                    model: cfg.model,
                    ms: result.elapsedMs,
                  },
                })}\n${result.reply}`,
              );
            }
          } catch (e) {
            setStatus(
              `${getString("service-customllm-test-fail")}\n${
                e instanceof Error ? e.message : String(e)
              }`,
            );
          }
        },
      })
      .addStaticRow("", {
        tag: "div",
        namespace: "html",
        id: TEST_STATUS_ID,
        styles: {
          color: "var(--fill-secondary)",
          fontSize: "0.9em",
          maxWidth: "400px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        },
        properties: {
          textContent: "",
        },
      })
      .onSave((data) => {
        const prompt = String(data[`${PREF}.prompt`] || "");
        if (!hasSourceTextPlaceholder(prompt)) {
          return getString("service-gpt-dialog-prompt-required", {
            args: { placeholder: "${sourceText}" },
          });
        }
        // Only touch the shared secret store when the field was edited.
        if (pendingApiKey !== undefined) {
          setServiceSecret(SERVICE_ID, pendingApiKey.trim());
          pendingApiKey = undefined;
        }
        return true;
      });
  },
};
