import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getText, getTextWithVars, nextLanguage } from "./i18n.js";

describe("i18n", () => {
  it("returns English and Chinese UI text", () => {
    assert.equal(getText("en", "importButton"), "Import");
    assert.equal(getText("zh", "importButton"), "导入");
  });

  it("falls back to English for unknown languages", () => {
    assert.equal(getText("fr", "startButton"), "Start Blast");
  });

  it("formats status messages with values", () => {
    assert.equal(
      getTextWithVars("zh", "importedSummary", { cards: 3, blanks: 1, duplicates: 2 }),
      "已导入 3 张卡片。跳过 1 个空行。发现 2 个重复词。"
    );
  });

  it("toggles between supported languages", () => {
    assert.equal(nextLanguage("en"), "zh");
    assert.equal(nextLanguage("zh"), "en");
  });
});
