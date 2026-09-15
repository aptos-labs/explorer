import {describe, expect, it} from "vitest";
import {
  isSupportedLocale,
  localeFromBrowserTag,
  normalizeLocalePreference,
  resolveLocale,
} from "./detectLocale";

describe("isSupportedLocale", () => {
  it("accepts registered locales", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(true);
    expect(isSupportedLocale("zh")).toBe(true);
    expect(isSupportedLocale("pt")).toBe(true);
  });

  it("rejects unknown tags", () => {
    expect(isSupportedLocale("zz")).toBe(false);
    expect(isSupportedLocale("en-US")).toBe(false);
  });
});

describe("normalizeLocalePreference", () => {
  it("keeps auto and supported locales", () => {
    expect(normalizeLocalePreference("auto")).toBe("auto");
    expect(normalizeLocalePreference("en")).toBe("en");
    expect(normalizeLocalePreference("fr")).toBe("fr");
  });

  it("falls back to auto for invalid values", () => {
    expect(normalizeLocalePreference("zz")).toBe("auto");
    expect(normalizeLocalePreference(undefined)).toBe("auto");
    expect(normalizeLocalePreference(1)).toBe("auto");
  });
});

describe("localeFromBrowserTag", () => {
  it("matches primary subtags and region variants", () => {
    expect(localeFromBrowserTag("es-MX")).toBe("es");
    expect(localeFromBrowserTag("pt-BR")).toBe("pt");
    expect(localeFromBrowserTag("zh-CN")).toBe("zh");
    expect(localeFromBrowserTag("zh-Hans")).toBe("zh");
    expect(localeFromBrowserTag("ar")).toBe("ar");
  });

  it("maps Tagalog to Filipino", () => {
    expect(localeFromBrowserTag("tl")).toBe("fil");
    expect(localeFromBrowserTag("tl-PH")).toBe("fil");
    expect(localeFromBrowserTag("fil-PH")).toBe("fil");
  });

  it("does not map Traditional Chinese to Simplified Chinese", () => {
    expect(localeFromBrowserTag("zh-TW")).toBeUndefined();
    expect(localeFromBrowserTag("zh-Hant")).toBeUndefined();
    expect(localeFromBrowserTag("zh-HK")).toBeUndefined();
  });
});

describe("resolveLocale", () => {
  it("honors an explicit supported preference", () => {
    expect(resolveLocale("ja", ["fr-FR"])).toBe("ja");
  });

  it("matches a browser language primary subtag when preference is auto", () => {
    expect(resolveLocale("auto", ["en-GB", "fr"])).toBe("en");
    expect(resolveLocale("auto", ["EN-us"])).toBe("en");
    expect(resolveLocale("auto", ["fr-FR", "de"])).toBe("fr");
    expect(resolveLocale("auto", ["zh-CN"])).toBe("zh");
  });

  it("falls back to English when no browser language is supported", () => {
    expect(resolveLocale("auto", ["zz-ZZ"])).toBe("en");
    expect(resolveLocale("auto", ["zh-TW"])).toBe("en");
    expect(resolveLocale("auto", [])).toBe("en");
  });
});
