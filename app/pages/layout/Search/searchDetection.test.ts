// Covers FEAT-SEARCH-002 — Search type detection for all input patterns
import {describe, expect, it} from "vitest";
import {detectInputType} from "./searchUtils";

describe("FEAT-SEARCH-002 — detectInputType", () => {
  describe("ANS names", () => {
    it("detects .apt suffix as ANS name", () => {
      const result = detectInputType("alice.apt");
      expect(result.isAnsName).toBe(true);
    });

    it("normalizes .petra suffix to .apt", () => {
      const result = detectInputType("bob.petra");
      expect(result.isAnsName).toBe(true);
    });

    it("does not flag plain text as ANS", () => {
      const result = detectInputType("hello");
      expect(result.isAnsName).toBe(false);
    });
  });

  describe("Move struct types", () => {
    it("detects valid Move struct", () => {
      const result = detectInputType("0x1::aptos_coin::AptosCoin");
      expect(result.isStruct).toBe(true);
    });

    it("detects struct with generic type param", () => {
      const result = detectInputType(
        "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
      );
      expect(result.isStruct).toBe(true);
    });

    it("rejects plain text as struct", () => {
      const result = detectInputType("not_a_struct");
      expect(result.isStruct).toBe(false);
    });
  });

  describe("numeric input (block height / tx version)", () => {
    it("detects positive integer", () => {
      const result = detectInputType("12345");
      expect(result.isValidBlockHeightOrVer).toBe(true);
    });

    it("detects zero", () => {
      const result = detectInputType("0");
      expect(result.isValidBlockHeightOrVer).toBe(true);
    });

    it("rejects non-numeric text", () => {
      const result = detectInputType("abc123");
      expect(result.isValidBlockHeightOrVer).toBe(false);
    });

    it("rejects hex as numeric", () => {
      const result = detectInputType("0xabc");
      expect(result.isValidBlockHeightOrVer).toBe(false);
    });
  });

  describe("32-byte hex (transaction hash)", () => {
    it("detects 64-char hex with 0x prefix", () => {
      const hash = `0x${"a".repeat(64)}`;
      const result = detectInputType(hash);
      expect(result.is32Hex).toBe(true);
    });

    it("detects 64-char hex without prefix", () => {
      const hash = "b".repeat(64);
      const result = detectInputType(hash);
      expect(result.is32Hex).toBe(true);
    });

    it("rejects short hex", () => {
      const result = detectInputType("0xabc");
      expect(result.is32Hex).toBe(false);
    });
  });

  describe("valid account address", () => {
    it("detects full-length address with prefix", () => {
      const result = detectInputType(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      );
      expect(result.isValidAccountAddr).toBe(true);
    });

    it("detects short address with prefix", () => {
      const result = detectInputType("0x1");
      expect(result.isValidAccountAddr).toBe(true);
    });

    it("rejects invalid hex address", () => {
      const result = detectInputType("0xZZZ");
      expect(result.isValidAccountAddr).toBe(false);
    });
  });

  describe("emoji input", () => {
    it("detects single emoji", () => {
      const result = detectInputType("🎉");
      expect(result.isEmoji).toBe(true);
    });

    it("detects multi-emoji string", () => {
      const result = detectInputType("🐶🐱");
      expect(result.isEmoji).toBe(true);
    });

    it("rejects text mixed with emoji", () => {
      const result = detectInputType("hello 🎉");
      expect(result.isEmoji).toBe(false);
    });
  });

  describe("generic text", () => {
    it("flags text longer than 2 chars as generic", () => {
      const result = detectInputType("abc");
      expect(result.isGeneric).toBe(true);
    });

    it("does not flag 2-char text as generic", () => {
      const result = detectInputType("ab");
      expect(result.isGeneric).toBe(false);
    });

    it("does not flag 1-char text as generic", () => {
      const result = detectInputType("a");
      expect(result.isGeneric).toBe(false);
    });
  });

  describe("mutual exclusivity and overlap", () => {
    it("full 64-char hex matches both is32Hex and isValidAccountAddr", () => {
      const hex = `0x${"a".repeat(64)}`;
      const result = detectInputType(hex);
      expect(result.is32Hex).toBe(true);
      expect(result.isValidAccountAddr).toBe(true);
    });

    it("short address is isValidAccountAddr but not is32Hex", () => {
      const result = detectInputType("0x1");
      expect(result.isValidAccountAddr).toBe(true);
      expect(result.is32Hex).toBe(false);
    });

    it("numeric input is isValidBlockHeightOrVer and isGeneric for len > 2", () => {
      const result = detectInputType("999");
      expect(result.isValidBlockHeightOrVer).toBe(true);
      expect(result.isGeneric).toBe(true);
    });
  });
});
