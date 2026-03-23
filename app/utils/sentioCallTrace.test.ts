import {describe, expect, it} from "vitest";
import {
  getSentioCallTraceNetworkId,
  getSentioTransactionTraceViewerUrl,
} from "./sentioCallTrace";

describe("getSentioCallTraceNetworkId", () => {
  it("returns 1 for mainnet", () => {
    expect(getSentioCallTraceNetworkId("mainnet")).toBe(1);
  });

  it("returns undefined for non-mainnet networks", () => {
    expect(getSentioCallTraceNetworkId("testnet")).toBeUndefined();
    expect(getSentioCallTraceNetworkId("devnet")).toBeUndefined();
  });
});

describe("getSentioTransactionTraceViewerUrl", () => {
  it("builds mainnet viewer URL with 0x hash", () => {
    expect(getSentioTransactionTraceViewerUrl("mainnet", "0xabc")).toBe(
      "https://app.sentio.xyz/tx/aptos_mainnet/0xabc",
    );
  });

  it("prefixes hash when missing 0x", () => {
    expect(getSentioTransactionTraceViewerUrl("mainnet", "abc")).toBe(
      "https://app.sentio.xyz/tx/aptos_mainnet/0xabc",
    );
  });

  it("returns null outside mainnet", () => {
    expect(getSentioTransactionTraceViewerUrl("testnet", "0xabc")).toBeNull();
  });
});
