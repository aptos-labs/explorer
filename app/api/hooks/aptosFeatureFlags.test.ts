import {describe, expect, it} from "vitest";
import {decodeFeatureBitmap, getFeatureFlagName} from "./aptosFeatureFlags";

describe("decodeFeatureBitmap", () => {
  it("returns empty array for empty input", () => {
    expect(decodeFeatureBitmap("")).toEqual([]);
    expect(decodeFeatureBitmap("0x")).toEqual([]);
  });

  it("returns empty array for malformed hex", () => {
    expect(decodeFeatureBitmap("0x1")).toEqual([]); // odd length
    expect(decodeFeatureBitmap("0xZZ")).toEqual([]);
  });

  it("decodes byte-0 bits as low-numbered features", () => {
    // 0x01 = bit 0 of byte 0 → feature 0
    expect(decodeFeatureBitmap("0x01")).toEqual([0]);
    // 0x80 = bit 7 of byte 0 → feature 7
    expect(decodeFeatureBitmap("0x80")).toEqual([7]);
    // 0xff = all of byte 0 → features 0..7
    expect(decodeFeatureBitmap("0xff")).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("decodes higher-byte bits at the right offset", () => {
    // 0x0001 → bit 0 of byte 1 → feature 8
    expect(decodeFeatureBitmap("0x0001")).toEqual([8]);
    // 0x000004 → bit 2 of byte 2 → feature 18
    expect(decodeFeatureBitmap("0x000004")).toEqual([18]);
  });

  it("matches the Move test_feature_sets reference (features 1, 5, 17, 23)", () => {
    // Move test sets bits 1, 5, 17, 23.
    //   byte 0 = 0b00100010 = 0x22  (bits 1 and 5)
    //   byte 1 = 0b00000000 = 0x00
    //   byte 2 = 0b10000010 = 0x82  (bits 17 and 23)
    expect(decodeFeatureBitmap("0x220082")).toEqual([1, 5, 17, 23]);
  });

  it("works without the 0x prefix", () => {
    expect(decodeFeatureBitmap("01")).toEqual([0]);
  });
});

describe("getFeatureFlagName", () => {
  it("returns the registered name for known IDs", () => {
    expect(getFeatureFlagName(9)).toBe("Resource Groups");
    expect(getFeatureFlagName(46)).toBe("Keyless Accounts");
  });

  it("returns a fallback for unknown IDs so they are still surfaced", () => {
    expect(getFeatureFlagName(9999)).toBe("Feature #9999");
  });
});
