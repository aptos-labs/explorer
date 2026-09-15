import {describe, expect, it} from "vitest";
import {formatDateTime, formatInteger, formatNumber} from "./format";

describe("formatInteger", () => {
  it("formats with grouping separators for the locale", () => {
    expect(formatInteger(1_234_567, "en")).toBe("1,234,567");
  });

  it("uses locale-specific grouping, including Indian grouping", () => {
    expect(formatInteger(1_234_567, "de")).toBe("1.234.567");
    expect(formatInteger(1_234_567, "hi")).toBe("12,34,567");
  });
});

describe("formatNumber", () => {
  it("uses locale-specific decimal and grouping separators", () => {
    expect(formatNumber(1_234_567.89, "de", {maximumFractionDigits: 2})).toBe(
      "1.234.567,89",
    );
    expect(formatNumber(1_234_567.89, "en", {maximumFractionDigits: 2})).toBe(
      "1,234,567.89",
    );
  });

  it("uses the locale's intended regional variant", () => {
    expect(formatNumber(1_234.5, "pt", {minimumFractionDigits: 1})).toBe(
      "1.234,5",
    );
  });

  it.each([
    ["th", "1,234.5"],
    ["id", "1.234,5"],
    ["vi", "1.234,5"],
    ["tr", "1.234,5"],
    ["bn", "১,২৩৪.৫"],
    ["sw", "1,234.5"],
    ["ha", "1,234.5"],
    ["zu", "1,234.5"],
    ["am", "1,234.5"],
  ])("formats decimals for %s", (locale, expected) => {
    expect(formatNumber(1_234.5, locale, {minimumFractionDigits: 1})).toBe(
      expected,
    );
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

  it("orders and labels UTC dates using the locale", () => {
    const date = new Date("2026-09-14T12:00:00.000Z");
    expect(formatDateTime(date, "en")).toBe("Sep 14, 2026, 12:00 PM");
    expect(formatDateTime(date, "de")).toBe("14.09.2026, 12:00");
    expect(formatDateTime(date, "ja")).toBe("2026/09/14 12:00");
  });

  it("uses the locale's calendar, date order, digits, and clock", () => {
    const date = new Date("2026-09-14T12:00:00.000Z");
    expect(formatDateTime(date, "th")).toContain("2569");
    expect(formatDateTime(date, "id")).toBe("14 Sep 2026, 12.00");
    expect(formatDateTime(date, "bn")).toContain("১৪ সেপ, ২০২৬");
  });

  it("uses European Portuguese date order and Dutch grouping", () => {
    const date = new Date("2026-09-14T12:00:00.000Z");
    expect(formatDateTime(date, "pt-PT")).toBe("14/09/2026, 12:00");
    expect(formatNumber(1_234.5, "nl", {minimumFractionDigits: 1})).toBe(
      "1.234,5",
    );
    expect(formatDateTime(date, "zh-Hant")).toContain("2026");
  });
});
