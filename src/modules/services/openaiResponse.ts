/**
 * Pure helpers for talking to an OpenAI-compatible API.
 *
 * This module has no dependency on Zotero or on the plugin preferences, so it
 * can be unit-tested outside of Zotero and reused by every LLM service.
 */

/**
 * Invisible characters that regularly sneak in when a key is copied from a web
 * page: zero-width spaces, bidi marks, word joiners, BOM and soft hyphens.
 */
const INVISIBLE_CHARS =
  /[\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;

/** C0/C1 control characters, including tab and newline. */
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;

/**
 * Clean up a pasted credential.
 *
 * Invisible copy-paste artifacts and control characters are dropped, because
 * they are never part of a real key and would otherwise be sent verbatim.
 */
export function normalizeApiKey(raw: string): string {
  return (raw || "")
    .replace(INVISIBLE_CHARS, "")
    .replace(CONTROL_CHARS, "")
    .trim();
}

/**
 * Find the first character that cannot be put into an HTTP header value.
 *
 * Header values are restricted to ISO-8859-1, so anything above U+00FF makes
 * `Headers`/`setRequestHeader` throw a cryptic WebIDL error such as
 * "Cannot convert argument 2 to ByteString". Detecting it ourselves lets us
 * report what is actually wrong with the credential.
 */
export function findHeaderUnsafeChar(
  value: string,
): { index: number; codePoint: number } | null {
  for (let i = 0; i < (value || "").length; i++) {
    const code = value.charCodeAt(i);
    if (code > 0xff) {
      return { index: i, codePoint: code };
    }
  }
  return null;
}

/** Format a UTF-16 code unit as `U+XXXX` for an error message. */
export function formatCodePoint(code: number): string {
  return `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
}

/**
 * Find the first header whose value cannot be put into an HTTP header.
 *
 * Returns the header name together with the offending position, so the user is
 * told exactly which setting to fix.
 */
export function findUnsafeHeader(
  headers: Record<string, string>,
): { name: string; index: number; codePoint: number } | null {
  for (const [name, value] of Object.entries(headers || {})) {
    const unsafe = findHeaderUnsafeChar(value);
    if (unsafe) {
      return { name, ...unsafe };
    }
  }
  return null;
}

/**
 * Parse the "custom headers" JSON object.
 *
 * Only scalar values are kept: an HTTP header value must be a string, so
 * nested objects are dropped rather than silently stringified into `[object
 * Object]`.
 */
export function parseCustomHeaders(raw: string): Record<string, string> {
  let parsed: any;
  try {
    parsed = JSON.parse(raw || "{}");
  } catch (e) {
    return {};
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  const headers: Record<string, string> = {};
  for (const [rawName, value] of Object.entries(parsed)) {
    const name = rawName.trim();
    if (!name) {
      continue;
    }
    if (value === null || value === undefined || typeof value === "object") {
      continue;
    }
    headers[name] = String(value);
  }
  return headers;
}

/**
 * Parse a stored custom-request JSON string.
 *
 * Filters out parameters that are already defined by the service itself
 * (for both Chat Completions and Responses API).
 */
export function parseCustomParams(
  storedCustomParams: string,
): Record<string, any> {
  try {
    const customParams = JSON.parse(storedCustomParams || "{}");
    const standardParams = [
      "model",
      "messages",
      "input",
      "temperature",
      "stream",
    ];
    return Object.fromEntries(
      Object.entries(customParams).filter(
        ([key]) => !standardParams.includes(key),
      ),
    );
  } catch (e) {
    return {};
  }
}

export interface ParsedResponse {
  content: string;
  finished: boolean;
}

/**
 * Detect if the endpoint URL is for OpenAI Responses API
 */
export function isResponsesApiEndpoint(url: string): boolean {
  return url.endsWith("/responses") || url.includes("/responses?");
}

/**
 * Parse streaming response for OpenAI Responses API
 * Event format: { "type": "response.output_text.delta", "delta": "text", ... }
 */
export function parseResponsesApiStreamResponse(obj: any): ParsedResponse {
  const eventType = obj.type || "";

  // Text delta event - this is the main event for streaming text
  // Format: { "type": "response.output_text.delta", "delta": "In", ... }
  if (eventType === "response.output_text.delta") {
    return {
      content: obj.delta || "",
      finished: false,
    };
  }

  // Completion events
  if (
    eventType === "response.completed" ||
    eventType === "response.done" ||
    eventType === "response.failed" ||
    eventType === "response.incomplete"
  ) {
    return {
      content: "",
      finished: true,
    };
  }

  // Other events we don't need to extract content from:
  // response.created, response.in_progress, response.output_item.added,
  // response.content_part.added, response.output_text.done, etc.
  return { content: "", finished: false };
}

/**
 * Parse non-streaming response for OpenAI Responses API
 * Response format: { output: [{ type: "message", content: [{ type: "output_text", text: "..." }] }] }
 */
export function parseResponsesApiNonStreamResponse(obj: any): string {
  if (obj.output && Array.isArray(obj.output)) {
    for (const item of obj.output) {
      if (item.type === "message" && item.content) {
        for (const content of item.content) {
          if (content.type === "output_text") {
            return content.text || "";
          }
        }
      }
    }
  }
  return "";
}

export function parseStreamResponse(obj: any): ParsedResponse {
  // Handle OpenAI format (choices array with delta)
  if (obj.choices && obj.choices[0]) {
    const choice = obj.choices[0];
    return {
      content: choice.delta?.content || "",
      finished:
        choice.finish_reason !== undefined && choice.finish_reason !== null,
    };
  }
  // Handle Ollama native format (direct message)
  else if (obj.message) {
    return {
      content: obj.message.content || "",
      finished: obj.done === true,
    };
  }
  return { content: "", finished: false };
}

export function parseNonStreamResponse(obj: any): string {
  // Handle OpenAI format (choices array)
  if (obj.choices && obj.choices[0]) {
    return obj.choices[0].message.content || "";
  }
  // Handle Ollama native format (direct message)
  else if (obj.message && obj.message.content) {
    return obj.message.content;
  }
  return "";
}

/**
 * Extract the text carried by a single SSE line.
 *
 * Lines that are not `data:` lines, are `[DONE]`, or hold a partial JSON
 * object yield an empty string.
 */
export function extractDeltaFromLine(
  line: string,
  useResponsesApi: boolean,
): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) {
    return "";
  }
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") {
    return "";
  }
  try {
    const obj = JSON.parse(payload);
    return useResponsesApi
      ? parseResponsesApiStreamResponse(obj).content
      : parseStreamResponse(obj).content;
  } catch (e) {
    // A partial JSON object - the final text is re-parsed from the full body.
    return "";
  }
}

/**
 * Extract the answer text from a complete response body.
 *
 * Handles both a plain JSON body (non-streaming, or a gateway that ignored
 * `stream: true`) and an SSE body.
 */
export function extractResponseText(
  rawBody: string,
  useResponsesApi: boolean,
): string {
  const body = (rawBody || "").trim();
  if (!body) {
    return "";
  }
  if (body.startsWith("{")) {
    try {
      const obj = JSON.parse(body);
      return useResponsesApi
        ? parseResponsesApiNonStreamResponse(obj)
        : parseNonStreamResponse(obj);
    } catch (e) {
      // Fall through to the SSE parser.
    }
  }
  let result = "";
  for (const line of body.split("\n")) {
    result += extractDeltaFromLine(line, useResponsesApi);
  }
  return result;
}

/**
 * Turn a user-supplied Base URL into the URL actually requested.
 *
 * Accepted inputs:
 * - a base URL without a path: `https://api.deepseek.com` -> `/v1/chat/completions`
 * - a versioned base URL: `https://api.deepseek.com/v1` -> `/v1/chat/completions`
 * - a full endpoint: `https://opencode.ai/zen/v1/chat/completions` (kept as is)
 * - a Responses API endpoint: `https://opencode.ai/zen/v1/responses` (kept as is)
 *
 * @returns the resolved URL, or an empty string if `baseUrl` is not a valid
 * http(s) URL.
 */
export function resolveChatEndpoint(baseUrl: string): string {
  const raw = (baseUrl || "").trim();
  if (!raw) {
    return "";
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch (e) {
    return "";
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "";
  }
  const path = url.pathname.replace(/\/+$/, "");
  if (!path) {
    url.pathname = "/v1/chat/completions";
  } else if (/\/(chat\/completions|completions|responses)$/i.test(path)) {
    url.pathname = path;
  } else {
    url.pathname = `${path}/chat/completions`;
  }
  url.hash = "";
  return url.toString();
}
