// Covers FEAT-SEARCH-003 — Relevance ranking of asset/coin and label results
import {describe, expect, it} from "vitest";
import type {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {
  handleCoinLookup,
  MATCH_RELEVANCE,
  scoreCoinRelevance,
  scoreLabelRelevance,
  scoreTextMatch,
} from "./searchUtils";

function makeCoin(overrides: Partial<CoinDescription>): CoinDescription {
  return {
    chainId: 1,
    tokenAddress: null,
    faAddress: null,
    name: "Token",
    symbol: "TKN",
    decimals: 8,
    bridge: null,
    panoraSymbol: "TKN",
    logoUrl: "",
    websiteUrl: null,
    category: "",
    panoraUI: true,
    isInPanoraTokenList: true,
    isBanned: false,
    panoraIndex: 100,
    coinGeckoId: null,
    coinMarketCapId: null,
    usdPrice: null,
    panoraTags: ["Verified"],
    ...overrides,
  };
}

describe("FEAT-SEARCH-003 — scoreTextMatch", () => {
  it("scores an exact match highest", () => {
    expect(scoreTextMatch("usdc", "USDC")).toBe(MATCH_RELEVANCE.exact);
  });

  it("scores a prefix above a word prefix", () => {
    expect(scoreTextMatch("apt", "Aptos Coin")).toBe(MATCH_RELEVANCE.prefix);
    expect(scoreTextMatch("coin", "Aptos Coin")).toBe(
      MATCH_RELEVANCE.wordPrefix,
    );
  });

  it("scores a mid-word substring lowest", () => {
    expect(scoreTextMatch("sd", "USDC")).toBe(MATCH_RELEVANCE.substring);
  });

  it("returns none for no overlap or empty inputs", () => {
    expect(scoreTextMatch("xyz", "USDC")).toBe(MATCH_RELEVANCE.none);
    expect(scoreTextMatch("", "USDC")).toBe(MATCH_RELEVANCE.none);
    expect(scoreTextMatch("usdc", null)).toBe(MATCH_RELEVANCE.none);
    expect(scoreTextMatch("usdc", undefined)).toBe(MATCH_RELEVANCE.none);
  });

  it("is case and whitespace insensitive", () => {
    expect(scoreTextMatch("  USDC  ", "usdc")).toBe(MATCH_RELEVANCE.exact);
  });
});

describe("FEAT-SEARCH-003 — scoreCoinRelevance", () => {
  it("ranks an exact symbol match above an exact name match", () => {
    const symbolMatch = makeCoin({symbol: "USDC", name: "Wrapped Token"});
    const nameMatch = makeCoin({symbol: "WBTC", name: "USDC"});
    expect(scoreCoinRelevance("usdc", symbolMatch)).toBeGreaterThan(
      scoreCoinRelevance("usdc", nameMatch),
    );
  });

  it("ranks an exact name match above a symbol substring match", () => {
    const nameExact = makeCoin({symbol: "WBTC", name: "USDC"});
    const symbolSubstring = makeCoin({symbol: "XUSDCY", name: "Other"});
    expect(scoreCoinRelevance("usdc", nameExact)).toBeGreaterThan(
      scoreCoinRelevance("usdc", symbolSubstring),
    );
  });

  it("treats an exact address match as the strongest signal", () => {
    const faAddress = `0x${"a".repeat(64)}`;
    const byAddress = makeCoin({faAddress, symbol: "ZZZ", name: "Zed"});
    const byName = makeCoin({symbol: "USDC", name: "USDC"});
    expect(scoreCoinRelevance(faAddress, byAddress)).toBeGreaterThan(
      scoreCoinRelevance("usdc", byName),
    );
  });

  it("returns none for an empty query", () => {
    expect(scoreCoinRelevance("", makeCoin({}))).toBe(MATCH_RELEVANCE.none);
  });
});

describe("FEAT-SEARCH-003 — handleCoinLookup ranking", () => {
  it("orders an exact symbol match ahead of a more popular substring match", () => {
    const popularSubstring = makeCoin({
      symbol: "XUSDC",
      panoraSymbol: "XUSDC",
      name: "Bridged USDC Variant",
      tokenAddress: "0x1::popular::XUSDC",
      panoraIndex: 1, // very popular → low coinOrderIndex
    });
    const exactSymbol = makeCoin({
      symbol: "USDC",
      panoraSymbol: "USDC",
      name: "USD Coin",
      tokenAddress: "0x1::exact::USDC",
      panoraIndex: 500, // less popular
    });

    const results = handleCoinLookup("usdc", [popularSubstring, exactSymbol]);

    expect(results).toHaveLength(2);
    // Despite being less popular, the exact-symbol coin ranks first.
    expect(results[0].to).toBe("/coin/0x1::exact::USDC");
    expect(results[1].to).toBe("/coin/0x1::popular::XUSDC");
  });

  it("falls back to popularity order when relevance ties", () => {
    const lowPopularity = makeCoin({
      symbol: "USDC",
      panoraSymbol: "USDC",
      name: "USD Coin A",
      tokenAddress: "0x1::a::USDC",
      panoraIndex: 900,
    });
    const highPopularity = makeCoin({
      symbol: "USDC",
      panoraSymbol: "USDC",
      name: "USD Coin B",
      tokenAddress: "0x1::b::USDC",
      panoraIndex: 1,
    });

    const results = handleCoinLookup("usdc", [lowPopularity, highPopularity]);

    expect(results).toHaveLength(2);
    expect(results[0].to).toBe("/coin/0x1::b::USDC");
    expect(results[1].to).toBe("/coin/0x1::a::USDC");
  });
});

describe("FEAT-SEARCH-002 — scoreLabelRelevance", () => {
  it("ranks an exact label above a substring label", () => {
    expect(scoreLabelRelevance("aptos", "Aptos")).toBeGreaterThan(
      scoreLabelRelevance("aptos", "Wrapped Aptos Bridge"),
    );
  });
});
