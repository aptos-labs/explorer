import {describe, expect, it} from "vitest";
import {formatDateTime, formatInteger} from "./format";

describe("formatInteger", () => {
  it("formats with grouping separators for the locale", () => {
    expect(formatInteger(1_234_567, "en")).toBe("1,234,567");
  });
});

describe("formatDateTime", () => {
  it("returns a non-empty locale-aware timestamp", () => {
    const formatted = formatDateTime(
      new Date("2026-09-14T12:00:00.000Z"),
      "en",
    );
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted).toMatch(/2026/);
  });
});
