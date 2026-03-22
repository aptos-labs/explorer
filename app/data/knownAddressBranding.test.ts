import {describe, expect, it} from "vitest";
import {getKnownAddressBranding, getKnownAddressIcon} from "./index";

const DECIBEL =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

const FRAMEWORK_0X1 =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

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

  it("returns framework branding with badge on testnet", () => {
    expect(getKnownAddressBranding("testnet", FRAMEWORK_0X1)).toMatchObject({
      icon: "/address-icons/aptos-mark.svg",
      iconBadge: "0x1",
      description: expect.stringContaining("framework"),
    });
  });

  it("returns undefined when not configured", () => {
    expect(getKnownAddressBranding("testnet", DECIBEL)).toBeUndefined();
    expect(getKnownAddressIcon("testnet", DECIBEL)).toBeUndefined();
  });
});
