import {describe, expect, it} from "vitest";
import {createTranslator} from "./I18nProvider";
import {en} from "./messages/en";

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
});
