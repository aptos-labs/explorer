import {describe, expect, it} from "vitest";
import {formatNumber} from "../../../i18n/format";
import {formatRewardsEarnedApt} from "./RewardsEarnedApt";

// Covers FEAT-VALIDATORS-003 — delegation rewards are decimal APT, not octa.
describe("FEAT-VALIDATORS-003 — formatRewardsEarnedApt", () => {
  const en = (value: number) =>
    formatRewardsEarnedApt(value, (n, options) =>
      formatNumber(n, "en", options),
    );

  it("formats the reported production crash amount", () => {
    expect(en(166_921.92)).toBe("166,921.92");
  });

  it("keeps two fractional digits for zero", () => {
    expect(en(0)).toBe("0.00");
  });

  it("rounds to two fractional digits", () => {
    expect(en(1.005)).toBe("1.01");
  });

  it("uses locale grouping and decimal separators", () => {
    expect(
      formatRewardsEarnedApt(166_921.92, (n, options) =>
        formatNumber(n, "de", options),
      ),
    ).toBe("166.921,92");
  });

  it("treats non-finite values as zero", () => {
    expect(en(Number.NaN)).toBe("0.00");
  });
});
