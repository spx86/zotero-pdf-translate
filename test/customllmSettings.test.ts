import { CustomLLM } from "../src/modules/services/customllm";
import { getString } from "../src/utils/locale";
import { getPref, setPref } from "../src/utils/prefs";
import { ServiceSettingsDialog } from "../src/utils/settingsDialog";

import "./addonStub";

/**
 * These tests build the real settings dialog structure without opening a
 * window, so a broken control definition or a missing toolkit method is caught
 * here instead of at runtime.
 */
function buildDialog(): any {
  const dialog = new ServiceSettingsDialog();
  assert.isFunction(CustomLLM.config);
  CustomLLM.config!(dialog);
  return dialog;
}

function gridChildren(dialog: any): any[] {
  return dialog.elementProps.children[0].children;
}

function settingKeys(dialog: any): string[] {
  return gridChildren(dialog)
    .map((child) => child?.attributes?.["data-setting-key"])
    .filter((key) => typeof key === "string");
}

function settingProps(dialog: any, key: string): any {
  return gridChildren(dialog).find(
    (child) => child?.attributes?.["data-setting-key"] === key,
  );
}

function staticIds(dialog: any): string[] {
  return gridChildren(dialog)
    .map((child) => child?.id)
    .filter((id) => typeof id === "string");
}

function buttonIds(dialog: any): string[] {
  return dialog.elementProps.children[1].children
    .map((wrapper: any) => wrapper?.children?.[0]?.id)
    .filter((id: unknown) => typeof id === "string");
}

describe("Custom LLM: settings dialog", function () {
  it("exposes every configurable value as an editable setting", function () {
    const keys = settingKeys(buildDialog());
    for (const expected of [
      "customllm.provider",
      "customllm.baseUrl",
      "customllm.model",
      "customllm.contextWindow",
      "customllm.maxTokens",
      "customllm.temperature",
      "customllm.prompt",
      "customllm.stream",
    ]) {
      assert.include(keys, expected);
    }
  });

  it("edits the custom request parameters through their own dialog", function () {
    // `addCustomParamsSetting` renders a button keyed by the preference.
    assert.include(buttonIds(buildDialog()), "customllm.customParams");
  });

  it("does not bind the API key to a preference", function () {
    const dialog = buildDialog();
    // The key belongs to Zotero's shared secret store, never to a pref.
    assert.notInclude(settingKeys(dialog), "customllm.apiKey");
    assert.include(staticIds(dialog), "customllm-api-key");
  });

  it("shows the resolved request URL and the connection status", function () {
    const ids = staticIds(buildDialog());
    assert.include(ids, "customllm-endpoint-preview");
    assert.include(ids, "customllm-test-status");
  });

  it("offers a connection test button", function () {
    assert.include(buttonIds(buildDialog()), "customllm-test");
  });

  it("offers a preset for every supported provider", function () {
    const select = settingProps(buildDialog(), "customllm.provider");
    assert.isDefined(select);
    const values = (select.children || []).map(
      (option: any) => option?.properties?.value,
    );
    assert.deepEqual(values, ["custom", "deepseek", "opencode", "opencode-go"]);
  });

  it("attaches a change listener to the preset selector", function () {
    const select = settingProps(buildDialog(), "customllm.provider");
    assert.isArray(select.listeners);
    assert.strictEqual(select.listeners[0].type, "change");
  });

  it("defaults the context window to 264000 tokens", function () {
    const contextWindow = settingProps(
      buildDialog(),
      "customllm.contextWindow",
    );
    assert.strictEqual(contextWindow.attributes.type, "number");
    assert.strictEqual(getPref("customllm.contextWindow"), "264000");
  });

  it("keeps the prompt placeholder requirement in the save validator", function () {
    const dialog = buildDialog();
    assert.isFunction(dialog.validater);
    assert.strictEqual(
      dialog.validater({ "customllm.prompt": "translate this" }),
      getString("service-gpt-dialog-prompt-required", {
        args: { placeholder: "${sourceText}" },
      }),
    );
    assert.isTrue(
      dialog.validater({ "customllm.prompt": "translate ${sourceText}" }),
    );
  });
});

describe("Custom LLM: service registration", function () {
  it("is registered in the service list", async function () {
    const { services } = await import("../src/modules/services");
    const service = services.getServiceById("customllm");
    assert.isDefined(service);
    assert.strictEqual(service!.id, "customllm");
    assert.strictEqual(service!.type, "sentence");
    assert.isFunction(service!.translate);
    assert.isFunction(service!.config);
    assert.isFunction(service!.secretValidator);
  });

  it("is selectable as a sentence service", async function () {
    const { services } = await import("../src/modules/services");
    const ids = services
      .getAllServicesWithType("sentence")
      .map((service) => service.id);
    assert.include(ids, "customllm");
  });

  it("is marked as requiring an API key", async function () {
    const { services } = await import("../src/modules/services");
    // Requires a key, so it is hidden while `hideUnconfiguredServices` is on
    // and gets the 🗝️ marker.
    assert.isTrue(services.getUnconfiguredServiceIds().has("customllm"));
    assert.include(services.getServiceNameByID("customllm"), "🗝️");
  });
});

describe("Custom LLM: unusable API key", function () {
  function makeTask(secret: string): any {
    return {
      id: "task-1",
      type: "text",
      raw: "hello world",
      result: "",
      audio: [],
      service: "customllm",
      candidateServices: [],
      itemId: undefined,
      langfrom: "en",
      langto: "zh-CN",
      status: "waiting",
      extraTasks: [],
      secret,
    };
  }

  it("explains a key holding characters that cannot go into a header", async function () {
    // Regression: this used to surface as
    // "TypeError: Headers.append: Cannot convert argument 2 to ByteString".
    let message = "";
    try {
      await CustomLLM.translate(makeTask(`${"a".repeat(277)}\u{1F524}`));
    } catch (e: any) {
      message = e?.message || String(e);
    }
    assert.include(message, "customllm-error-apiKey-charset");
  });

  it("accepts a normal key and fails later, on the network", async function () {
    // Point the service at a closed local port so the test never touches the
    // real provider, and restore the preference afterwards.
    const original = getPref("customllm.baseUrl") as string;
    setPref("customllm.baseUrl", "http://127.0.0.1:9/v1");
    let message = "";
    try {
      await CustomLLM.translate(makeTask("sk-1234567890abcdef"));
    } catch (e: any) {
      message = e?.message || String(e);
    } finally {
      setPref("customllm.baseUrl", original);
    }
    // A plain key passes validation, so the failure must no longer be the
    // charset guard - it is a plain connection failure.
    assert.notInclude(message, "customllm-error-apiKey-charset");
  });
});
