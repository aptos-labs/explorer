import {afterEach, describe, expect, it} from "vitest";
import {AIP141_CONFIG, isAip141Executed, wouldExceedGasLimit} from "./aip140";

describe("aip141", () => {
  afterEach(() => {
    AIP141_CONFIG.enabled = true;
    AIP141_CONFIG.gasReductionVersion = 116277493n;
    AIP141_CONFIG.warningCutoffVersion = 2113286341n;
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

    it("skips transactions before the AIP-17 gas reduction (v116277493)", () => {
      expect(wouldExceedGasLimit("300000", "2000000", "100000000")).toBe(false);
    });

    it("flags transactions at or after the gas reduction version", () => {
      expect(wouldExceedGasLimit("300000", "2000000", "116277493")).toBe(true);
      expect(wouldExceedGasLimit("300000", "2000000", "200000000")).toBe(true);
    });

    it("still applies 10x check when no version is provided", () => {
      expect(wouldExceedGasLimit("300000", "2000000")).toBe(true);
    });

    it("skips transactions at or after the warning cutoff version", () => {
      expect(wouldExceedGasLimit("300000", "2000000", "2113286341")).toBe(
        false,
      );
      expect(wouldExceedGasLimit("300000", "2000000", "3000000000")).toBe(
        false,
      );
    });

    it("still flags transactions just before the warning cutoff", () => {
      expect(wouldExceedGasLimit("300000", "2000000", "2113286340")).toBe(true);
    });

    it("disables cutoff when warningCutoffVersion is 0n", () => {
      AIP141_CONFIG.warningCutoffVersion = 0n;
      expect(wouldExceedGasLimit("300000", "2000000", "9999999999")).toBe(true);
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

    it("has gasReductionVersion set to AIP-17 version", () => {
      expect(AIP141_CONFIG.gasReductionVersion).toBe(116277493n);
    });

    it("has warningCutoffVersion set", () => {
      expect(AIP141_CONFIG.warningCutoffVersion).toBe(2113286341n);
    });

    it("has aip141GasScheduleVersion set to 46", () => {
      expect(AIP141_CONFIG.aip141GasScheduleVersion).toBe(46);
    });
  });
});
