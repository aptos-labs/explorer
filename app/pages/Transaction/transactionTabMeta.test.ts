// Covers FEAT-TXN-008 — Overview served from the base /txn/{id} path
import {describe, expect, it} from "vitest";
import {
  getTransactionTabHeadLabel,
  getTransactionTabNavigation,
  isOverviewTab,
  OVERVIEW_TAB_VALUES,
} from "./transactionTabMeta";

describe("FEAT-TXN-008 — isOverviewTab", () => {
  it("treats every per-type overview tab as an overview", () => {
    for (const tab of [
      "userTxnOverview",
      "blockMetadataOverview",
      "blockEpilogueOverview",
      "stateCheckpointOverview",
      "pendingTxnOverview",
      "genesisTxnOverview",
      "validatorTxnOverview",
      "unknown",
    ]) {
      expect(isOverviewTab(tab)).toBe(true);
    }
  });

  it("does not treat detail tabs as overview", () => {
    for (const tab of [
      "events",
      "payload",
      "modules",
      "changes",
      "balanceChange",
      "trace",
      "decibelDetail",
    ]) {
      expect(isOverviewTab(tab)).toBe(false);
    }
  });

  it("returns false for an undefined tab (base path)", () => {
    expect(isOverviewTab(undefined)).toBe(false);
  });

  it("exposes the overview tab set", () => {
    expect(OVERVIEW_TAB_VALUES.has("userTxnOverview")).toBe(true);
    expect(OVERVIEW_TAB_VALUES.has("events")).toBe(false);
  });
});

describe("FEAT-TXN-008 — getTransactionTabNavigation", () => {
  it("routes the default (Overview) tab to the base path with no segment", () => {
    expect(
      getTransactionTabNavigation("123", "userTxnOverview", "userTxnOverview"),
    ).toEqual({
      to: "/txn/$txnHashOrVersion",
      params: {txnHashOrVersion: "123"},
    });
  });

  it("routes a non-default tab to the /:tab path", () => {
    expect(
      getTransactionTabNavigation("0xabc", "events", "userTxnOverview"),
    ).toEqual({
      to: "/txn/$txnHashOrVersion/$tab",
      params: {txnHashOrVersion: "0xabc", tab: "events"},
    });
  });

  it("treats whatever the type's first tab is as the base-path Overview", () => {
    // Pending transactions default to pendingTxnOverview.
    expect(
      getTransactionTabNavigation(
        "5",
        "pendingTxnOverview",
        "pendingTxnOverview",
      ),
    ).toEqual({
      to: "/txn/$txnHashOrVersion",
      params: {txnHashOrVersion: "5"},
    });
    // A detail tab on the same transaction still uses the /:tab path.
    expect(
      getTransactionTabNavigation("5", "payload", "pendingTxnOverview"),
    ).toEqual({
      to: "/txn/$txnHashOrVersion/$tab",
      params: {txnHashOrVersion: "5", tab: "payload"},
    });
  });
});

describe("getTransactionTabHeadLabel", () => {
  it("labels overview/base path as Overview", () => {
    expect(getTransactionTabHeadLabel(undefined)).toBe("Overview");
    expect(getTransactionTabHeadLabel("userTxnOverview")).toBe("Overview");
  });

  it("labels detail tabs by name", () => {
    expect(getTransactionTabHeadLabel("events")).toBe("Events");
    expect(getTransactionTabHeadLabel("balanceChange")).toBe("Balance Change");
    expect(getTransactionTabHeadLabel("trace")).toBe("Trace");
  });
});
