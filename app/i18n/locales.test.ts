import {describe, expect, it} from "vitest";
import {localeShortLabel, SUPPORTED_LOCALES} from "./locales";

describe("FEAT-SETTINGS-003 / FEAT-CHROME-001 — localeShortLabel", () => {
  it("uses distinctive compact labels for Chinese and Portuguese variants", () => {
    expect(localeShortLabel("en")).toBe("EN");
    expect(localeShortLabel("fr")).toBe("FR");
    expect(localeShortLabel("zh")).toBe("简");
    expect(localeShortLabel("zh-Hant")).toBe("繁");
    expect(localeShortLabel("pt")).toBe("BR");
    expect(localeShortLabel("pt-PT")).toBe("PT");
    expect(localeShortLabel("fil")).toBe("FIL");
  });

  it("returns a 1–3 character label for every shipped locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      const label = localeShortLabel(locale);
      expect(label.length, locale).toBeGreaterThanOrEqual(1);
      expect(label.length, locale).toBeLessThanOrEqual(3);
    }
  });
});
