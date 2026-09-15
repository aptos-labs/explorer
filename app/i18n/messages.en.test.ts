import {describe, expect, it} from "vitest";
import {createTranslator} from "./I18nProvider";
import {isFullUiLocale, LOCALE_META, SUPPORTED_LOCALES} from "./locales";
import {en} from "./messages/en";
import {messageCatalogs} from "./messages";
import type {MessageTree, MessageValue} from "./translate";

function isMessageList(value: MessageValue): value is readonly string[] {
  return Array.isArray(value);
}

function collectKeys(
  tree: MessageTree,
  prefix = "",
): Map<string, "string" | "list"> {
  const keys = new Map<string, "string" | "list">();
  for (const [part, value] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${part}` : part;
    if (typeof value === "string") {
      keys.set(key, "string");
    } else if (isMessageList(value)) {
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
  visit: (key: string, value: string | readonly string[]) => void,
  prefix = "",
): void {
  for (const [part, value] of Object.entries(tree) as [
    string,
    MessageValue,
  ][]) {
    const key = prefix ? `${prefix}.${part}` : part;
    if (typeof value === "string" || isMessageList(value)) {
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
    expect(t("tabs.transaction.overview")).toBe("Overview");
    expect(t("fields.status")).toBe("Status:");
    expect(t("common.noDataFound")).toBe("No Data Found");
    expect(t("notFound.accountTitle")).toBe("Account Not Found");
    expect(t("pages.analytics.title")).toBe("Network Analytics");
    expect(t("verificationPage.heading")).toBe(
      "Token & Address Verification Instructions",
    );
  });

  it("keeps remaining explorer UI copy in the English catalog", () => {
    const {t} = createTranslator("en");
    expect(t("contract.execute")).toBe("Execute");
    expect(t("script.advancedTitle")).toBeDefined();
    expect(t("payments.kind.p2p")).toBe("Peer-to-peer");
    expect(t("staking.op.unstake")).toBeDefined();
    expect(t("payload.encrypted")).toBe("Encrypted");
    expect(t("decibel.buy")).toBe("Buy");
    expect(t("modules.copyCode")).toBe("copy code");
    expect(t("modules.selectModule")).toBe("Select a module");
    expect(t("multisig.executionSucceeded")).toBe("Execution Succeeded");
    expect(t("aips.filter.lastCall")).toBeDefined();
    expect(t("accountUi.showZeroBalance")).toBe("Show Zero Balance");
    expect(t("common.collapseHash")).toBe("collapse hash");
    expect(t("pages.coins.searchPlaceholder")).toBe(
      "Search by name, symbol, or address...",
    );
    expect(t("signature.scheme")).toBe("Scheme");
    expect(t("trace.openSentio")).toBe(
      "Open Sentio’s interactive trace viewer",
    );
  });

  it("keeps search tokens aligned with the catalog", () => {
    expect(en.search.placeholder.length).toBeGreaterThan(0);
    expect(en.search.helper.length).toBeGreaterThan(0);
  });

  it("binds number and UTC date formatting to the selected locale", () => {
    const translator = createTranslator("de");
    expect(translator.formatNumber(1_234.5, {minimumFractionDigits: 1})).toBe(
      "1.234,5",
    );
    expect(translator.formatInteger(1_234_567)).toBe("1.234.567");
    expect(
      translator.formatDateTime(new Date("2026-09-14T12:00:00.000Z")),
    ).toBe("14.09.2026, 12:00");
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
    expect(LOCALE_META.he.dir).toBe("rtl");
    expect(LOCALE_META.ur.dir).toBe("rtl");
  });

  it("keeps full-UI catalogs on the same message keys as English", () => {
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "en" || !isFullUiLocale(locale)) {
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

  it("keeps other shipped catalogs as a subset of English keys", () => {
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "en" || isFullUiLocale(locale)) {
        continue;
      }
      const localeKeys = collectKeys(messageCatalogs[locale]);
      expect(localeKeys.size, locale).toBeGreaterThan(0);
      for (const [key, kind] of localeKeys) {
        expect(englishKeys.get(key), `${locale} extra ${key}`).toBe(kind);
      }
    }
  });

  it("preserves interpolation placeholders from English for keys each catalog defines", () => {
    visitLeaves(en, (key, englishValue) => {
      const englishStrings = Array.isArray(englishValue)
        ? englishValue
        : [englishValue];
      for (const locale of SUPPORTED_LOCALES) {
        if (locale === "en") {
          continue;
        }
        const localeKeys = collectKeys(messageCatalogs[locale]);
        if (!localeKeys.has(key)) {
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
