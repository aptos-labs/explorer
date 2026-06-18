// Covers FEAT-SEARCH-003 — Search result filtering and grouping
import {describe, expect, it} from "vitest";
import {
  buildNumericSearchResults,
  filterSearchResults,
  groupSearchResults,
  type SearchResult,
} from "./searchUtils";

function makeResult(label: string, type?: string, to = "/test"): SearchResult {
  return {label, to, type};
}

describe("FEAT-SEARCH-003 — filterSearchResults", () => {
  it("returns empty array for empty input", () => {
    expect(filterSearchResults([])).toEqual([]);
  });

  it("returns results unchanged when no duplicates", () => {
    const results = [
      makeResult("Transaction 0xabc", "transaction"),
      makeResult("Block 123", "block"),
    ];
    const filtered = filterSearchResults(results);
    expect(filtered).toHaveLength(2);
  });

  it("removes Address when Account is present", () => {
    const account = makeResult("Account 0x1", "account");
    const address = makeResult("Address 0x1", "address");
    const filtered = filterSearchResults([account, address]);
    expect(filtered).toContainEqual(account);
    expect(filtered).not.toContainEqual(address);
  });

  it("removes Address when Fungible Asset is present", () => {
    const fa = makeResult("Fungible Asset USDC", "fungible-asset");
    const address = makeResult("Address 0x1", "address");
    const filtered = filterSearchResults([fa, address]);
    expect(filtered).toContainEqual(fa);
    expect(filtered).not.toContainEqual(address);
  });

  it("removes Address when Object is present", () => {
    const obj = makeResult("Object 0x1", "object");
    const address = makeResult("Address 0x1", "address");
    const filtered = filterSearchResults([obj, address]);
    expect(filtered).toContainEqual(obj);
    expect(filtered).not.toContainEqual(address);
  });

  it("prefers coin-list coin over struct coin", () => {
    const coinList = makeResult("Coin APT", "coin");
    const coinStruct = makeResult("Coin 0x1::coin::Coin", "coin");
    const filtered = filterSearchResults([coinList, coinStruct]);
    expect(filtered).toContainEqual(coinList);
    expect(filtered).not.toContainEqual(coinStruct);
  });

  it("filters null values", () => {
    const tx = makeResult("Transaction 0xabc", "transaction");
    const filtered = filterSearchResults([tx, null, null]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toEqual(tx);
  });
});

describe("FEAT-SEARCH-003 — groupSearchResults", () => {
  it("returns empty array for empty input", () => {
    expect(groupSearchResults([])).toEqual([]);
  });

  it("adds group headers before each type group", () => {
    const results: SearchResult[] = [
      makeResult("Account 0x1", "account"),
      makeResult("Transaction 0xabc", "transaction"),
    ];
    const grouped = groupSearchResults(results);
    const headers = grouped.filter((r) => r.isGroupHeader);
    expect(headers.length).toBeGreaterThanOrEqual(2);
  });

  it("groups same-type results together", () => {
    const results: SearchResult[] = [
      makeResult("Account 0x1", "account"),
      makeResult("Transaction 0xabc", "transaction"),
      makeResult("Account 0x2", "account"),
    ];
    const grouped = groupSearchResults(results);
    const nonHeaders = grouped.filter((r) => !r.isGroupHeader);
    const accountIndices = nonHeaders
      .map((r, i) => (r.type === "account" ? i : -1))
      .filter((i) => i !== -1);
    expect(accountIndices[1] - accountIndices[0]).toBe(1);
  });

  it("does not duplicate group headers on re-grouping", () => {
    const results: SearchResult[] = [
      {label: "Accounts", to: null, isGroupHeader: true, type: "account"},
      makeResult("Account 0x1", "account"),
    ];
    const grouped = groupSearchResults(results);
    const accountHeaders = grouped.filter(
      (r) => r.isGroupHeader && r.label === "Accounts",
    );
    expect(accountHeaders).toHaveLength(1);
  });

  it("orders asset type before account type", () => {
    const results: SearchResult[] = [
      makeResult("Account 0x1", "account"),
      makeResult("Coin APT", "coin"),
    ];
    const grouped = groupSearchResults(results);
    const nonHeaders = grouped.filter((r) => !r.isGroupHeader);
    const coinIdx = nonHeaders.findIndex((r) => r.label === "Coin APT");
    const accountIdx = nonHeaders.findIndex((r) => r.label === "Account 0x1");
    expect(coinIdx).toBeLessThan(accountIdx);
  });
});

// Covers FEAT-SEARCH-002/FEAT-SEARCH-003 — ambiguous 64-char hex disambiguation
describe("FEAT-SEARCH-003 — groupSearchResults prioritizeTransactions", () => {
  it("keeps assets before transactions by default", () => {
    const results: SearchResult[] = [
      makeResult("Transaction 0xabc", "transaction"),
      makeResult("Coin APT", "coin"),
    ];
    const nonHeaders = groupSearchResults(results).filter(
      (r) => !r.isGroupHeader,
    );
    const txnIdx = nonHeaders.findIndex((r) => r.type === "transaction");
    const assetIdx = nonHeaders.findIndex((r) => r.type === "coin");
    expect(assetIdx).toBeLessThan(txnIdx);
  });

  it("surfaces transactions first when prioritizeTransactions is set", () => {
    const results: SearchResult[] = [
      makeResult("Coin APT", "coin"),
      makeResult("Account 0x1", "account"),
      makeResult("Transaction 0xabc", "transaction"),
    ];
    const nonHeaders = groupSearchResults(results, {
      prioritizeTransactions: true,
    }).filter((r) => !r.isGroupHeader);
    const txnIdx = nonHeaders.findIndex((r) => r.type === "transaction");
    const assetIdx = nonHeaders.findIndex((r) => r.type === "coin");
    const accountIdx = nonHeaders.findIndex((r) => r.type === "account");
    expect(txnIdx).toBe(0);
    expect(txnIdx).toBeLessThan(assetIdx);
    expect(txnIdx).toBeLessThan(accountIdx);
  });

  it("makes a transaction the first selectable Enter target for ambiguous hex", () => {
    // Simulates a 64-char hex that resolves to both a transaction and an
    // address/asset: the transaction must be the first navigable result.
    const results: SearchResult[] = [
      makeResult("Address 0xhash", "address"),
      makeResult("Transaction 0xhash", "transaction", "/txn/0xhash"),
    ];
    const grouped = groupSearchResults(results, {
      prioritizeTransactions: true,
    });
    const firstSelectable = grouped.find((r) => r.to && !r.isGroupHeader);
    expect(firstSelectable?.type).toBe("transaction");
    expect(firstSelectable?.to).toBe("/txn/0xhash");
  });

  it("preserves type grouping when prioritizing transactions", () => {
    const results: SearchResult[] = [
      makeResult("Transaction 0xa", "transaction", "/txn/0xa"),
      makeResult("Account 0x1", "account"),
      makeResult("Transaction 0xb", "transaction", "/txn/0xb"),
    ];
    const grouped = groupSearchResults(results, {
      prioritizeTransactions: true,
    });
    const headers = grouped.filter((r) => r.isGroupHeader);
    // One header per type, no duplicates.
    expect(headers.filter((h) => h.type === "transaction")).toHaveLength(1);
  });
});

// Covers FEAT-SEARCH-002 — ambiguous numeric (block height vs txn version)
describe("FEAT-SEARCH-002 — buildNumericSearchResults", () => {
  const blockByHeight = makeResult("Block 5", "block", "/block/5");
  const txnByVersion = makeResult(
    "Transaction Version 5",
    "transaction",
    "/txn/5",
  );

  it("returns all three interpretations when they are distinct", () => {
    const blockByVersion = makeResult(
      "Block with Txn Version 5",
      "block",
      "/block/3",
    );
    const results = buildNumericSearchResults(
      blockByHeight,
      txnByVersion,
      blockByVersion,
    );
    expect(results.map((r) => r.to)).toEqual([
      "/block/5",
      "/txn/5",
      "/block/3",
    ]);
  });

  it("drops the containing-block result when it equals the height block", () => {
    // Near genesis a block's height can equal the version it contains, so both
    // block lookups resolve to /block/5 — only one row should survive.
    const blockByVersion = makeResult(
      "Block with Txn Version 5",
      "block",
      "/block/5",
    );
    const results = buildNumericSearchResults(
      blockByHeight,
      txnByVersion,
      blockByVersion,
    );
    expect(results.map((r) => r.to)).toEqual(["/block/5", "/txn/5"]);
  });

  it("keeps the containing block when the height block is absent", () => {
    // N is a valid version beyond the current block height: no Block N exists.
    const blockByVersion = makeResult(
      "Block with Txn Version 5",
      "block",
      "/block/3",
    );
    const results = buildNumericSearchResults(
      null,
      txnByVersion,
      blockByVersion,
    );
    expect(results.map((r) => r.to)).toEqual(["/txn/5", "/block/3"]);
  });

  it("returns an empty list when nothing resolves", () => {
    expect(buildNumericSearchResults(null, null, null)).toEqual([]);
  });

  it("orders block height before transaction version in the raw list", () => {
    const results = buildNumericSearchResults(
      blockByHeight,
      txnByVersion,
      null,
    );
    expect(results.map((r) => r.type)).toEqual(["block", "transaction"]);
  });
});
