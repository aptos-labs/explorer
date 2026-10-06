// @vitest-environment jsdom
// Covers FEAT-SETTINGS-004
import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";
import {
  ExplorerSettingsProvider,
  LOCAL_TIMESTAMPS_STORAGE_KEY,
} from "../settings";
import {formatTimestamp} from "./format";
import {I18nProvider, useTranslation} from "./I18nProvider";

const SAMPLE = new Date("2026-09-14T12:00:05.123Z");

function Probe() {
  const {locale, timestampTimeZone, formatTimestamp: format} = useTranslation();
  return (
    <>
      <span data-testid="locale">{locale}</span>
      <span data-testid="zone">{timestampTimeZone}</span>
      <span data-testid="time">{format(SAMPLE)}</span>
    </>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

function renderProbe() {
  return render(
    <ExplorerSettingsProvider>
      <I18nProvider>
        <Probe />
      </I18nProvider>
    </ExplorerSettingsProvider>,
  );
}

describe("FEAT-SETTINGS-004 — hydrated timestamp zone", () => {
  it("keeps displayed timestamps in UTC when local time is off", () => {
    renderProbe();
    const locale = screen.getByTestId("locale").textContent ?? "en";
    expect(screen.getByTestId("zone").textContent).toBe("UTC");
    expect(screen.getByTestId("time").textContent).toBe(
      formatTimestamp(SAMPLE, locale, "UTC"),
    );
  });

  it("uses the browser time zone after hydration when local time is saved", () => {
    window.localStorage.setItem(LOCAL_TIMESTAMPS_STORAGE_KEY, "true");
    renderProbe();
    const locale = screen.getByTestId("locale").textContent ?? "en";
    const zone =
      Intl.DateTimeFormat().resolvedOptions().timeZone?.trim() || "UTC";
    expect(screen.getByTestId("zone").textContent).toBe(zone);
    expect(screen.getByTestId("time").textContent).toBe(
      formatTimestamp(SAMPLE, locale, zone),
    );
  });
});
