import {afterEach, describe, expect, it, vi} from "vitest";
import {resetArchivalEndpointCache} from "../../../api/archivalNode";
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
  afterEach(() => {
    resetArchivalEndpointCache();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it("shows pruned versions from ledger bounds without fetching a txn body", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.hostname === "archive.mainnet.aptoslabs.com") {
        expect(url.pathname).toBe("/v1/blocks/by_version/1");
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({block_height: "0"}),
          body: {cancel: vi.fn()} as unknown as ReadableStream,
        };
      }
      return {
        ok: false,
        status: 410,
        headers: new Headers(),
        json: async () => ({
          archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
        }),
        body: {cancel: vi.fn()} as unknown as ReadableStream,
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = {
      getLedgerInfo: vi.fn().mockResolvedValue(prunedMainnetLedger),
      getBlockByVersion: vi.fn(),
      queryIndexer: vi.fn(),
      config: {fullnode: "https://api.mainnet.aptoslabs.com/v1"},
    };

    const results = await handleBlockHeightOrVersion("1", client as never);
    expect(client.getBlockByVersion).not.toHaveBeenCalled();
    expect(client.queryIndexer).not.toHaveBeenCalled();
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

  it("uses the indexer for containing-block height after archive miss", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.hostname === "archive.mainnet.aptoslabs.com") {
        return {
          ok: false,
          status: 404,
          headers: new Headers(),
          json: async () => ({}),
          body: {cancel: vi.fn()} as unknown as ReadableStream,
        };
      }
      return {
        ok: false,
        status: 410,
        headers: new Headers(),
        json: async () => ({
          archival_endpoint: "https://archive.mainnet.aptoslabs.com/v1",
        }),
        body: {cancel: vi.fn()} as unknown as ReadableStream,
      };
    });
    vi.stubGlobal("fetch", fetchMock);

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
    expect(client.queryIndexer).toHaveBeenCalledTimes(1);
    expect(results.find((r) => r.label.startsWith("Block with"))?.to).toBe(
      "/block/0",
    );
  });
});
