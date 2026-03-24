// Covers FEAT-TXN-001 — Transaction tab selection by type
import {describe, expect, it} from "vitest";
import {TransactionTypeName} from "../../components/TransactionType";
import {getTabValues} from "./Tabs";

function makeTxn(type: string) {
  return {type} as Parameters<typeof getTabValues>[0];
}

describe("FEAT-TXN-001 — getTabValues", () => {
  it("returns 6 tabs for user transactions including trace", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.User));
    expect(tabs).toEqual([
      "userTxnOverview",
      "balanceChange",
      "events",
      "payload",
      "changes",
      "trace",
    ]);
  });

  it("returns overview, events, changes for block metadata", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.BlockMetadata));
    expect(tabs).toEqual(["blockMetadataOverview", "events", "changes"]);
  });

  it("returns only overview for state checkpoint", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.StateCheckpoint));
    expect(tabs).toEqual(["stateCheckpointOverview"]);
  });

  it("returns overview and payload for pending", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.Pending));
    expect(tabs).toEqual(["pendingTxnOverview", "payload"]);
  });

  it("returns overview, events, payload, changes for genesis", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.Genesis));
    expect(tabs).toEqual([
      "genesisTxnOverview",
      "events",
      "payload",
      "changes",
    ]);
  });

  it("returns overview, events, changes for validator", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.Validator));
    expect(tabs).toEqual(["validatorTxnOverview", "events", "changes"]);
  });

  it("returns overview, events, changes for block epilogue", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.BlockEpilogue));
    expect(tabs).toEqual(["blockEpilogueOverview", "events", "changes"]);
  });

  it("returns unknown, events, changes for unknown type", () => {
    const tabs = getTabValues(makeTxn("some_future_type"));
    expect(tabs).toEqual(["unknown", "events", "changes"]);
  });

  it("trace tab is only present for user transactions", () => {
    const allTypes = [
      TransactionTypeName.BlockMetadata,
      TransactionTypeName.StateCheckpoint,
      TransactionTypeName.Pending,
      TransactionTypeName.Genesis,
      TransactionTypeName.Validator,
      TransactionTypeName.BlockEpilogue,
    ];
    for (const type of allTypes) {
      const tabs = getTabValues(makeTxn(type));
      expect(tabs).not.toContain("trace");
    }
  });

  it("every transaction type has an overview-style tab as first element", () => {
    const types = [
      TransactionTypeName.User,
      TransactionTypeName.BlockMetadata,
      TransactionTypeName.StateCheckpoint,
      TransactionTypeName.Pending,
      TransactionTypeName.Genesis,
      TransactionTypeName.Validator,
      TransactionTypeName.BlockEpilogue,
    ];
    for (const type of types) {
      const tabs = getTabValues(makeTxn(type));
      expect(tabs[0]).toMatch(/Overview$|^unknown$/);
    }
  });
});
