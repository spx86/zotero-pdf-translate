import {
  computeChunkBudget,
  estimateTokens,
  splitTextForContext,
} from "../src/utils/llmChunk";
import {
  extractResponseText,
  findHeaderUnsafeChar,
  findUnsafeHeader,
  formatCodePoint,
  inspectResponse,
  normalizeApiKey,
  parseCustomHeaders,
  parseCustomParams,
  resolveChatEndpoint,
} from "../src/modules/services/openaiResponse";

describe("Custom LLM: Base URL resolution", function () {
  it("returns an empty string for an empty or blank Base URL", function () {
    assert.strictEqual(resolveChatEndpoint(""), "");
    assert.strictEqual(resolveChatEndpoint("   "), "");
  });

  it("returns an empty string for a non-http URL", function () {
    assert.strictEqual(resolveChatEndpoint("ftp://example.com"), "");
    assert.strictEqual(resolveChatEndpoint("not a url"), "");
  });

  it("adds /v1/chat/completions when the Base URL has no path", function () {
    assert.strictEqual(
      resolveChatEndpoint("https://api.deepseek.com"),
      "https://api.deepseek.com/v1/chat/completions",
    );
  });

  it("adds /chat/completions to a versioned Base URL", function () {
    assert.strictEqual(
      resolveChatEndpoint("https://api.deepseek.com/v1"),
      "https://api.deepseek.com/v1/chat/completions",
    );
    assert.strictEqual(
      resolveChatEndpoint("https://opencode.ai/zen/v1"),
      "https://opencode.ai/zen/v1/chat/completions",
    );
  });

  it("ignores trailing slashes", function () {
    assert.strictEqual(
      resolveChatEndpoint("https://api.deepseek.com/v1///"),
      "https://api.deepseek.com/v1/chat/completions",
    );
  });

  it("keeps an explicit chat completions endpoint untouched", function () {
    assert.strictEqual(
      resolveChatEndpoint("https://opencode.ai/zen/v1/chat/completions"),
      "https://opencode.ai/zen/v1/chat/completions",
    );
  });

  it("keeps an explicit Responses API endpoint untouched", function () {
    assert.strictEqual(
      resolveChatEndpoint("https://opencode.ai/zen/v1/responses"),
      "https://opencode.ai/zen/v1/responses",
    );
  });

  it("keeps the port of a local server", function () {
    assert.strictEqual(
      resolveChatEndpoint("http://localhost:11434/v1"),
      "http://localhost:11434/v1/chat/completions",
    );
  });
});

describe("Custom LLM: response parsing", function () {
  it("reads a non-streaming chat completion", function () {
    const body = JSON.stringify({
      choices: [{ message: { role: "assistant", content: "你好" } }],
    });
    assert.strictEqual(extractResponseText(body, false), "你好");
  });

  it("reads an SSE chat completion", function () {
    const body = [
      'data: {"choices":[{"delta":{"content":"He"}}]}',
      "",
      'data: {"choices":[{"delta":{"content":"llo"}}]}',
      "",
      "data: [DONE]",
      "",
    ].join("\n");
    assert.strictEqual(extractResponseText(body, false), "Hello");
  });

  it("ignores reasoning deltas of thinking models", function () {
    const body = [
      'data: {"choices":[{"delta":{"reasoning_content":"let me think"}}]}',
      'data: {"choices":[{"delta":{"content":"答案"}}]}',
      "data: [DONE]",
    ].join("\n");
    assert.strictEqual(extractResponseText(body, false), "答案");
  });

  it("reads a non-streaming Responses API payload", function () {
    const body = JSON.stringify({
      output: [
        { type: "reasoning", summary: [] },
        {
          type: "message",
          content: [{ type: "output_text", text: "translated" }],
        },
      ],
    });
    assert.strictEqual(extractResponseText(body, true), "translated");
  });

  it("reads a Responses API SSE stream", function () {
    const body = [
      "event: response.created",
      'data: {"type":"response.created"}',
      "",
      "event: response.output_text.delta",
      'data: {"type":"response.output_text.delta","delta":"par"}',
      "",
      "event: response.output_text.delta",
      'data: {"type":"response.output_text.delta","delta":"t"}',
      "",
      "event: response.completed",
      'data: {"type":"response.completed"}',
      "",
    ].join("\n");
    assert.strictEqual(extractResponseText(body, true), "part");
  });

  it("returns an empty string for an empty or malformed body", function () {
    assert.strictEqual(extractResponseText("", false), "");
    assert.strictEqual(extractResponseText("   ", false), "");
    assert.strictEqual(extractResponseText("oops", false), "");
  });
});

describe("Custom LLM: custom request parameters", function () {
  it("keeps extra fields and drops the ones the service owns", function () {
    const parsed = parseCustomParams(
      JSON.stringify({
        model: "ignored",
        messages: ["ignored"],
        temperature: 0,
        stream: false,
        top_p: 0.9,
        thinking: { type: "disabled" },
      }),
    );
    assert.deepEqual(parsed, { top_p: 0.9, thinking: { type: "disabled" } });
  });

  it("returns an empty object for invalid JSON", function () {
    assert.deepEqual(parseCustomParams("{oops"), {});
    assert.deepEqual(parseCustomParams(""), {});
  });
});

describe("Context window: token estimation", function () {
  it("counts nothing for an empty string", function () {
    assert.strictEqual(estimateTokens(""), 0);
  });

  it("counts CJK characters as at least one token each", function () {
    assert.strictEqual(estimateTokens("你好世界"), 4);
  });

  it("counts latin text more cheaply than CJK text", function () {
    assert.strictEqual(estimateTokens("hello"), 2);
    assert.isBelow(estimateTokens("hello world"), estimateTokens("你好世界你"));
  });

  it("never underestimates the common 4-chars-per-token rule", function () {
    const text = "a".repeat(400);
    assert.isAtLeast(estimateTokens(text), 100);
  });
});

describe("Context window: chunking", function () {
  it("returns no chunk for empty text", function () {
    assert.deepEqual(splitTextForContext("", 100), []);
  });

  it("keeps a text that fits in a single chunk", function () {
    const text = "A short abstract about translation.";
    assert.deepEqual(splitTextForContext(text, 1000), [text]);
  });

  it("splits long text into chunks that each fit the budget", function () {
    const text = Array.from(
      { length: 200 },
      (_, i) => `This is sentence number ${i} of a rather long paragraph. `,
    ).join("");
    const budget = 200;
    const chunks = splitTextForContext(text, budget);
    assert.isAbove(chunks.length, 1);
    for (const chunk of chunks) {
      assert.isAtMost(estimateTokens(chunk), budget);
    }
  });

  it("preserves the original text when the chunks are joined", function () {
    const text = Array.from(
      { length: 60 },
      (_, i) =>
        `Paragraph ${i} has some content.\n\nAnd a second sentence here.\n\n`,
    ).join("");
    const chunks = splitTextForContext(text, 120);
    assert.isAbove(chunks.length, 1);
    assert.strictEqual(chunks.join(""), text);
  });

  it("prefers paragraph boundaries over mid-sentence cuts", function () {
    const paragraph = "Sentence one is here. Sentence two is here. ";
    const text = `${paragraph}\n\n${paragraph}\n\n${paragraph}`;
    const chunks = splitTextForContext(text, estimateTokens(paragraph) + 10);
    assert.strictEqual(chunks.length, 3);
    // The separator stays attached to the end of the preceding paragraph.
    assert.strictEqual(chunks[0], `${paragraph}\n\n`);
    assert.strictEqual(chunks[1], `${paragraph}\n\n`);
    assert.strictEqual(chunks[2], paragraph);
  });

  it("hard-splits a single sentence that is longer than the budget", function () {
    const text = "x".repeat(3000);
    const chunks = splitTextForContext(text, 100);
    assert.isAbove(chunks.length, 1);
    assert.strictEqual(chunks.join(""), text);
    for (const chunk of chunks) {
      assert.isAtMost(estimateTokens(chunk), 100);
    }
  });

  it("does not split when the budget is disabled", function () {
    const text = "some text";
    assert.deepEqual(splitTextForContext(text, 0), [text]);
  });
});

describe("Context window: request budget", function () {
  it("reserves room for the prompt and the answer", function () {
    const budget = computeChunkBudget(264000, 500, 4096);
    assert.isBelow(budget, 264000);
    assert.isAbove(budget, 240000);
  });

  it("shrinks when the prompt or the answer needs more room", function () {
    const base = computeChunkBudget(100000, 100, 1000);
    assert.isBelow(computeChunkBudget(100000, 20000, 1000), base);
    assert.isBelow(computeChunkBudget(100000, 100, 40000), base);
  });

  it("always leaves a usable budget", function () {
    assert.isAtLeast(computeChunkBudget(100, 100000, 100000), 256);
  });
});

describe("Custom LLM: API key hygiene", function () {
  it("drops invisible copy-paste artifacts", function () {
    assert.strictEqual(
      normalizeApiKey("  sk-abc\u200Bdef\uFEFF  "),
      "sk-abcdef",
    );
    assert.strictEqual(normalizeApiKey("sk-abc\u00ADdef"), "sk-abcdef");
  });

  it("drops control characters and surrounding whitespace", function () {
    assert.strictEqual(normalizeApiKey("\n\tsk-abc\r\n"), "sk-abc");
    assert.strictEqual(normalizeApiKey("sk-abc\u0000"), "sk-abc");
  });

  it("keeps an ordinary key untouched", function () {
    const key = "sk-1234567890abcdefGHIJKL";
    assert.strictEqual(normalizeApiKey(key), key);
  });

  it("accepts a key made of latin-1 characters", function () {
    assert.isNull(findHeaderUnsafeChar("sk-abcXYZ0189._~+/-="));
  });

  it("locates the character that cannot go into a header", function () {
    const key = "a".repeat(277) + "\u{1F524}";
    const unsafe = findHeaderUnsafeChar(key);
    assert.isDefined(unsafe);
    // The emoji is a surrogate pair: the high half is reported.
    assert.strictEqual(unsafe!.index, 277);
    assert.strictEqual(unsafe!.codePoint, 0xd83d);
    assert.strictEqual(formatCodePoint(unsafe!.codePoint), "U+D83D");
  });

  it("flags CJK text that was pasted instead of a key", function () {
    assert.isDefined(findHeaderUnsafeChar("sk-\u5bc6\u94a5"));
  });
});

describe("Custom LLM: custom headers", function () {
  it("keeps scalar header values", function () {
    assert.deepEqual(
      parseCustomHeaders(
        JSON.stringify({ "x-route": "eu", "x-retries": 3, "x-flag": true }),
      ),
      { "x-route": "eu", "x-retries": "3", "x-flag": "true" },
    );
  });

  it("drops nested objects, nulls and blank names", function () {
    assert.deepEqual(
      parseCustomHeaders(
        JSON.stringify({
          "x-ok": "1",
          "x-obj": { a: 1 },
          "x-null": null,
          "  ": "x",
        }),
      ),
      { "x-ok": "1" },
    );
  });

  it("returns an empty object for invalid JSON or a non-object", function () {
    assert.deepEqual(parseCustomHeaders("{oops"), {});
    assert.deepEqual(parseCustomHeaders(""), {});
    assert.deepEqual(parseCustomHeaders("[1,2]"), {});
    assert.deepEqual(parseCustomHeaders('"text"'), {});
  });

  it("names the header that cannot be sent", function () {
    const unsafe = findUnsafeHeader({
      "Content-Type": "application/json",
      "x-gateway-route": "eu",
      "x-broken": `abc\u{1F524}`,
    });
    assert.isDefined(unsafe);
    assert.strictEqual(unsafe!.name, "x-broken");
    assert.strictEqual(unsafe!.index, 3);
  });

  it("accepts a header set that is latin-1 clean", function () {
    assert.isNull(
      findUnsafeHeader({
        Authorization: "Bearer sk-abc",
        "User-Agent": "Zotero-PDF-Translate/2.4.7 (Custom LLM)",
        "x-opencode-session": "zpt-0123456789abcdef",
      }),
    );
  });
});

describe("Custom LLM: response diagnostics", function () {
  /** The shape DeepSeek returns when thinking eats the whole output budget. */
  const reasoningOnly = JSON.stringify({
    id: "x",
    object: "chat.completion",
    model: "deepseek-flash",
    choices: [
      {
        index: 0,
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
  });

  it("detects an answer that only contains reasoning", function () {
    const info = inspectResponse(reasoningOnly);
    assert.isNotNull(info);
    assert.isFalse(info!.hasContent);
    assert.isTrue(info!.hasReasoning);
    assert.strictEqual(info!.reasoningTokens, 16);
    assert.strictEqual(info!.finishReason, "length");
  });

  it("reports a normal answer as content", function () {
    const info = inspectResponse(
      JSON.stringify({
        choices: [
          {
            message: { role: "assistant", content: "pong" },
            finish_reason: "stop",
          },
        ],
        usage: { completion_tokens: 1 },
      }),
    );
    assert.isTrue(info!.hasContent);
    assert.isFalse(info!.hasReasoning);
    assert.strictEqual(info!.finishReason, "stop");
  });

  it("counts reasoning reported only through usage", function () {
    const info = inspectResponse(
      JSON.stringify({
        choices: [{ message: { content: "" }, finish_reason: "length" }],
        usage: { completion_tokens_details: { reasoning_tokens: 42 } },
      }),
    );
    assert.isTrue(info!.hasReasoning);
    assert.strictEqual(info!.reasoningTokens, 42);
  });

  it("returns null for bodies it cannot read", function () {
    assert.isNull(inspectResponse(""));
    assert.isNull(inspectResponse("not json"));
    assert.isNull(inspectResponse('{"error": {"message": "nope"}}'));
  });
});
