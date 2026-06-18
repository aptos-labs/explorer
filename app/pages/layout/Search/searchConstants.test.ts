import {describe, expect, it} from "vitest";
// Covers FEAT-SEARCH-001 (shared search input tokens) and
// FEAT-SEARCH-003 (result-row type chips).
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_HELPER_TEXT,
  SEARCH_ICON_COLOR,
  SEARCH_INPUT_FONT_SIZE,
  SEARCH_PLACEHOLDER,
  searchResultTypeChipColor,
  searchResultTypeLabel,
} from "./searchConstants";

describe("FEAT-SEARCH-001 — shared search input tokens", () => {
  it("exposes a single placeholder, helper text, debounce, font, and icon color", () => {
    expect(SEARCH_PLACEHOLDER.length).toBeGreaterThan(0);
    expect(SEARCH_HELPER_TEXT.length).toBeGreaterThan(0);
    expect(SEARCH_DEBOUNCE_MS).toBe(400);
    expect(SEARCH_INPUT_FONT_SIZE).toBe("1.1rem");
    expect(SEARCH_ICON_COLOR).toBe("action");
  });
});

describe("FEAT-SEARCH-003 — result type chips", () => {
  it("maps result types to stable chip colors", () => {
    expect(searchResultTypeChipColor("account")).toBe("primary");
    expect(searchResultTypeChipColor("address")).toBe("primary");
    expect(searchResultTypeChipColor("transaction")).toBe("success");
    expect(searchResultTypeChipColor("block")).toBe("info");
    expect(searchResultTypeChipColor("coin")).toBe("warning");
    expect(searchResultTypeChipColor("fungible-asset")).toBe("warning");
    expect(searchResultTypeChipColor("object")).toBe("secondary");
    expect(searchResultTypeChipColor(undefined)).toBe("default");
    expect(searchResultTypeChipColor("something-else")).toBe("default");
  });

  it("maps result types to human-readable labels", () => {
    expect(searchResultTypeLabel("account")).toBe("Account");
    expect(searchResultTypeLabel("address")).toBe("Address");
    expect(searchResultTypeLabel("transaction")).toBe("Transaction");
    expect(searchResultTypeLabel("block")).toBe("Block");
    expect(searchResultTypeLabel("coin")).toBe("Coin");
    expect(searchResultTypeLabel("fungible-asset")).toBe("Fungible Asset");
    expect(searchResultTypeLabel("object")).toBe("Object");
    expect(searchResultTypeLabel(undefined)).toBe("Result");
  });
});
