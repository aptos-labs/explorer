import {describe, expect, it} from "vitest";
import {
  isSupportedLocale,
  normalizeLocalePreference,
  resolveLocale,
} from "./detectLocale";

describe("isSupportedLocale", () => {
  it("accepts registered locales", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("zh")).toBe(true);
    expect(isSupportedLocale("ko")).toBe(true);
    expect(isSupportedLocale("vi")).toBe(true);
    expect(isSupportedLocale("pt")).toBe(true);
    expect(isSupportedLocale("es")).toBe(true);
    expect(isSupportedLocale("ja")).toBe(true);
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
  });

  it("falls back to auto for invalid values", () => {
    expect(normalizeLocalePreference("zz")).toBe("auto");
    expect(normalizeLocalePreference(undefined)).toBe("auto");
    expect(normalizeLocalePreference(1)).toBe("auto");
  });
});

describe("resolveLocale", () => {
  it("honors an explicit supported preference", () => {
    expect(resolveLocale("en", ["fr-FR"])).toBe("en");
  });

  it("matches a browser language primary subtag when preference is auto", () => {
    expect(resolveLocale("auto", ["en-GB", "fr"])).toBe("en");
    expect(resolveLocale("auto", ["EN-us"])).toBe("en");
    expect(resolveLocale("auto", ["zh-CN", "en"])).toBe("zh");
    expect(resolveLocale("auto", ["ko-KR"])).toBe("ko");
    expect(resolveLocale("auto", ["vi-VN"])).toBe("vi");
    expect(resolveLocale("auto", ["pt-BR"])).toBe("pt");
    expect(resolveLocale("auto", ["es-419"])).toBe("es");
    expect(resolveLocale("auto", ["ja-JP"])).toBe("ja");
  });

  it("falls back to English when no browser language is supported", () => {
    expect(resolveLocale("auto", ["zz-ZZ", "xx"])).toBe("en");
    expect(resolveLocale("auto", [])).toBe("en");
  });
});
