import {describe, expect, it} from "vitest";
import {
  decimalSeparator,
  formatBigInt,
  formatCompactNumber,
  formatDateTime,
  formatInteger,
  formatIntegerString,
  formatMonthDay,
  formatNumber,
  formatRelativeTime,
  formatTimestamp,
} from "./format";

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

describe("formatBigInt and formatIntegerString", () => {
  it("groups integers beyond Number.MAX_SAFE_INTEGER", () => {
    expect(formatBigInt(10_000_000_000_000_001n, "en")).toBe(
      "10,000,000,000,000,001",
    );
    expect(formatIntegerString("10000000000000001", "de")).toBe(
      "10.000.000.000.000.001",
    );
  });

  it("uses Indian grouping for Hindi", () => {
    expect(formatIntegerString("1234567", "hi")).toBe("12,34,567");
  });
});

describe("formatCompactNumber", () => {
  it("uses locale compact notation", () => {
    expect(formatCompactNumber(1_500_000, "en", 1)).toBe("1.5M");
    expect(formatCompactNumber(1_500_000, "de", 1)).toMatch(/1,5/);
  });
});

describe("decimalSeparator", () => {
  it("returns the locale decimal mark", () => {
    expect(decimalSeparator("en")).toBe(".");
    expect(decimalSeparator("de")).toBe(",");
  });
});

describe("formatTimestamp", () => {
  it("includes seconds, fractional seconds, and a UTC zone label", () => {
    const formatted = formatTimestamp(
      new Date("2026-09-14T12:00:05.123Z"),
      "en",
    );
    expect(formatted).toMatch(/2026/);
    expect(formatted).toMatch(/12:00:05/);
    expect(formatted).toMatch(/UTC|GMT/i);
  });
});

describe("formatMonthDay", () => {
  it("formats UTC month and day for chart labels", () => {
    const date = new Date("2026-09-14T00:00:00.000Z");
    expect(formatMonthDay(date, "en")).toBe("Sep 14");
    expect(formatMonthDay(date, "de")).toMatch(/14/);
  });
});

describe("formatRelativeTime", () => {
  it("uses Intl relative time for the locale", () => {
    const now = new Date("2026-09-14T12:00:00.000Z");
    const past = new Date("2026-09-14T11:00:00.000Z");
    expect(formatRelativeTime(past, "en", now)).toMatch(/hour/i);
    expect(formatRelativeTime(past, "de", now)).toMatch(/Stunde/i);
  });
});
