import {describe, expect, it} from "vitest";
import {createTranslator} from "./I18nProvider";
import {isFullUiLocale, LOCALE_META, SUPPORTED_LOCALES} from "./locales";
import {en} from "./messages/en";
import {messageCatalogs} from "./messages";
import {
  getMessage,
  messagePlaceholders,
  type MessageTree,
  type MessageValue,
} from "./translate";

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
    expect(t("accountUi.balance")).toBe("Balance");
    expect(t("accountUi.exportCsv", {count: "10"})).toBe("Export CSV (10)");
    expect(t("filter.matchingMany", {count: "2"})).toBe(
      "2 matching transactions",
    );
    expect(t("analytics.totalTransactionsLabel", {count: "1"})).toBe(
      "TOTAL TRANSACTIONS: 1",
    );
    expect(t("pages.fa.dispatchable")).toBe("Dispatchable");
    expect(
      t("pages.fa.hookTooltip", {
        hook: "Withdraw",
        path: "0x1::m::f",
        action: "click",
      }),
    ).toContain("0x1::m::f");
    expect(t("payments.fee.total")).toBe("Total gas charged");
    expect(t("staking.epochN", {epoch: "12"})).toBe("Epoch 12");
    expect(t("multisig.noResource")).toBe(
      "This account does not have a multisig resource.",
    );
    expect(t("txn.action.confidentialAmountHidden")).toContain("encrypted");
    expect(t("fields.transactionsWithCount", {count: "3"})).toBe(
      "Transactions (3):",
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
    expect(translator.formatIntegerString("1234567")).toBe("1.234.567");
    expect(translator.formatBigInt(1_234_567n)).toBe("1.234.567");
    expect(
      translator.formatMonthDay(new Date("2026-09-14T00:00:00.000Z")),
    ).toMatch(/14/);
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
    const localeKeySets = new Map(
      SUPPORTED_LOCALES.filter((locale) => locale !== "en").map((locale) => [
        locale,
        collectKeys(messageCatalogs[locale]),
      ]),
    );
    for (const [key] of englishKeys) {
      const englishValue = getMessage(en, key);
      expect(englishValue, key).toBeDefined();
      const englishPlaceholders = messagePlaceholders(englishValue ?? "");
      for (const [locale, localeKeys] of localeKeySets) {
        if (!localeKeys.has(key)) {
          continue;
        }
        const localeValue = getMessage(messageCatalogs[locale], key);
        expect(localeValue, `${locale}:${key}`).toBeDefined();
        expect(
          messagePlaceholders(localeValue ?? ""),
          `${locale}:${key}`,
        ).toEqual(englishPlaceholders);
      }
    }
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
