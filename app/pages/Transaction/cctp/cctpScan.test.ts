// Covers FEAT-TXN-009 — WormholeScan transfer link helper
import {describe, expect, it} from "vitest";
import {buildCctpScanUrl} from "./cctpScan";

describe("buildCctpScanUrl", () => {
  const hash =
    "0xf5bb603f1c256501a8dcd600b9adb0badd41a3a99c23fcfccfdc8de6ea16846d";

  it("links to WormholeScan mainnet by source transaction hash", () => {
    expect(buildCctpScanUrl("mainnet", hash)).toBe(
      `https://wormholescan.io/#/tx/${hash}?network=Mainnet`,
    );
  });

  it("returns undefined on testnet (no reliable WormholeScan deep link)", () => {
    expect(buildCctpScanUrl("testnet", hash)).toBeUndefined();
  });

  it("returns undefined on devnet", () => {
    expect(buildCctpScanUrl("devnet", hash)).toBeUndefined();
  });
});
