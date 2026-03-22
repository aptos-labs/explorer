import {describe, expect, it} from "vitest";
import {getKnownAddressIcon} from "./index";

const DECIBEL =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

describe("getKnownAddressIcon", () => {
  it("returns a path for Decibel on mainnet", () => {
    expect(getKnownAddressIcon("mainnet", DECIBEL)).toBe(
      "/address-icons/decibel.png",
    );
  });

  it("returns undefined when no icon is configured", () => {
    expect(getKnownAddressIcon("testnet", DECIBEL)).toBeUndefined();
  });
});
