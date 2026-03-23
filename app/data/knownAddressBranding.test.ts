import {describe, expect, it} from "vitest";
import {
  getKnownAddressBranding,
  getKnownAddressIcon,
  getKnownAddresses,
} from "./index";

const DECIBEL =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

const FRAMEWORK_0X1 =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

const SHELBY_TESTNET =
  "0xc63d6a5efb0080a6029403131715bd4971e1149f7cc099aac69bb0069b3ddbf5";

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

  it("returns Shelby branding on testnet", () => {
    expect(getKnownAddressBranding("testnet", SHELBY_TESTNET)).toEqual({
      icon: "/address-icons/shelby.ico",
      description: expect.stringContaining("Shelby"),
    });
    expect(getKnownAddressIcon("testnet", SHELBY_TESTNET)).toBe(
      "/address-icons/shelby.ico",
    );
  });

  it("lists Shelby only on testnet known-address maps (label resolution is network-scoped)", () => {
    expect(getKnownAddresses("testnet")[SHELBY_TESTNET]).toBe("Shelby");
    expect(getKnownAddresses("mainnet")[SHELBY_TESTNET]).toBeUndefined();
  });

  it("returns undefined when not configured", () => {
    expect(getKnownAddressBranding("testnet", DECIBEL)).toBeUndefined();
    expect(getKnownAddressIcon("testnet", DECIBEL)).toBeUndefined();
  });
});
