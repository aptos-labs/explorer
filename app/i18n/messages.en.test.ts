import {describe, expect, it} from "vitest";
import {createTranslator} from "./I18nProvider";
import {en} from "./messages/en";

describe("FEAT-I18N-001 — English catalog", () => {
  it("translates chrome and guide titles", () => {
    const {t} = createTranslator("en");
    expect(t("chrome.appName")).toBe("Aptos Explorer");
    expect(t("chrome.nav.blocks")).toBe("Blocks");
    expect(t("guide.meta.title")).toBe("User Guide");
    expect(t("settings.language.auto")).toBe("Browser default");
  });

  it("keeps search tokens aligned with the catalog", () => {
    expect(en.search.placeholder.length).toBeGreaterThan(0);
    expect(en.search.helper.length).toBeGreaterThan(0);
  });
});
