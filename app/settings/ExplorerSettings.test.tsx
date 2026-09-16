// @vitest-environment jsdom
import {act, cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";
import {
  ExplorerSettingsProvider,
  LOCALE_STORAGE_KEY,
  useExplorerSettings,
} from ".";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

function LocaleProbe() {
  const {settings} = useExplorerSettings();
  return <div data-testid="locale">{settings.localePreference}</div>;
}

describe("FEAT-SETTINGS-003 — locale storage sync", () => {
  it("reloads localePreference when aptos-explorer-locale changes in another tab", () => {
    render(
      <ExplorerSettingsProvider>
        <LocaleProbe />
      </ExplorerSettingsProvider>,
    );
    expect(screen.getByTestId("locale").textContent).toBe("auto");

    act(() => {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, "de");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LOCALE_STORAGE_KEY,
          newValue: "de",
          storageArea: window.localStorage,
        }),
      );
    });

    expect(screen.getByTestId("locale").textContent).toBe("de");
  });
});
