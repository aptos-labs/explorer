// Covers FEAT-SEARCH-001 — Search input normalization, caching, result classification
// Covers FEAT-SEARCH-002 — Label-based search (handleLabelLookup)
// Covers FEAT-SEARCH-003 — Coin lookup (handleCoinLookup)
import {describe, expect, it} from "vitest";
import {
  getSearchCacheKey,
  handleCoinLookup,
  handleLabelLookup,
  isDefinitiveResult,
  normalizeSearchInput,
  prefixMatchLongerThan3,
  type SearchResult,
} from "./searchUtils";

describe("FEAT-SEARCH-001 — normalizeSearchInput", () => {
  it("trims whitespace", () => {
    expect(normalizeSearchInput("  hello  ")).toBe("hello");
  });

  it("lowercases input", () => {
    expect(normalizeSearchInput("HELLO")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(normalizeSearchInput("")).toBe("");
  });
});

describe("FEAT-SEARCH-001 — getSearchCacheKey", () => {
  it("returns formatted cache key", () => {
    expect(getSearchCacheKey("mainnet", "0x1")).toBe("search_mainnet_0x1");
  });

  it("uses network in key", () => {
    const key1 = getSearchCacheKey("mainnet", "test");
    const key2 = getSearchCacheKey("testnet", "test");
    expect(key1).not.toBe(key2);
  });
});

describe("FEAT-SEARCH-003 — isDefinitiveResult", () => {
  it("returns false for null", () => {
    expect(isDefinitiveResult(null)).toBe(false);
  });

  it("returns false for result with no label", () => {
    expect(isDefinitiveResult({label: "", to: "/test"} as SearchResult)).toBe(
      false,
    );
  });
});

describe("FEAT-SEARCH-002 — prefixMatchLongerThan3", () => {
  it("matches prefix of 4+ chars", () => {
    expect(prefixMatchLongerThan3("aptos", "Aptos Labs")).toBe(true);
  });

  it("matches substring", () => {
    expect(prefixMatchLongerThan3("labs", "Aptos Labs")).toBe(true);
  });

  it("rejects short matches", () => {
    expect(prefixMatchLongerThan3("ap", "Aptos")).toBe(false);
  });

  it("returns false for null/undefined knownName", () => {
    expect(prefixMatchLongerThan3("test", null)).toBe(false);
    expect(prefixMatchLongerThan3("test", undefined)).toBe(false);
  });

  it("returns false for empty search", () => {
    expect(prefixMatchLongerThan3("", "Aptos Labs")).toBe(false);
  });
});

describe("FEAT-SEARCH-002 — handleLabelLookup", () => {
  it("returns results for known address labels on mainnet", () => {
    const results = handleLabelLookup("aptos", "mainnet");
    expect(Array.isArray(results)).toBe(true);
  });

  it("returns empty array for short search text", () => {
    const results = handleLabelLookup("a", "mainnet");
    expect(results).toEqual([]);
  });

  it("returns empty array for empty search text", () => {
    const results = handleLabelLookup("", "mainnet");
    expect(results).toEqual([]);
  });
});

describe("FEAT-SEARCH-003 — handleCoinLookup", () => {
  it("returns empty array when coinList is undefined", () => {
    const results = handleCoinLookup("apt", undefined);
    expect(results).toEqual([]);
  });

  it("returns empty array when coinList is empty", () => {
    const results = handleCoinLookup("apt", []);
    expect(results).toEqual([]);
  });

  it("returns empty array for short search text", () => {
    const results = handleCoinLookup("a", []);
    expect(results).toEqual([]);
  });
});
