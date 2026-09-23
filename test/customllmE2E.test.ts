import "./addonStub";

import {
  CustomLLM,
  testCustomLlmConnection,
} from "../src/modules/services/customllm";
import { getPref, setPref } from "../src/utils/prefs";

/**
 * End-to-end test of the Custom LLM request path.
 *
 * Zotero runs a small HTTP server (enabled for the test profile on port
 * 23124), so a fake OpenAI-compatible endpoint can be registered and the
 * service can be pointed at it. This exercises the real header set, the real
 * request body and the real response parsing - the parts that a unit test of
 * `buildHeaders` alone would not cover.
 */
const SERVER_PORT = 23124;
const ENDPOINT_PATH = "/test/customllm-e2e/chat/completions";
const BASE_URL = `http://127.0.0.1:${SERVER_PORT}/test/customllm-e2e`;

interface Captured {
  headers: Record<string, string>;
  body: any;
}

interface Reply {
  status: number;
  body: string;
}

let captured: Captured | null = null;
let requests: Captured[] = [];

/** Register a fake endpoint. `reply` may depend on the request. */
function registerEndpoint(
  reply: Reply | ((body: any, index: number) => Reply),
) {
  const endpoints = (Zotero as any).Server?.Endpoints;
  if (!endpoints) {
    throw new Error("Zotero.Server.Endpoints is not available");
  }
  const Endpoint: any = function () {};
  Endpoint.prototype = {
    supportedMethods: ["POST"],
    supportedDataTypes: ["application/json"],
    init: async (options: any) => {
      captured = { headers: options.headers || {}, body: options.data };
      const index = requests.length;
      requests.push(captured);
      const result =
        typeof reply === "function" ? reply(options.data, index) : reply;
      return [result.status, "application/json", result.body];
    },
  };
  endpoints[ENDPOINT_PATH] = Endpoint;
}

/** Reply with the source text, so chunk order can be verified. */
function echoSource(body: any): Reply {
  return {
    status: 200,
    body: JSON.stringify({
      choices: [{ message: { content: body.messages[1].content } }],
    }),
  };
}

function unregisterEndpoint() {
  const endpoints = (Zotero as any).Server?.Endpoints;
  if (endpoints) {
    delete endpoints[ENDPOINT_PATH];
  }
}

function makeTask(raw: string): any {
  return {
    id: "e2e-task",
    type: "text",
    raw,
    result: "",
    audio: [],
    service: "customllm",
    candidateServices: [],
    itemId: undefined,
    langfrom: "en",
    langto: "zh-CN",
    status: "waiting",
    extraTasks: [],
    secret: "sk-e2e-test-key",
  };
}

const saved: Record<string, unknown> = {};

function applyPrefs(overrides: Record<string, unknown>) {
  const values: Record<string, unknown> = {
    "customllm.baseUrl": BASE_URL,
    "customllm.model": "e2e-model",
    "customllm.stream": false,
    "customllm.sessionId": "zpt-e2e-session",
    "customllm.customHeaders": JSON.stringify({ "x-gateway-route": "eu" }),
    "customllm.customParams": "",
    "customllm.maxTokens": "0",
    "customllm.temperature": "1.0",
    "customllm.concurrency": "3",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) {
    if (!(key in saved)) {
      saved[key] = getPref(key);
    }
    setPref(key, value as any);
  }
}

function restorePrefs() {
  for (const [key, value] of Object.entries(saved)) {
    setPref(key, value as any);
  }
}

function reset() {
  unregisterEndpoint();
  restorePrefs();
  captured = null;
  requests = [];
}

/** Six paragraphs, long enough that the text needs several parts. */
function longText(): string {
  return Array.from(
    { length: 6 },
    (_, i) => `Paragraph number ${i}. ${"word ".repeat(60)}`,
  ).join("\n\n");
}

describe("Custom LLM: end-to-end request", function () {
  afterEach(reset);

  it("sends the gateway headers and parses a non-streaming answer", async function () {
    registerEndpoint({
      status: 200,
      body: JSON.stringify({
        choices: [{ message: { role: "assistant", content: "你好，世界" } }],
      }),
    });
    applyPrefs({});

    const task = makeTask("Hello, world");
    await CustomLLM.translate(task);

    assert.strictEqual(task.result, "你好，世界");
    assert.isNotNull(captured);

    const headers = captured!.headers;
    // Required by the OpenCode Go/Zen gateways.
    assert.strictEqual(headers["x-opencode-session"], "zpt-e2e-session");
    // The client must identify itself instead of using a generic library name.
    assert.include(headers["user-agent"], "Zotero-PDF-Translate");
    assert.strictEqual(headers["authorization"], "Bearer sk-e2e-test-key");
    // User supplied headers are merged in.
    assert.strictEqual(headers["x-gateway-route"], "eu");
    assert.strictEqual(headers["content-type"], "application/json");

    // The prompt must reach the model, and the model id must be the one set
    // in the settings.
    assert.strictEqual(captured!.body.model, "e2e-model");
    assert.strictEqual(captured!.body.stream, false);
    assert.isArray(captured!.body.messages);
    assert.strictEqual(captured!.body.messages[1].content, "Hello, world");
    assert.include(captured!.body.messages[0].content, "zh-CN");
  });

  it("parses a streamed SSE answer", async function () {
    const sse = [
      'data: {"choices":[{"delta":{"content":"流"}}]}',
      "",
      'data: {"choices":[{"delta":{"content":"式"}}]}',
      "",
      "data: [DONE]",
      "",
    ].join("\n");
    registerEndpoint({ status: 200, body: sse });
    applyPrefs({ "customllm.stream": true });

    const task = makeTask("streaming");
    await CustomLLM.translate(task);

    assert.strictEqual(task.result, "流式");
  });

  it("reports the provider error body on a rejected request", async function () {
    registerEndpoint({
      status: 400,
      body: JSON.stringify({
        type: "error",
        error: {
          type: "MissingSessionID",
          message: "Request is missing x-opencode-session",
        },
      }),
    });
    applyPrefs({ "customllm.sessionId": "" });

    let message = "";
    try {
      await CustomLLM.translate(makeTask("Hello"));
    } catch (e: any) {
      message = e?.message || String(e);
    }
    assert.include(message, "HTTP 400");
    assert.include(message, "MissingSessionID");
  });

  it("lets a custom header override a built-in one", async function () {
    registerEndpoint({
      status: 200,
      body: JSON.stringify({ choices: [{ message: { content: "ok" } }] }),
    });
    applyPrefs({
      "customllm.customHeaders": JSON.stringify({
        "User-Agent": "my-agent/1.0",
      }),
    });

    await CustomLLM.translate(makeTask("Hello"));

    assert.strictEqual(captured!.headers["user-agent"], "my-agent/1.0");
  });
});

describe("Custom LLM: long text", function () {
  afterEach(reset);

  it("translates the parts in parallel and joins them in the original order", async function () {
    registerEndpoint(echoSource);
    applyPrefs({
      "customllm.contextWindow": "1024",
      "customllm.concurrency": "3",
      "customllm.maxTokens": "64",
    });

    const task = makeTask(longText());
    await CustomLLM.translate(task);

    // The text needed more than one request, and every request carried a
    // different part of it.
    assert.isAbove(requests.length, 1);
    const sent = requests.map((r) => r.body.messages[1].content);
    assert.strictEqual(new Set(sent).size, sent.length);

    // The parts are joined back in the original document order, regardless of
    // the order in which the requests finished.
    assert.strictEqual(
      task.result,
      sent
        .map((part) => part.trim())
        .join("\n\n")
        .trim(),
    );
    assert.isTrue(task.result.startsWith("Paragraph number 0."));
    assert.include(task.result, "Paragraph number 5.");
  });

  it("uses a single request when the text fits", async function () {
    registerEndpoint(echoSource);
    applyPrefs({ "customllm.contextWindow": "264000" });

    await CustomLLM.translate(makeTask("A short sentence."));

    assert.strictEqual(requests.length, 1);
  });

  it("stops starting new parts once one of them fails", async function () {
    registerEndpoint((body, index) =>
      index === 1
        ? { status: 500, body: "provider exploded" }
        : echoSource(body),
    );
    applyPrefs({
      "customllm.contextWindow": "1024",
      "customllm.concurrency": "1",
      "customllm.maxTokens": "64",
    });

    let message = "";
    try {
      await CustomLLM.translate(makeTask(longText()));
    } catch (e: any) {
      message = e?.message || String(e);
    }

    assert.include(message, "HTTP 500");
    // The first part succeeded, the second failed, and the remaining parts
    // were never requested.
    assert.strictEqual(requests.length, 2);
  });
});

describe("Custom LLM: thinking models", function () {
  afterEach(reset);

  /** What DeepSeek returns when reasoning eats the whole output budget. */
  function reasoningOnlyReply(): Reply {
    return {
      status: 200,
      body: JSON.stringify({
        choices: [
          {
            message: {
              role: "assistant",
              content: "",
              reasoning_content: "The user is asking a connectivity test.",
            },
            finish_reason: "length",
          },
        ],
        usage: {
          completion_tokens: 16,
          completion_tokens_details: { reasoning_tokens: 16 },
        },
      }),
    };
  }

  it("still reports a successful connection when only reasoning came back", async function () {
    registerEndpoint(reasoningOnlyReply);
    applyPrefs({});

    const result = await testCustomLlmConnection({
      baseUrl: BASE_URL,
      model: "e2e-model",
      apiKey: "sk-e2e-test-key",
      sessionId: "zpt-e2e-session",
    });

    // Regression: this used to throw "the model returned an empty answer" and
    // was shown as a failed connection, even though the request succeeded.
    assert.isTrue(result.emptyReply);
    assert.strictEqual(result.reply, "");
    assert.strictEqual(result.reasoningTokens, 16);
    assert.strictEqual(result.finishReason, "length");
  });

  it("does not cap the answer of the connection test", async function () {
    registerEndpoint(echoSource);
    applyPrefs({ "customllm.maxTokens": "0" });

    await testCustomLlmConnection({
      baseUrl: BASE_URL,
      model: "e2e-model",
      apiKey: "sk-e2e-test-key",
    });

    // No max_tokens is sent, so a thinking model has room to answer.
    assert.isUndefined(captured!.body.max_tokens);
  });

  it("sends the session header and the custom headers when testing", async function () {
    registerEndpoint(echoSource);
    applyPrefs({});

    await testCustomLlmConnection({
      baseUrl: BASE_URL,
      model: "e2e-model",
      apiKey: "sk-e2e-test-key",
      sessionId: "zpt-e2e-session",
      customHeaders: { "x-gateway-route": "eu" },
    });

    // Regression: the test button used to drop both of these.
    assert.strictEqual(
      captured!.headers["x-opencode-session"],
      "zpt-e2e-session",
    );
    assert.strictEqual(captured!.headers["x-gateway-route"], "eu");
  });

  it("explains that a reasoning-only answer is not a translation", async function () {
    registerEndpoint(reasoningOnlyReply);
    applyPrefs({});

    let message = "";
    try {
      await CustomLLM.translate(makeTask("Hello, world"));
    } catch (e: any) {
      message = e?.message || String(e);
    }

    assert.include(message, "customllm-error-empty-reasoning");
  });
});
