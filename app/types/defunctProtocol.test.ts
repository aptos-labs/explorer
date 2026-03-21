import {describe, expect, it} from "vitest";
import {
  MIN_OWNER_WITHDRAWAL_PERCENT,
  validateWithdrawalPlugin,
  type WithdrawalPlugin,
} from "./defunctProtocol";

describe("defunctProtocol types", () => {
  describe("MIN_OWNER_WITHDRAWAL_PERCENT", () => {
    it("should be 90", () => {
      expect(MIN_OWNER_WITHDRAWAL_PERCENT).toBe(90);
    });
  });

  describe("validateWithdrawalPlugin", () => {
    const validPlugin: WithdrawalPlugin = {
      protocolAddress: "0x1234",
      entryFunction: "0x1::module::withdraw",
      description: "Test withdrawal",
      ownerPercentage: 95,
    };

    it("should accept a valid plugin with >= 90% owner share", () => {
      const result = validateWithdrawalPlugin(validPlugin);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept exactly 90% owner share", () => {
      const result = validateWithdrawalPlugin({
        ...validPlugin,
        ownerPercentage: 90,
      });
      expect(result.valid).toBe(true);
    });

    it("should accept 100% owner share", () => {
      const result = validateWithdrawalPlugin({
        ...validPlugin,
        ownerPercentage: 100,
      });
      expect(result.valid).toBe(true);
    });

    it("should reject plugin with < 90% owner share", () => {
      const result = validateWithdrawalPlugin({
        ...validPlugin,
        ownerPercentage: 89,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least 90%");
    });

    it("should reject plugin with 0% owner share", () => {
      const result = validateWithdrawalPlugin({
        ...validPlugin,
        ownerPercentage: 0,
      });
      expect(result.valid).toBe(false);
    });

    it("should reject plugin with > 100% owner share", () => {
      const result = validateWithdrawalPlugin({
        ...validPlugin,
        ownerPercentage: 101,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("cannot exceed 100%");
    });

    it("should reject plugin without entry function", () => {
      const result = validateWithdrawalPlugin({
        ...validPlugin,
        entryFunction: "",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Entry function is required");
    });

    it("should reject plugin without protocol address", () => {
      const result = validateWithdrawalPlugin({
        ...validPlugin,
        protocolAddress: "",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Protocol address is required");
    });
  });
});
