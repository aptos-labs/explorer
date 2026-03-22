import {describe, expect, it} from "vitest";
import {getKnownAddressBranding, getKnownAddressIcon} from "./index";

const DECIBEL =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

describe("known address branding", () => {
  it("returns icon and description for Decibel on mainnet", () => {
    expect(getKnownAddressBranding("mainnet", DECIBEL)).toEqual({
      icon: "/address-icons/decibel.png",
      description: expect.stringContaining("Decibel"),
    });
    expect(getKnownAddressIcon("mainnet", DECIBEL)).toBe(
      "/address-icons/decibel.png",
    );
  });

  it("returns undefined when not configured", () => {
    expect(getKnownAddressBranding("testnet", DECIBEL)).toBeUndefined();
    expect(getKnownAddressIcon("testnet", DECIBEL)).toBeUndefined();
  });
});
