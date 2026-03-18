import {afterEach, describe, expect, it} from "vitest";
import {AIP141_CONFIG, isAip141Executed, wouldExceedGasLimit} from "./aip140";

describe("aip141", () => {
  afterEach(() => {
    AIP141_CONFIG.enabled = true;
    AIP141_CONFIG.gasReductionVersion = 0n;
    AIP141_CONFIG.aip141GasScheduleVersion = 46;
  });

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

    it("returns false when disabled", () => {
      AIP141_CONFIG.enabled = false;
      expect(wouldExceedGasLimit("300000", "2000000")).toBe(false);
    });

    it("returns false for empty string input", () => {
      expect(wouldExceedGasLimit("", "2000000")).toBe(false);
    });

    it("returns false for non-numeric input", () => {
      expect(wouldExceedGasLimit("abc", "2000000")).toBe(false);
    });

    it("skips transactions before the gas reduction version", () => {
      AIP141_CONFIG.gasReductionVersion = 1000n;
      expect(wouldExceedGasLimit("300000", "2000000", "500")).toBe(false);
    });

    it("flags transactions at or after the gas reduction version", () => {
      AIP141_CONFIG.gasReductionVersion = 1000n;
      expect(wouldExceedGasLimit("300000", "2000000", "1000")).toBe(true);
      expect(wouldExceedGasLimit("300000", "2000000", "2000")).toBe(true);
    });

    it("still applies 10x check when no version is provided", () => {
      AIP141_CONFIG.gasReductionVersion = 1000n;
      expect(wouldExceedGasLimit("300000", "2000000")).toBe(true);
    });
  });

  describe("isAip141Executed", () => {
    it("returns false when aip141GasScheduleVersion is 0", () => {
      AIP141_CONFIG.aip141GasScheduleVersion = 0;
      expect(isAip141Executed(15)).toBe(false);
    });

    it("returns false when on-chain version is below target", () => {
      expect(isAip141Executed(45)).toBe(false);
    });

    it("returns true when on-chain version equals target", () => {
      expect(isAip141Executed(46)).toBe(true);
    });

    it("returns true when on-chain version exceeds target", () => {
      expect(isAip141Executed(50)).toBe(true);
    });
  });

  describe("AIP141_CONFIG", () => {
    it("is enabled by default", () => {
      expect(AIP141_CONFIG.enabled).toBe(true);
    });

    it("has 10x gas multiplier", () => {
      expect(AIP141_CONFIG.gasMultiplier).toBe(10n);
    });

    it("defaults gasReductionVersion to 0n", () => {
      expect(AIP141_CONFIG.gasReductionVersion).toBe(0n);
    });

    it("has aip141GasScheduleVersion set to 46", () => {
      expect(AIP141_CONFIG.aip141GasScheduleVersion).toBe(46);
    });
  });
});
