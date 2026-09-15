import {describe, expect, it} from "vitest";
import {createTranslator} from "./I18nProvider";
import {LOCALE_META, SUPPORTED_LOCALES} from "./locales";
import {en} from "./messages/en";
import {messageCatalogs} from "./messages";
import type {MessageTree, MessageValue} from "./translate";

function collectKeys(
  tree: MessageTree,
  prefix = "",
): Map<string, "string" | "list"> {
  const keys = new Map<string, "string" | "list">();
  for (const [part, value] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${part}` : part;
    if (typeof value === "string") {
      keys.set(key, "string");
    } else if (Array.isArray(value)) {
      keys.set(key, "list");
    } else {
      for (const [nestedKey, nestedKind] of collectKeys(value, key)) {
        keys.set(nestedKey, nestedKind);
      }
    }
  }
  return keys;
}

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

function visitLeaves(
  tree: MessageTree,
  visit: (key: string, value: string | string[]) => void,
  prefix = "",
): void {
  for (const [part, value] of Object.entries(tree) as [
    string,
    MessageValue,
  ][]) {
    const key = prefix ? `${prefix}.${part}` : part;
    if (typeof value === "string" || Array.isArray(value)) {
      visit(key, value);
    } else {
      visitLeaves(value, visit, key);
    }
  }
}

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

describe("FEAT-I18N-001 — shipped locale catalogs", () => {
  const englishKeys = collectKeys(en);

  it("registers metadata for every supported locale", () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_META[locale].nativeName.length).toBeGreaterThan(0);
      expect(LOCALE_META[locale].htmlLang.length).toBeGreaterThan(0);
      expect(messageCatalogs[locale]).toBeDefined();
    }
    expect(LOCALE_META.ar.dir).toBe("rtl");
  });

  it("keeps the same message keys as English", () => {
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "en") {
        continue;
      }
      const localeKeys = collectKeys(messageCatalogs[locale]);
      expect([...localeKeys.keys()].sort(), locale).toEqual(
        [...englishKeys.keys()].sort(),
      );
      for (const [key, kind] of englishKeys) {
        expect(localeKeys.get(key), `${locale}:${key}`).toBe(kind);
      }
    }
  });

  it("preserves interpolation placeholders from English", () => {
    visitLeaves(en, (key, englishValue) => {
      const englishStrings = Array.isArray(englishValue)
        ? englishValue
        : [englishValue];
      for (const locale of SUPPORTED_LOCALES) {
        if (locale === "en") {
          continue;
        }
        const {t, tList} = createTranslator(locale);
        const localized = Array.isArray(englishValue) ? tList(key) : [t(key)];
        expect(localized.length, `${locale}:${key}`).toBe(
          englishStrings.length,
        );
        englishStrings.forEach((source, index) => {
          expect(
            placeholders(localized[index]),
            `${locale}:${key}[${index}]`,
          ).toEqual(placeholders(source));
        });
      }
    });
  });

  it("translates chrome titles away from English for non-English locales", () => {
    const {t: enT} = createTranslator("en");
    const englishTitle = enT("guide.meta.title");
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "en") {
        continue;
      }
      const {t} = createTranslator(locale);
      expect(t("guide.meta.title"), locale).not.toBe(englishTitle);
      expect(t("chrome.nav.transactions").length).toBeGreaterThan(0);
    }
  });
});
