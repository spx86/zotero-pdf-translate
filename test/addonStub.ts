/**
 * Minimal `addon` global for tests.
 *
 * The plugin creates `addon` in `src/index.ts` when it loads, so the test
 * window does not have it. `getString()` and the translation refresh handler
 * read from it, so provide just enough for the code under test to run.
 *
 * Imported for its side effect.
 */
const globalScope = globalThis as any;

if (typeof globalScope.addon === "undefined") {
  globalScope.addon = {};
}

if (!globalScope.addon.api) {
  globalScope.addon.api = {};
}
if (typeof globalScope.addon.api.getTemporaryRefreshHandler !== "function") {
  globalScope.addon.api.getTemporaryRefreshHandler = () => () => {};
}

if (!globalScope.addon.data) {
  globalScope.addon.data = {};
}
if (!globalScope.addon.data.locale) {
  globalScope.addon.data.locale = {
    current: {
      // Returns the requested id so tests can assert on locale keys.
      formatMessagesSync: (items: { id: string }[]) =>
        items.map((item) => ({ value: item.id, attributes: [] })),
    },
  };
}

export {};
