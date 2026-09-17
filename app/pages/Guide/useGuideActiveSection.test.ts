// Covers FEAT-GUIDE-001 — guide TOC highlights the section in view
import {describe, expect, it} from "vitest";
import {pickActiveGuideSection} from "./useGuideActiveSection";

const SECTION_IDS = ["overview", "search", "networks"] as const;

describe("pickActiveGuideSection", () => {
  it("returns the section with the highest intersection ratio", () => {
    const ratios = new Map<string, number>([
      ["overview", 0],
      ["search", 0.6],
      ["networks", 0.2],
    ]);

    expect(pickActiveGuideSection(SECTION_IDS, ratios)).toBe("search");
  });

  it("falls back to the first section when nothing is intersecting", () => {
    const ratios = new Map<string, number>([
      ["overview", 0],
      ["search", 0],
      ["networks", 0],
    ]);

    expect(pickActiveGuideSection(SECTION_IDS, ratios)).toBe("overview");
  });
});
