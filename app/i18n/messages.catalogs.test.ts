import {describe, expect, it} from "vitest";
import {createTranslator} from "./I18nProvider";
import {
  DEFAULT_LOCALE,
  isFullUiLocale,
  LOCALE_META,
  SUPPORTED_LOCALES,
} from "./locales";
import {messageCatalogs} from "./messages";
import {collectMessageKeys, getMessage, messagePlaceholders} from "./translate";

describe("FEAT-I18N-001 — catalog coverage", () => {
  const englishKeys = collectMessageKeys(messageCatalogs[DEFAULT_LOCALE]);
  const englishKeySet = new Set(englishKeys);

  it("registers metadata for every supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_META[locale].nativeName.length).toBeGreaterThan(0);
      expect(LOCALE_META[locale].ogLocale.length).toBeGreaterThan(0);
      expect(LOCALE_META[locale].htmlLang.length).toBeGreaterThan(0);
      expect(["ltr", "rtl"]).toContain(LOCALE_META[locale].dir);
      expect(messageCatalogs[locale]).toBeTruthy();
    }
  });

  it("translates chrome away from English for other locales", () => {
    const englishBlocks =
      createTranslator(DEFAULT_LOCALE).t("chrome.nav.blocks");
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === DEFAULT_LOCALE) {
        continue;
      }
      const {t} = createTranslator(locale);
      expect(t("chrome.appName")).toBe("Aptos Explorer");
      expect(t("chrome.nav.blocks")).not.toBe(englishBlocks);
      expect(t("guide.meta.title")).not.toBe("User Guide");
    }
  });

  it("keeps full-UI catalogs aligned with English keys and placeholders", () => {
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === DEFAULT_LOCALE || !isFullUiLocale(locale)) {
        continue;
      }
      const catalog = messageCatalogs[locale];
      const localeKeys = collectMessageKeys(catalog);
      expect(localeKeys.sort(), locale).toEqual([...englishKeys].sort());

      for (const key of englishKeys) {
        const englishValue = getMessage(messageCatalogs[DEFAULT_LOCALE], key);
        const localeValue = getMessage(catalog, key);
        expect(localeValue, `${locale} missing ${key}`).toBeDefined();
        expect(messagePlaceholders(localeValue ?? "")).toEqual(
          messagePlaceholders(englishValue ?? ""),
        );
      }
    }
  });

  it("keeps other shipped catalogs as an English-key subset with matching placeholders", () => {
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === DEFAULT_LOCALE || isFullUiLocale(locale)) {
        continue;
      }
      const catalog = messageCatalogs[locale];
      const localeKeys = collectMessageKeys(catalog);
      expect(localeKeys.length, locale).toBeGreaterThan(0);
      for (const key of localeKeys) {
        expect(englishKeySet.has(key), `${locale} extra ${key}`).toBe(true);
        const englishValue = getMessage(messageCatalogs[DEFAULT_LOCALE], key);
        const localeValue = getMessage(catalog, key);
        expect(messagePlaceholders(localeValue ?? "")).toEqual(
          messagePlaceholders(englishValue ?? ""),
        );
      }
    }
  });
});
