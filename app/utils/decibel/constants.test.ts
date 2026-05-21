// Covers FEAT-ACCOUNT-013 — Decibel contract resolution per network
import {Network} from "@aptos-labs/ts-sdk";
import {describe, expect, it} from "vitest";
import {
  DECIBEL_MAINNET_CONTRACT,
  DECIBEL_TESTNET_CONTRACT,
  getDecibelContractForNetwork,
} from "./constants";

describe("getDecibelContractForNetwork", () => {
  it("returns the mainnet contract for mainnet", () => {
    expect(getDecibelContractForNetwork(Network.MAINNET)).toBe(
      DECIBEL_MAINNET_CONTRACT,
    );
  });

  it("returns the testnet contract for testnet", () => {
    expect(getDecibelContractForNetwork(Network.TESTNET)).toBe(
      DECIBEL_TESTNET_CONTRACT,
    );
  });

  it("returns undefined for devnet, local, and unknown networks", () => {
    expect(getDecibelContractForNetwork(Network.DEVNET)).toBeUndefined();
    expect(getDecibelContractForNetwork(Network.LOCAL)).toBeUndefined();
    expect(getDecibelContractForNetwork("custom")).toBeUndefined();
    expect(getDecibelContractForNetwork("")).toBeUndefined();
  });

  it("returns distinct contract addresses for mainnet vs testnet", () => {
    expect(DECIBEL_MAINNET_CONTRACT).not.toBe(DECIBEL_TESTNET_CONTRACT);
  });
});
