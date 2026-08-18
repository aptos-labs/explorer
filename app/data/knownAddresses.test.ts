// Covers FEAT-DATA-002 — Known address system
import {describe, expect, it} from "vitest";
import {
  EMOJICOIN_REGISTRY_ADDRESS,
  getKnownAddressBranding,
  getKnownAddresses,
  getNetworkData,
} from "./index";

describe("FEAT-DATA-002 — Known address system", () => {
  describe("getKnownAddresses", () => {
    it("returns addresses for mainnet", () => {
      const addresses = getKnownAddresses("mainnet");
      expect(typeof addresses).toBe("object");
      expect(Object.keys(addresses).length).toBeGreaterThan(0);
    });

    it("returns addresses for testnet", () => {
      const addresses = getKnownAddresses("testnet");
      expect(typeof addresses).toBe("object");
    });

    it("returns addresses for devnet", () => {
      const addresses = getKnownAddresses("devnet");
      expect(typeof addresses).toBe("object");
    });

    it("includes framework address 0x1 on mainnet", () => {
      const addresses = getKnownAddresses("mainnet");
      const fullAddr =
        "0x0000000000000000000000000000000000000000000000000000000000000001";
      expect(addresses[fullAddr]).toBeDefined();
    });

    it("includes Near WBTC fungible asset metadata object on mainnet", () => {
      // Covers FEAT-DATA-002 — known address label for Labs-verified NBTC
      const addresses = getKnownAddresses("mainnet");
      expect(
        addresses[
          "0x0b0b819dcf8d9517ed14195a95adfae6a49bfdb49de33a532ca0aa7ee588e8e0"
        ],
      ).toBe("Near WBTC (NBTC)");
    });

    it("falls back to mainnet data for unknown networks", () => {
      const mainnetData = getNetworkData("mainnet");
      const unknownData = getNetworkData("local");
      expect(unknownData.knownAddresses).toEqual(mainnetData.knownAddresses);
    });
  });

  describe("getKnownAddressBranding", () => {
    it("returns branding for framework address 0x1 on mainnet", () => {
      const fullAddr =
        "0x0000000000000000000000000000000000000000000000000000000000000001";
      const branding = getKnownAddressBranding("mainnet", fullAddr);
      expect(branding).toBeDefined();
      if (branding) {
        expect(branding.icon).toBeDefined();
      }
    });

    it("returns undefined for unknown address", () => {
      const branding = getKnownAddressBranding("mainnet", "0xunknown");
      expect(branding).toBeUndefined();
    });
  });
});

describe("FEAT-DATA-005 — Emojicoin registry", () => {
  it("EMOJICOIN_REGISTRY_ADDRESS is a valid hex string", () => {
    expect(EMOJICOIN_REGISTRY_ADDRESS).toMatch(/^0x[a-f0-9]+$/);
  });

  it("EMOJICOIN_REGISTRY_ADDRESS is the expected value", () => {
    expect(EMOJICOIN_REGISTRY_ADDRESS).toBe(
      "0x4b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61",
    );
  });
});
