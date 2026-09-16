// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {I18nProvider} from "../../i18n";
import {ExplorerSettingsProvider} from "../../settings";
import getDesignTokens from "../../themes/theme";
import LanguageSelect from "./LanguageSelect";

const theme = createTheme(getDesignTokens("light"));

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
    <ThemeProvider theme={theme}>
      <ExplorerSettingsProvider>
        <I18nProvider>
          <LanguageSelect />
        </I18nProvider>
      </ExplorerSettingsProvider>
    </ThemeProvider>,
  );
}

describe("FEAT-SETTINGS-003 / FEAT-CHROME-001 — header language switch", () => {
  it("shows the current locale code, then persists a catalog from the menu", () => {
    renderHeaderButton();

    const button = screen.getByRole("button", {name: "Language"});
    expect(button.textContent).toContain("EN");
    expect(button.querySelector("svg")).toBeTruthy();

    fireEvent.click(button);
    expect(screen.getByRole("menuitem", {name: "Hausa"})).toBeTruthy();
    expect(screen.getByRole("menuitem", {name: "isiZulu"})).toBeTruthy();
    expect(screen.getByRole("menuitem", {name: "አማርኛ"})).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", {name: "Français"}));

    expect(window.localStorage.getItem("aptos-explorer-locale")).toBe("fr");
    expect(
      screen.getByRole("button", {name: /Language|Langue/}).textContent,
    ).toContain("FR");
  });
});
