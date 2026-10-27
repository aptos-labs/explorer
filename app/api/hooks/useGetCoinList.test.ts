import {describe, expect, it} from "vitest";
import type {CoinDescription} from "./useGetCoinList";
import {
  getBaselineCoinList,
  mergePanoraWithHardcodedCoins,
} from "./useGetCoinList";

describe("mergePanoraWithHardcodedCoins", () => {
  it("prepends mainnet USDt when Panora list omits it", () => {
    const panoraOnly: CoinDescription[] = [
      {
        chainId: 1,
        tokenAddress: "0x1::aptos_coin::AptosCoin",
        faAddress: "0xa",
        name: "Aptos Coin",
        symbol: "APT",
        decimals: 8,
        bridge: null,
        panoraSymbol: "APT",
        logoUrl: "",
        websiteUrl: null,
        category: "Native",
        panoraUI: true,
        isInPanoraTokenList: true,
        isBanned: false,
        coinGeckoId: null,
        coinMarketCapId: null,
        usdPrice: null,
        panoraTags: [],
      },
    ];

    const merged = mergePanoraWithHardcodedCoins("mainnet", panoraOnly);
    const usdt = merged.find((c) => c.symbol === "USDt");
    expect(usdt?.decimals).toBe(6);
    expect(usdt?.faAddress).toBe(
      "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
    );
  });
});

describe("getBaselineCoinList", () => {
  it("includes mainnet USDt without Panora", () => {
    const baseline = getBaselineCoinList("mainnet");
    expect(
      baseline.some(
        (c) =>
          c.symbol === "USDt" &&
          c.faAddress ===
            "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
      ),
    ).toBe(true);
  });
});
