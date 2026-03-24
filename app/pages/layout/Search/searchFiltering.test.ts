// Covers FEAT-SEARCH-003 — Search result filtering and grouping
import {describe, expect, it} from "vitest";
import {
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
