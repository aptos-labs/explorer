import {describe, expect, it} from "vitest";
import {AIP140_CONFIG, wouldExceedGasLimit} from "./aip140";

describe("aip140", () => {
  describe("wouldExceedGasLimit", () => {
    it("returns true when gas_used * 10 > max_gas_amount", () => {
      expect(wouldExceedGasLimit("300000", "2000000")).toBe(true);
    });

    it("returns false when gas_used * 10 <= max_gas_amount", () => {
      expect(wouldExceedGasLimit("100000", "2000000")).toBe(false);
    });

    it("returns false when gas_used * 10 == max_gas_amount", () => {
      expect(wouldExceedGasLimit("200000", "2000000")).toBe(false);
    });

    it("handles large numbers safely with BigInt", () => {
      expect(wouldExceedGasLimit("9007199254740993", "90071992547409920")).toBe(
        true,
      );
    });
  });

  describe("AIP140_CONFIG", () => {
    it("is enabled by default", () => {
      expect(AIP140_CONFIG.enabled).toBe(true);
    });

    it("has 10x gas multiplier", () => {
      expect(AIP140_CONFIG.gasMultiplier).toBe(10n);
    });
  });
});
