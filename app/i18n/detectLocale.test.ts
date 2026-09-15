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
    expect(isSupportedLocale("th")).toBe(true);
    expect(isSupportedLocale("id")).toBe(true);
    expect(isSupportedLocale("vi")).toBe(true);
    expect(isSupportedLocale("tr")).toBe(true);
    expect(isSupportedLocale("bn")).toBe(true);
    expect(isSupportedLocale("sw")).toBe(true);
    expect(isSupportedLocale("zh-Hant")).toBe(true);
    expect(isSupportedLocale("zh-hant")).toBe(true);
    expect(isSupportedLocale("pt-PT")).toBe(true);
    expect(isSupportedLocale("it")).toBe(true);
    expect(isSupportedLocale("ms")).toBe(true);
    expect(isSupportedLocale("ta")).toBe(true);
    expect(isSupportedLocale("uk")).toBe(true);
    expect(isSupportedLocale("nl")).toBe(true);
    expect(isSupportedLocale("pl")).toBe(true);
    expect(isSupportedLocale("he")).toBe(true);
    expect(isSupportedLocale("ur")).toBe(true);
    expect(isSupportedLocale("ha")).toBe(true);
    expect(isSupportedLocale("zu")).toBe(true);
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
    expect(normalizeLocalePreference("zh-hant")).toBe("zh-Hant");
    expect(normalizeLocalePreference("pt-pt")).toBe("pt-PT");
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
    expect(localeFromBrowserTag("th-TH")).toBe("th");
    expect(localeFromBrowserTag("id-ID")).toBe("id");
    expect(localeFromBrowserTag("vi-VN")).toBe("vi");
    expect(localeFromBrowserTag("tr-TR")).toBe("tr");
    expect(localeFromBrowserTag("bn-BD")).toBe("bn");
    expect(localeFromBrowserTag("sw-KE")).toBe("sw");
    expect(localeFromBrowserTag("it-IT")).toBe("it");
    expect(localeFromBrowserTag("ms-MY")).toBe("ms");
    expect(localeFromBrowserTag("ta-IN")).toBe("ta");
    expect(localeFromBrowserTag("uk-UA")).toBe("uk");
    expect(localeFromBrowserTag("nl-NL")).toBe("nl");
    expect(localeFromBrowserTag("pl-PL")).toBe("pl");
    expect(localeFromBrowserTag("he-IL")).toBe("he");
    expect(localeFromBrowserTag("ur-PK")).toBe("ur");
    expect(localeFromBrowserTag("ha-NG")).toBe("ha");
    expect(localeFromBrowserTag("zu-ZA")).toBe("zu");
  });

  it("maps Tagalog to Filipino", () => {
    expect(localeFromBrowserTag("tl")).toBe("fil");
    expect(localeFromBrowserTag("tl-PH")).toBe("fil");
    expect(localeFromBrowserTag("fil-PH")).toBe("fil");
  });

  it("maps Traditional Chinese to the zh-Hant catalog", () => {
    expect(localeFromBrowserTag("zh-TW")).toBe("zh-Hant");
    expect(localeFromBrowserTag("zh-Hant")).toBe("zh-Hant");
    expect(localeFromBrowserTag("zh-HK")).toBe("zh-Hant");
    expect(localeFromBrowserTag("zh-MO")).toBe("zh-Hant");
  });

  it("maps European and African Portuguese to pt-PT, Brazilian to pt", () => {
    expect(localeFromBrowserTag("pt-PT")).toBe("pt-PT");
    expect(localeFromBrowserTag("pt-AO")).toBe("pt-PT");
    expect(localeFromBrowserTag("pt-MZ")).toBe("pt-PT");
    expect(localeFromBrowserTag("pt-CV")).toBe("pt-PT");
    expect(localeFromBrowserTag("pt")).toBe("pt");
    expect(localeFromBrowserTag("pt-BR")).toBe("pt");
  });

  it("maps legacy Hebrew iw to he", () => {
    expect(localeFromBrowserTag("iw")).toBe("he");
    expect(localeFromBrowserTag("iw-IL")).toBe("he");
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
    expect(resolveLocale("auto", [])).toBe("en");
    expect(resolveLocale("auto", ["zh-TW"])).toBe("zh-Hant");
  });
});
