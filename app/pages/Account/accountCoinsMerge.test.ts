import {describe, expect, it} from "vitest";
import {
  APT_MOVE_COIN_TYPE,
  mergeOnChainAptIntoIndexerRows,
} from "./accountCoinsMerge";

describe("mergeOnChainAptIntoIndexerRows", () => {
  it("adds synthetic APT row when indexer is empty and on-chain balance > 0", () => {
    const merged = mergeOnChainAptIntoIndexerRows([], "100000000");
    expect(merged).toHaveLength(1);
    expect(merged[0].asset_type).toBe(APT_MOVE_COIN_TYPE);
    expect(merged[0].amount).toBe(100_000_000);
    expect(merged[0].metadata?.symbol).toBe("APT");
  });

  it("does not duplicate when indexer already has APT coin type", () => {
    const rows = [
      {
        asset_type: APT_MOVE_COIN_TYPE,
        amount: 50_000_000,
        metadata: {
          name: "Aptos Coin",
          decimals: 8,
          symbol: "APT",
          token_standard: "v1",
        },
      },
    ];
    const merged = mergeOnChainAptIntoIndexerRows(rows, "100000000");
    expect(merged).toHaveLength(1);
    expect(merged[0].amount).toBe(50_000_000);
  });

  it("fills null metadata for APT FA address 0xa", () => {
    const rows = [
      {
        asset_type:
          "0x000000000000000000000000000000000000000000000000000000000000000a",
        amount: 1,
        metadata: null,
      },
    ];
    const merged = mergeOnChainAptIntoIndexerRows(rows, "0");
    expect(merged[0].metadata).not.toBeNull();
    expect(merged[0].metadata?.symbol).toBe("APT");
  });

  it("does not add row when on-chain balance is zero", () => {
    expect(mergeOnChainAptIntoIndexerRows([], "0")).toHaveLength(0);
  });
});
