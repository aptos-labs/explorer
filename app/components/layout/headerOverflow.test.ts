import {describe, expect, it} from "vitest";
import {
  desktopToolbarNeedsCompact,
  HEADER_OVERFLOW_HYSTERESIS_PX,
  stripAtMedia,
  sumFlexItemWidths,
} from "./headerOverflow";

// Covers FEAT-CHROME-001 — compact chrome when translated labels do not fit
describe("FEAT-CHROME-001 — header overflow compact chrome", () => {
  it("strips the @media prefix for matchMedia", () => {
    expect(stripAtMedia("@media (min-width:1200px)")).toBe(
      "(min-width:1200px)",
    );
    expect(stripAtMedia("(min-width:1200px)")).toBe("(min-width:1200px)");
  });

  it("sums visible flex items and inter-item gaps", () => {
    expect(sumFlexItemWidths([120, 0, 80, 40], 8)).toBe(120 + 80 + 40 + 16);
    expect(sumFlexItemWidths([0, 0], 8)).toBe(0);
    expect(sumFlexItemWidths([50], 8)).toBe(50);
  });

  it("compacts when desktop intrinsic width exceeds the toolbar", () => {
    expect(
      desktopToolbarNeedsCompact({
        availableWidth: 1200,
        intrinsicWidth: 1201,
        currentlyCompact: false,
      }),
    ).toBe(true);
  });

  it("stays expanded when desktop chrome fits", () => {
    expect(
      desktopToolbarNeedsCompact({
        availableWidth: 1280,
        intrinsicWidth: 1200,
        currentlyCompact: false,
      }),
    ).toBe(false);
  });

  it("keeps compact until there is hysteresis slack", () => {
    expect(
      desktopToolbarNeedsCompact({
        availableWidth: 1200,
        intrinsicWidth: 1200,
        currentlyCompact: true,
      }),
    ).toBe(true);
    expect(
      desktopToolbarNeedsCompact({
        availableWidth: 1200 + HEADER_OVERFLOW_HYSTERESIS_PX,
        intrinsicWidth: 1200,
        currentlyCompact: true,
      }),
    ).toBe(false);
  });

  it("does not flip when widths are not measurable yet", () => {
    expect(
      desktopToolbarNeedsCompact({
        availableWidth: 0,
        intrinsicWidth: 800,
        currentlyCompact: false,
      }),
    ).toBe(false);
    expect(
      desktopToolbarNeedsCompact({
        availableWidth: 800,
        intrinsicWidth: 0,
        currentlyCompact: true,
      }),
    ).toBe(true);
  });
});
