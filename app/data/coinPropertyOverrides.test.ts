// Covers FEAT-FA-002 — Asset Info (FA properties override)
import {describe, expect, it} from "vitest";
import {
  type CoinPropertyOverrideMap,
  lookupCoinPropertyOverride,
} from "./coinPropertyOverrides";
import {
  applyCoinPropertyOverride,
  getCoinPropertyOverride,
  getCoinPropertyOverrideMap,
} from "./index";

describe("coinPropertyOverrides", () => {
  describe("lookupCoinPropertyOverride", () => {
    const overrides: CoinPropertyOverrideMap = {
      "0xabc::mod::COIN": {mintable: false, burnable: false},
      "0xfa1": {freezable: false},
    };

    it("returns null when neither key matches", () => {
      expect(
        lookupCoinPropertyOverride(overrides, {
          coinStruct: "0xnope::mod::X",
          faAddress: "0xnope",
        }),
      ).toBeNull();
    });

    it("returns null when both keys are nullish", () => {
      expect(lookupCoinPropertyOverride(overrides, {})).toBeNull();
      expect(
        lookupCoinPropertyOverride(overrides, {
          coinStruct: null,
          faAddress: null,
        }),
      ).toBeNull();
    });

    it("matches by coin struct", () => {
      expect(
        lookupCoinPropertyOverride(overrides, {
          coinStruct: "0xabc::mod::COIN",
        }),
      ).toEqual({mintable: false, burnable: false});
    });

    it("matches by FA address", () => {
      expect(
        lookupCoinPropertyOverride(overrides, {faAddress: "0xfa1"}),
      ).toEqual({freezable: false});
    });

    it("prefers coin struct over FA address when both match", () => {
      const map: CoinPropertyOverrideMap = {
        "0xabc::mod::COIN": {mintable: false},
        "0xfa1": {mintable: true},
      };
      expect(
        lookupCoinPropertyOverride(map, {
          coinStruct: "0xabc::mod::COIN",
          faAddress: "0xfa1",
        }),
      ).toEqual({mintable: false});
    });
  });

  describe("applyCoinPropertyOverride", () => {
    it("returns derived unchanged when override is null", () => {
      const derived = {
        mintable: true,
        burnable: true,
        freezable: true,
        dispatchable: false,
        untransferable: false,
      };
      expect(applyCoinPropertyOverride(derived, null)).toBe(derived);
    });

    it("returns null when both derived and override are null", () => {
      expect(applyCoinPropertyOverride(null, null)).toBeNull();
    });

    it("merges override over derived", () => {
      const derived = {
        mintable: true,
        burnable: true,
        freezable: true,
        dispatchable: false,
        untransferable: false,
      };
      expect(
        applyCoinPropertyOverride(derived, {
          mintable: false,
          burnable: false,
          freezable: false,
        }),
      ).toEqual({
        mintable: false,
        burnable: false,
        freezable: false,
        dispatchable: false,
        untransferable: false,
      });
    });

    it("synthesizes default-false properties when derived is null but override exists", () => {
      expect(applyCoinPropertyOverride(null, {mintable: false})).toEqual({
        mintable: false,
        burnable: false,
        freezable: false,
        dispatchable: false,
        untransferable: false,
      });
    });
  });

  describe("getCoinPropertyOverride / getCoinPropertyOverrideMap", () => {
    it("exposes per-network maps", () => {
      expect(typeof getCoinPropertyOverrideMap("mainnet")).toBe("object");
      expect(typeof getCoinPropertyOverrideMap("testnet")).toBe("object");
      expect(typeof getCoinPropertyOverrideMap("devnet")).toBe("object");
    });

    it("returns null for assets with no configured override on mainnet", () => {
      expect(
        getCoinPropertyOverride("mainnet", {
          coinStruct: "0x1::aptos_coin::AptosCoin",
        }),
      ).toBeNull();
    });

    it("overrides PROPS as not mintable, burnable, or freezable on mainnet", () => {
      const propsStruct =
        "0xe50684a338db732d8fb8a3ac71c4b8633878bd0193bca5de2ebc852a83b35099::propbase_coin::PROPS";
      expect(
        getCoinPropertyOverride("mainnet", {coinStruct: propsStruct}),
      ).toEqual({
        mintable: false,
        burnable: false,
        freezable: false,
      });
    });

    it("does not apply mainnet PROPS override on testnet", () => {
      const propsStruct =
        "0xe50684a338db732d8fb8a3ac71c4b8633878bd0193bca5de2ebc852a83b35099::propbase_coin::PROPS";
      expect(
        getCoinPropertyOverride("testnet", {coinStruct: propsStruct}),
      ).toBeNull();
    });
  });
});
