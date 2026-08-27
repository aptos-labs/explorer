import {describe, expect, it, vi} from "vitest";
import {
  buildContainingBlockSearchResult,
  buildNumericSearchResults,
  handleBlockHeightOrVersion,
  parseNumericSearch,
} from "./searchUtils";

// Covers FEAT-SEARCH-002 — numeric version/height search uses ledger bounds
// so pruned history still appears without fetching full transaction payloads.

const prunedMainnetLedger = {
  ledger_version: "6947679400",
  block_height: "1001576206",
  oldest_ledger_version: "6797879402",
  oldest_block_height: "980094774",
};

describe("FEAT-SEARCH-002 — parseNumericSearch", () => {
  it("parses decimal version strings as bigint", () => {
    expect(parseNumericSearch("0")).toBe(0n);
    expect(parseNumericSearch("1")).toBe(1n);
    expect(parseNumericSearch("6947679400")).toBe(6947679400n);
  });

  it("strips leading zeros", () => {
    expect(parseNumericSearch("0123")).toBe(123n);
    expect(parseNumericSearch("00")).toBe(0n);
  });

  it("rejects negatives and non-digits", () => {
    expect(parseNumericSearch("-1")).toBeNull();
    expect(parseNumericSearch("12a")).toBeNull();
    expect(parseNumericSearch("")).toBeNull();
  });
});

describe("FEAT-SEARCH-002 — buildNumericSearchResults", () => {
  it("returns a transaction result for pruned versions still at or below ledger_version", () => {
    const results = buildNumericSearchResults("1", prunedMainnetLedger);
    expect(results).toContainEqual({
      label: "Transaction Version 1",
      to: "/txn/1",
      type: "transaction",
    });
  });

  it("returns a block result for pruned heights still at or below block_height", () => {
    const results = buildNumericSearchResults("0", prunedMainnetLedger);
    expect(results).toContainEqual({
      label: "Block 0",
      to: "/block/0",
      type: "block",
    });
  });

  it("omits blocks whose height is above the current block_height", () => {
    const results = buildNumericSearchResults(
      "6947679400",
      prunedMainnetLedger,
    );
    expect(results.find((r) => r.type === "block")).toBeUndefined();
    expect(results).toContainEqual({
      label: "Transaction Version 6947679400",
      to: "/txn/6947679400",
      type: "transaction",
    });
  });

  it("returns no results when the number is beyond the ledger", () => {
    expect(
      buildNumericSearchResults("99999999999", prunedMainnetLedger),
    ).toEqual([]);
  });

  it("returns no results for non-numeric input", () => {
    expect(buildNumericSearchResults("0x1", prunedMainnetLedger)).toEqual([]);
  });
});

describe("FEAT-SEARCH-002 — buildContainingBlockSearchResult", () => {
  it("links to the block that contains the version", () => {
    expect(buildContainingBlockSearchResult("685", 0n)).toEqual({
      label: "Block with Txn Version 685",
      to: "/block/0",
      type: "block",
    });
  });
});

describe("FEAT-SEARCH-002 — handleBlockHeightOrVersion", () => {
  it("shows pruned versions from ledger bounds without fetching a txn body", async () => {
    const client = {
      getLedgerInfo: vi.fn().mockResolvedValue(prunedMainnetLedger),
      getBlockByVersion: vi.fn(),
      queryIndexer: vi.fn().mockResolvedValue({
        user_transactions: [{block_height: 0}],
        block_metadata_transactions: [],
      }),
      config: {fullnode: "https://api.mainnet.aptoslabs.com/v1"},
    };

    const results = await handleBlockHeightOrVersion("1", client as never);
    expect(client.getBlockByVersion).not.toHaveBeenCalled();
    expect(client.queryIndexer).toHaveBeenCalledTimes(1);
    expect(results).toContainEqual({
      label: "Transaction Version 1",
      to: "/txn/1",
      type: "transaction",
    });
    expect(results).toContainEqual({
      label: "Block with Txn Version 1",
      to: "/block/0",
      type: "block",
    });
  });

  it("uses REST getBlockByVersion when the version is still on the node", async () => {
    const client = {
      getLedgerInfo: vi.fn().mockResolvedValue(prunedMainnetLedger),
      getBlockByVersion: vi
        .fn()
        .mockResolvedValue({block_height: "1001576200"}),
      queryIndexer: vi.fn(),
      config: {},
    };

    const results = await handleBlockHeightOrVersion(
      "6900000000",
      client as never,
    );
    expect(client.getBlockByVersion).toHaveBeenCalledTimes(1);
    expect(client.queryIndexer).not.toHaveBeenCalled();
    expect(results.find((r) => r.label.startsWith("Block with"))?.to).toBe(
      "/block/1001576200",
    );
    expect(results).toContainEqual({
      label: "Transaction Version 6900000000",
      to: "/txn/6900000000",
      type: "transaction",
    });
  });
});
