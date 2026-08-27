// Covers FEAT-TXN-001 — Transaction tab selection by type
// Covers FEAT-TXN-012 — Conditional Modules tab for package / bytecode changes
import {describe, expect, it} from "vitest";
import {TransactionTypeName} from "../../components/TransactionType";
import {DECIBEL_CONTRACTS} from "../../utils/decibel";
import {
  getOverviewTabComponent,
  getTabIcon,
  getTabLabel,
  getTabValues,
  OverviewTab,
  resolveTxnTab,
} from "./Tabs";
import BlockEpilogueOverviewTab from "./Tabs/BlockEpilogueOverviewTab";
import BlockMetadataOverviewTab from "./Tabs/BlockMetadataOverviewTab";
import GenesisTransactionOverviewTab from "./Tabs/GenesisTransactionOverviewTab";
import PendingTransactionOverviewTab from "./Tabs/PendingTransactionOverviewTab";
import StateCheckpointOverviewTab from "./Tabs/StateCheckpointOverviewTab";
import UnknownTab from "./Tabs/UnknownTab";
import UserTransactionOverviewTab from "./Tabs/UserTransactionOverviewTab";
import ValidatorTransactionTab from "./Tabs/ValidatorTransactionTab";
import {PUBLISH_PACKAGE_EVENT_TYPE_SUFFIX} from "./transactionModuleChanges";

function makeTxn(type: string) {
  return {type} as Parameters<typeof getTabValues>[0];
}

describe("FEAT-TXN-001 — getTabValues", () => {
  it("returns 6 tabs for user transactions including trace", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.User));
    expect(tabs).toEqual([
      "overview",
      "balanceChange",
      "events",
      "payload",
      "changes",
      "trace",
    ]);
  });

  it("includes modules tab before changes when write_module changes exist", () => {
    const txn = {
      type: TransactionTypeName.User,
      changes: [
        {
          type: "write_module",
          address: "0x1",
          state_key_hash: "0x",
          data: {
            bytecode: "0x",
            abi: {
              address: "0x1",
              name: "m",
              friends: [],
              exposed_functions: [],
              structs: [],
            },
          },
        },
      ],
    } as unknown as Parameters<typeof getTabValues>[0];
    const tabs = getTabValues(txn);
    expect(tabs).toContain("modules");
    expect(tabs.indexOf("modules")).toBe(tabs.indexOf("changes") - 1);
  });

  it("includes modules tab when PublishPackage events exist", () => {
    const txn = {
      type: TransactionTypeName.User,
      events: [
        {
          guid: {creation_number: "0", account_address: "0x0"},
          sequence_number: "0",
          type: `0x1${PUBLISH_PACKAGE_EVENT_TYPE_SUFFIX}`,
          data: {code_address: "0x2", is_upgrade: false},
        },
      ],
    } as unknown as Parameters<typeof getTabValues>[0];
    expect(getTabValues(txn)).toContain("modules");
  });

  it("includes decibelDetail tab for Decibel user transactions", () => {
    const decibelTxn = {
      type: TransactionTypeName.User,
      events: [
        {
          type: `${DECIBEL_CONTRACTS[0]}::market_types::OrderEvent`,
          data: {},
        },
      ],
    } as Parameters<typeof getTabValues>[0];
    const tabs = getTabValues(decibelTxn);
    expect(tabs).toContain("decibelDetail");
    expect(tabs.indexOf("decibelDetail")).toBe(1); // after overview
  });

  it("excludes decibelDetail tab for non-Decibel user transactions", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.User));
    expect(tabs).not.toContain("decibelDetail");
  });

  it("returns overview, events, changes for block metadata", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.BlockMetadata));
    expect(tabs).toEqual(["overview", "events", "changes"]);
  });

  it("returns only overview for state checkpoint", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.StateCheckpoint));
    expect(tabs).toEqual(["overview"]);
  });

  it("returns overview and payload for pending", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.Pending));
    expect(tabs).toEqual(["overview", "payload"]);
  });

  it("returns overview, events, payload, changes for genesis", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.Genesis));
    expect(tabs).toEqual(["overview", "events", "payload", "changes"]);
  });

  it("returns overview, events, changes for validator", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.Validator));
    expect(tabs).toEqual(["overview", "events", "changes"]);
  });

  it("returns overview, events, changes for block epilogue", () => {
    const tabs = getTabValues(makeTxn(TransactionTypeName.BlockEpilogue));
    expect(tabs).toEqual(["overview", "events", "changes"]);
  });

  it("returns overview, events, changes for unknown type", () => {
    const tabs = getTabValues(makeTxn("some_future_type"));
    expect(tabs).toEqual(["overview", "events", "changes"]);
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
      expect(tabs[0]).toBe("overview");
    }
  });
});

describe("FEAT-TXN-001 — getOverviewTabComponent", () => {
  it.each([
    [TransactionTypeName.User, UserTransactionOverviewTab],
    [TransactionTypeName.BlockMetadata, BlockMetadataOverviewTab],
    [TransactionTypeName.BlockEpilogue, BlockEpilogueOverviewTab],
    [TransactionTypeName.StateCheckpoint, StateCheckpointOverviewTab],
    [TransactionTypeName.Pending, PendingTransactionOverviewTab],
    [TransactionTypeName.Genesis, GenesisTransactionOverviewTab],
    [TransactionTypeName.Validator, ValidatorTransactionTab],
  ] as const)(
    "maps %s to the type-specific overview tab",
    (type, component) => {
      expect(getOverviewTabComponent(makeTxn(type))).toBe(component);
    },
  );

  it("maps unknown types to UnknownTab", () => {
    expect(getOverviewTabComponent(makeTxn("some_future_type"))).toBe(
      UnknownTab,
    );
  });

  it("OverviewTab renders the dispatched component", () => {
    const userEl = OverviewTab({
      transaction: makeTxn(TransactionTypeName.User),
    });
    expect(userEl.type).toBe(UserTransactionOverviewTab);
    const unknownEl = OverviewTab({transaction: makeTxn("some_future_type")});
    expect(unknownEl.type).toBe(UnknownTab);
  });
});

describe("FEAT-TXN-008 — resolveTxnTab", () => {
  const userTabs = [
    "overview",
    "balanceChange",
    "events",
    "payload",
    "changes",
    "trace",
  ] as const;

  it("defaults to the first tab when tab is missing", () => {
    expect(resolveTxnTab(undefined, userTabs)).toBe("overview");
  });

  it("keeps a valid canonical tab", () => {
    expect(resolveTxnTab("events", userTabs)).toBe("events");
    expect(resolveTxnTab("overview", userTabs)).toBe("overview");
  });

  it("rewrites legacy overview tab names to overview", () => {
    expect(resolveTxnTab("userTxnOverview", userTabs)).toBe("overview");
    expect(resolveTxnTab("blockMetadataOverview", userTabs)).toBe("overview");
    expect(resolveTxnTab("unknown", userTabs)).toBe("overview");
  });

  it("falls back to the first tab for invalid names", () => {
    expect(resolveTxnTab("not-a-tab", userTabs)).toBe("overview");
  });

  it("falls back when the tab is not valid for this transaction type", () => {
    expect(resolveTxnTab("payload", ["overview"] as const)).toBe("overview");
  });
});

describe("FEAT-TXN-001 — overview tab chrome", () => {
  it("labels the shared overview tab Overview", () => {
    expect(getTabLabel("overview")).toBe("Overview");
    expect(getTabLabel("events")).toBe("Events");
  });

  it("uses the chart icon for overview", () => {
    const icon = getTabIcon("overview");
    expect(icon.props.fontSize).toBe("small");
  });
});
