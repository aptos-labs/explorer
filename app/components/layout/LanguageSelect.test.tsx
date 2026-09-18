// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {
  I18nProvider,
  LANGUAGE_PICKER_LOCALES,
  localePickerRowLabel,
} from "../../i18n";
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

function renderSettingsSelect() {
  return render(
    <ThemeProvider theme={theme}>
      <ExplorerSettingsProvider>
        <I18nProvider>
          <LanguageSelect variant="settings" />
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
    expect(screen.getByRole("menuitem", {name: "Hausa HA"})).toBeTruthy();
    expect(screen.getByRole("menuitem", {name: "isiZulu ZU"})).toBeTruthy();
    expect(screen.getByRole("menuitem", {name: "አማርኛ AM"})).toBeTruthy();
    const names = screen
      .getAllByRole("menuitem")
      .map((item) => item.getAttribute("aria-label") ?? item.textContent);
    expect(names[0]).toBe("Browser default");
    expect(names.slice(1)).toEqual(
      LANGUAGE_PICKER_LOCALES.map((locale) => localePickerRowLabel(locale)),
    );
    fireEvent.click(screen.getByRole("menuitem", {name: "Français FR"}));

    expect(window.localStorage.getItem("aptos-explorer-locale")).toBe("fr");
    expect(
      screen.getByRole("button", {name: /Language|Langue/}).textContent,
    ).toContain("FR");
  });

  it("restores the persisted catalog after remount", () => {
    const {unmount} = renderHeaderButton();
    fireEvent.click(screen.getByRole("button", {name: "Language"}));
    fireEvent.click(screen.getByRole("menuitem", {name: "Français FR"}));
    unmount();

    renderHeaderButton();
    const button = screen.getByRole("button", {name: "Langue"});
    expect(button).toBeTruthy();
    expect(button.textContent).toContain("FR");
    expect(window.localStorage.getItem("aptos-explorer-locale")).toBe("fr");
  });
});

describe("FEAT-SETTINGS-003 — settings language select", () => {
  it("lists native names with short codes and keeps the closed value as the native name", () => {
    renderSettingsSelect();

    const control = screen.getByRole("combobox", {name: "Display language"});
    expect(control.textContent).toContain("Browser default");

    fireEvent.mouseDown(control);
    expect(screen.getByRole("option", {name: "Hausa HA"})).toBeTruthy();
    expect(screen.getByRole("option", {name: "Français FR"})).toBeTruthy();
    const names = screen
      .getAllByRole("option")
      .map((item) => item.getAttribute("aria-label") ?? item.textContent);
    expect(names[0]).toBe("Browser default");
    expect(names.slice(1)).toEqual(
      LANGUAGE_PICKER_LOCALES.map((locale) => localePickerRowLabel(locale)),
    );

    fireEvent.click(screen.getByRole("option", {name: "Français FR"}));
    expect(window.localStorage.getItem("aptos-explorer-locale")).toBe("fr");

    const closed = screen.getByRole("combobox", {
      name: /Display language|Langue d'affichage/,
    });
    expect(closed.textContent).toContain("Français");
    expect(closed.textContent).not.toMatch(/\bFR\b/);
  });
});
