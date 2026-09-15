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

function renderHeaderSelect() {
  return render(
    <ExplorerSettingsProvider>
      <I18nProvider>
        <LanguageSelect />
      </I18nProvider>
    </ExplorerSettingsProvider>,
  );
}

describe("FEAT-SETTINGS-003 / FEAT-CHROME-001 — header language switch", () => {
  it("lists browser default and native names, then persists a catalog", () => {
    renderHeaderSelect();

    const combobox = screen.getByRole("combobox", {name: "Language"});
    expect(combobox.textContent).toContain("Browser default");

    fireEvent.mouseDown(combobox);
    expect(screen.getByRole("option", {name: "Hausa"})).toBeTruthy();
    expect(screen.getByRole("option", {name: "isiZulu"})).toBeTruthy();
    expect(screen.getByRole("option", {name: "አማርኛ"})).toBeTruthy();
    fireEvent.click(screen.getByRole("option", {name: "Français"}));

    expect(screen.getByRole("combobox").textContent).toContain("Français");
    expect(window.localStorage.getItem("aptos-explorer-locale")).toBe("fr");
  });
});
