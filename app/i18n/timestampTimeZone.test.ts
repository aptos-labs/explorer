import {describe, expect, it} from "vitest";
import {resolveTimestampTimeZone} from "./timestampTimeZone";

describe("FEAT-SETTINGS-004 — timestamp time zone", () => {
  it("stays on UTC before hydration even when local time is enabled", () => {
    expect(resolveTimestampTimeZone(true, false, "America/Los_Angeles")).toBe(
      "UTC",
    );
  });

  it("stays on UTC after hydration when the preference is off", () => {
    expect(resolveTimestampTimeZone(false, true, "America/Los_Angeles")).toBe(
      "UTC",
    );
  });

  it("uses the browser time zone after hydration when local time is enabled", () => {
    expect(resolveTimestampTimeZone(true, true, "America/Los_Angeles")).toBe(
      "America/Los_Angeles",
    );
  });

  it("falls back to UTC when the browser zone is blank", () => {
    expect(resolveTimestampTimeZone(true, true, "  ")).toBe("UTC");
    expect(resolveTimestampTimeZone(true, true, undefined)).toBe("UTC");
  });
});
