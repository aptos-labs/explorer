// @vitest-environment jsdom
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {I18nProvider} from "../../i18n";
import {ExplorerSettingsProvider} from "../../settings";
import LanguageSelect from "./LanguageSelect";

beforeEach(() => {
  vi.stubGlobal("navigator", {
    ...navigator,
    language: "en-US",
    languages: ["en-US"],
  });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

function renderHeaderButton() {
  return render(
    <ExplorerSettingsProvider>
      <I18nProvider>
        <LanguageSelect />
      </I18nProvider>
    </ExplorerSettingsProvider>,
  );
}

describe("FEAT-SETTINGS-003 / FEAT-CHROME-001 — header language switch", () => {
  it("opens an icon menu of native names, then persists a catalog", () => {
    renderHeaderButton();

    const button = screen.getByRole("button", {name: "Language"});
    expect(button.querySelector("svg")).toBeTruthy();

    fireEvent.click(button);
    expect(screen.getByRole("menuitem", {name: "Hausa"})).toBeTruthy();
    expect(screen.getByRole("menuitem", {name: "isiZulu"})).toBeTruthy();
    expect(screen.getByRole("menuitem", {name: "አማርኛ"})).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", {name: "Français"}));

    expect(window.localStorage.getItem("aptos-explorer-locale")).toBe("fr");
  });
});
