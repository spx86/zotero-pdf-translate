/**
 * Helpers to keep a single LLM request inside the model's context window.
 *
 * Token counts are deliberately *conservative*: they over-estimate, so a text
 * is split slightly earlier than strictly necessary. This keeps the feature
 * provider-agnostic - we never assume a specific tokenizer is available.
 */

/**
 * Matches CJK ideographs, kana, Hangul and full-width forms.
 *
 * A non-global RegExp is used on purpose so that `test()` stays stateless.
 */
const WIDE_CHAR =
  /[\u1100-\u11FF\u2E80-\u303F\u3040-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uA960-\uA97F\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;

/**
 * Estimated cost of one UTF-16 code unit, in tokens.
 *
 * - CJK / kana / Hangul characters are usually around 0.6 token each; count 1.
 * - Latin, digits and spaces are usually around 4 characters per token;
 *   count 3 to stay on the safe side.
 */
function unitCost(unit: string): number {
  return WIDE_CHAR.test(unit) ? 1 : 1 / 3;
}

/**
 * Conservatively estimate how many tokens `text` occupies.
 */
export function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }
  let cost = 0;
  for (let i = 0; i < text.length; i++) {
    cost += unitCost(text[i]);
  }
  return Math.ceil(cost);
}

/**
 * Boundary candidates, ordered from the most to the least desirable split
 * point: paragraph, sentence, clause, then any whitespace.
 */
const BOUNDARIES: RegExp[] = [
  /\n[ \t]*\n+/,
  /(?<=[。！？!?；;])[ \t]*\n?/,
  /(?<=[，,、：:）)】」》])[ \t]*/,
  /\s+/,
];

/**
 * Split `text` on `separator`, keeping the separator attached to the end of
 * the preceding piece so that joining the pieces restores the original text.
 */
function splitKeepingSeparator(text: string, separator: RegExp): string[] {
  const flags = separator.flags.includes("g")
    ? separator.flags
    : `${separator.flags}g`;
  const re = new RegExp(separator.source, flags);
  const pieces: string[] = [];
  let last = 0;
  for (const match of text.matchAll(re)) {
    const end = (match.index ?? 0) + match[0].length;
    if (end <= last) {
      continue;
    }
    pieces.push(text.slice(last, end));
    last = end;
  }
  if (last < text.length) {
    pieces.push(text.slice(last));
  }
  return pieces;
}

/**
 * Last resort: cut the text every `maxTokens` estimated tokens.
 *
 * Used when a single sentence is longer than the whole budget.
 */
function hardSplit(text: string, maxTokens: number): string[] {
  const budget = Math.max(1, maxTokens);
  const chunks: string[] = [];
  let start = 0;
  let cost = 0;
  for (let i = 0; i < text.length; i++) {
    const c = unitCost(text[i]);
    if (cost + c > budget && i > start) {
      chunks.push(text.slice(start, i));
      start = i;
      cost = 0;
    }
    cost += c;
  }
  if (start < text.length) {
    chunks.push(text.slice(start));
  }
  return chunks;
}

function chunkAtDepth(
  text: string,
  maxTokens: number,
  depth: number,
): string[] {
  if (estimateTokens(text) <= maxTokens) {
    return [text];
  }

  if (depth >= BOUNDARIES.length) {
    return hardSplit(text, maxTokens);
  }

  const pieces = splitKeepingSeparator(text, BOUNDARIES[depth]);
  if (pieces.length <= 1) {
    return chunkAtDepth(text, maxTokens, depth + 1);
  }

  const chunks: string[] = [];
  let buffer = "";
  let bufferTokens = 0;

  for (const piece of pieces) {
    const pieceTokens = estimateTokens(piece);
    if (pieceTokens > maxTokens) {
      // The piece alone does not fit: flush and split it further.
      if (buffer) {
        chunks.push(buffer);
        buffer = "";
        bufferTokens = 0;
      }
      chunks.push(...chunkAtDepth(piece, maxTokens, depth + 1));
      continue;
    }
    if (buffer && bufferTokens + pieceTokens > maxTokens) {
      chunks.push(buffer);
      buffer = piece;
      bufferTokens = pieceTokens;
    } else {
      buffer += piece;
      bufferTokens += pieceTokens;
    }
  }
  if (buffer) {
    chunks.push(buffer);
  }
  return chunks;
}

/**
 * Split `text` into pieces that each fit into `maxTokens` estimated tokens.
 *
 * Splitting prefers paragraph, then sentence, then clause, then whitespace
 * boundaries, so the pieces stay meaningful for a translation model.
 * A text that already fits is returned as a single piece.
 */
export function splitTextForContext(text: string, maxTokens: number): string[] {
  if (!text) {
    return [];
  }
  if (!Number.isFinite(maxTokens) || maxTokens <= 0) {
    return [text];
  }
  return chunkAtDepth(text, Math.max(1, Math.floor(maxTokens)), 0);
}

/**
 * How many tokens of source text may be sent in one request.
 *
 * Reserves room for the prompt, the answer and a safety margin, so that
 * `prompt + source + answer` stays below `contextWindow`.
 */
export function computeChunkBudget(
  contextWindow: number,
  promptTokens: number,
  maxOutputTokens: number,
  safetyRatio = 0.05,
): number {
  const window = Number.isFinite(contextWindow)
    ? Math.max(0, Math.floor(contextWindow))
    : 0;
  const reserve =
    Math.max(0, Math.floor(promptTokens || 0)) +
    Math.max(0, Math.floor(maxOutputTokens || 0)) +
    Math.ceil(window * safetyRatio) +
    128;
  return Math.max(256, window - reserve);
}
