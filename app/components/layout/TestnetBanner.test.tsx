// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {I18nProvider} from "../../i18n";
import {ExplorerSettingsProvider} from "../../settings";
import getDesignTokens from "../../themes/theme";
import TestnetBanner from "./TestnetBanner";

const networkMocks = vi.hoisted(() => ({
  networkName: "mainnet",
}));

vi.mock("../../global-config", () => ({
  useNetworkName: () => networkMocks.networkName,
}));

const theme = createTheme(getDesignTokens("light"));

beforeEach(() => {
  networkMocks.networkName = "mainnet";
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

function renderBanner() {
  return render(
    <ThemeProvider theme={theme}>
      <ExplorerSettingsProvider>
        <I18nProvider>
          <TestnetBanner />
        </I18nProvider>
      </ExplorerSettingsProvider>
    </ThemeProvider>,
  );
}

describe("testnet reset banner", () => {
  it("shows the reset notice on testnet", () => {
    networkMocks.networkName = "testnet";
    renderBanner();
    expect(
      screen.getByText(
        "Testnet is currently being reset, and will be back up by 10/9.",
      ),
    ).toBeTruthy();
  });

  it("renders nothing on other networks", () => {
    networkMocks.networkName = "mainnet";
    const {container} = renderBanner();
    expect(container.textContent).toBe("");
  });

  it("can be dismissed", () => {
    networkMocks.networkName = "testnet";
    renderBanner();
    const notice = screen.getByText(
      "Testnet is currently being reset, and will be back up by 10/9.",
    );
    expect(notice).toBeTruthy();
    fireEvent.click(screen.getByRole("button", {name: "Dismiss"}));
    expect(
      screen.queryByText(
        "Testnet is currently being reset, and will be back up by 10/9.",
      ),
    ).toBeNull();
  });
});
