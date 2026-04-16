// Covers FEAT-COIN-003 / FEAT-UI-002 — Verification level determination
import {describe, expect, it} from "vitest";
import {manuallyVerifiedTokens} from "../../constants";
import {VerifiedType, verifiedLevel} from "./VerifiedCell";

const USDCBL_FA =
  "0x96401f1e3ab3245d056d5a1ba67eef066ac3edc4d5f1b16adc5d567e79a845b0";

describe("FEAT-COIN-003 / FEAT-UI-002 — verifiedLevel", () => {
  it("returns NATIVE_TOKEN for APT", () => {
    const result = verifiedLevel(
      {id: "0x1::aptos_coin::AptosCoin", known: true},
      "mainnet",
    );
    expect(result.level).toBe(VerifiedType.NATIVE_TOKEN);
  });

  it("returns DISABLED for non-mainnet networks", () => {
    const result = verifiedLevel(
      {id: "0xsometoken::module::Token", known: false},
      "testnet",
    );
    expect(result.level).toBe(VerifiedType.DISABLED);
    expect(result.reason).toContain("Mainnet");
  });

  it("returns COMMUNITY_BANNED when isBanned is true", () => {
    const result = verifiedLevel(
      {id: "0xbanned::module::Token", known: false, isBanned: true},
      "mainnet",
    );
    expect(result.level).toBe(VerifiedType.COMMUNITY_BANNED);
  });

  it("returns COMMUNITY_VERIFIED for Panora-listed tokens", () => {
    const result = verifiedLevel(
      {
        id: "0xunknown::module::Token",
        known: false,
        isInPanoraTokenList: true,
      },
      "mainnet",
    );
    expect(result.level).toBe(VerifiedType.COMMUNITY_VERIFIED);
  });

  it("returns RECOGNIZED for known but unverified tokens", () => {
    const result = verifiedLevel(
      {id: "0xunknown::module::Token", known: true},
      "mainnet",
    );
    expect(result.level).toBe(VerifiedType.RECOGNIZED);
  });

  it("returns UNVERIFIED for unknown tokens on mainnet", () => {
    const result = verifiedLevel(
      {id: "0xunknown::module::Token", known: false},
      "mainnet",
    );
    expect(result.level).toBe(VerifiedType.UNVERIFIED);
  });

  it("native token takes precedence over isBanned", () => {
    const result = verifiedLevel(
      {
        id: "0x1::aptos_coin::AptosCoin",
        known: true,
        isBanned: true,
      },
      "mainnet",
    );
    expect(result.level).toBe(VerifiedType.NATIVE_TOKEN);
  });

  it("DISABLED returned for devnet regardless of other flags", () => {
    const result = verifiedLevel(
      {
        id: "0xunknown::module::Token",
        known: true,
        isInPanoraTokenList: true,
      },
      "devnet",
    );
    expect(result.level).toBe(VerifiedType.DISABLED);
  });

  it("FA address (no ::) is not treated as a coin struct", () => {
    const result = verifiedLevel(
      {id: "0x1234567890abcdef", known: false},
      "mainnet",
    );
    expect(result.level).toBe(VerifiedType.UNVERIFIED);
  });

  it("returns LABS_VERIFIED for manually listed usDCBL fungible asset", () => {
    expect(manuallyVerifiedTokens[USDCBL_FA]).toBe("usDCBL");
    const result = verifiedLevel({id: USDCBL_FA, known: false}, "mainnet");
    expect(result.level).toBe(VerifiedType.LABS_VERIFIED);
  });
});
