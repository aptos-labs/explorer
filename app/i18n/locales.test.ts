import {describe, expect, it} from "vitest";
import {
  DEFAULT_LOCALE,
  LANGUAGE_PICKER_LOCALES,
  localePickerRowLabel,
  localeShortLabel,
  LOCALE_META,
  SUPPORTED_LOCALES,
} from "./locales";

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

describe("FEAT-SETTINGS-003 — LANGUAGE_PICKER_LOCALES", () => {
  const collator = new Intl.Collator("en", {
    sensitivity: "base",
    usage: "sort",
  });

  it("lists every shipped locale once, with English first", () => {
    expect(LANGUAGE_PICKER_LOCALES[0]).toBe(DEFAULT_LOCALE);
    expect(LANGUAGE_PICKER_LOCALES[0]).toBe("en");
    expect([...LANGUAGE_PICKER_LOCALES].sort()).toEqual(
      [...SUPPORTED_LOCALES].sort(),
    );
  });

  it("sorts non-English catalogs by native name and keeps variants adjacent", () => {
    const rest = LANGUAGE_PICKER_LOCALES.slice(1);
    const expected = SUPPORTED_LOCALES.filter(
      (locale) => locale !== DEFAULT_LOCALE,
    ).sort((left, right) =>
      collator.compare(
        LOCALE_META[left].nativeName,
        LOCALE_META[right].nativeName,
      ),
    );
    expect(rest).toEqual(expected);

    expect(rest[rest.indexOf("pt") + 1]).toBe("pt-PT");
    expect(rest[rest.indexOf("zh") + 1]).toBe("zh-Hant");
    expect(rest[rest.indexOf("id") + 1]).toBe("ms");
  });
});

describe("FEAT-SETTINGS-003 — localePickerRowLabel", () => {
  it("joins the native name and compact code", () => {
    expect(localePickerRowLabel("fr")).toBe("Français FR");
    expect(localePickerRowLabel("zh")).toBe("简体中文 简");
    expect(localePickerRowLabel("pt")).toBe("Português (Brasil) BR");
    expect(localePickerRowLabel("pt-PT")).toBe("Português (Portugal) PT");
  });
});
