// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {I18nProvider, LANGUAGE_PICKER_LOCALES, LOCALE_META} from "../../i18n";
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
    const names = screen
      .getAllByRole("menuitem")
      .map((item) => item.textContent);
    expect(names[0]).toBe("Browser default");
    expect(names.slice(1)).toEqual(
      LANGUAGE_PICKER_LOCALES.map((locale) => LOCALE_META[locale].nativeName),
    );
    fireEvent.click(screen.getByRole("menuitem", {name: "Français"}));

    expect(window.localStorage.getItem("aptos-explorer-locale")).toBe("fr");
    expect(
      screen.getByRole("button", {name: /Language|Langue/}).textContent,
    ).toContain("FR");
  });

  it("restores the persisted catalog after remount", () => {
    const {unmount} = renderHeaderButton();
    fireEvent.click(screen.getByRole("button", {name: "Language"}));
    fireEvent.click(screen.getByRole("menuitem", {name: "Français"}));
    unmount();

    renderHeaderButton();
    const button = screen.getByRole("button", {name: "Langue"});
    expect(button).toBeTruthy();
    expect(button.textContent).toContain("FR");
    expect(window.localStorage.getItem("aptos-explorer-locale")).toBe("fr");
  });
});
