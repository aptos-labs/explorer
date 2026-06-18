// Covers FEAT-TXN-008 — Overview served from the base /txn/{id} path
import {describe, expect, it} from "vitest";
import {
  getTransactionTabHeadLabel,
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
