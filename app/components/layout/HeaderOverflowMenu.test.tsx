// @vitest-environment jsdom
// Covers FEAT-CHROME-001 — compact hamburger menu must open on mobile browsers
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import {I18nProvider} from "../../i18n";
import {ExplorerSettingsProvider} from "../../settings";
import getDesignTokens from "../../themes/theme";

vi.mock("@aptos-labs/wallet-adapter-react", () => ({
  useWallet: () => ({account: null}),
}));

vi.mock("../../api/hooks/useGetInMainnet", () => ({
  useGetInMainnet: () => true,
}));

vi.mock("../../global-config", () => ({
  useNetworkName: () => "mainnet",
}));

vi.mock("../../routing", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../../context/color-mode", () => ({
  useColorMode: () => ({toggleColorMode: vi.fn()}),
}));

vi.mock("../WalletConnector", () => ({
  WalletConnector: () => <button type="button">Connect Wallet</button>,
}));

import HeaderOverflowMenu from "./HeaderOverflowMenu";

const theme = createTheme(getDesignTokens("light"));

function renderMenu() {
  return render(
    <ThemeProvider theme={theme}>
      <ExplorerSettingsProvider>
        <I18nProvider>
          <HeaderOverflowMenu />
        </I18nProvider>
      </ExplorerSettingsProvider>
    </ThemeProvider>,
  );
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("FEAT-CHROME-001 — compact overflow menu on mobile", () => {
  it("opens the navigation menu without locking body scroll", () => {
    renderMenu();

    fireEvent.click(screen.getByRole("button", {name: "Navigation menu"}));

    expect(screen.getByRole("menuitem", {name: "Transactions"})).toBeTruthy();
    expect(screen.getByRole("menuitem", {name: "Language"})).toBeTruthy();
    // iOS Safari treats MUI's overflow:hidden scroll-lock as a broken overlay:
    // the menu appears to do nothing or immediately dismisses.
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("uses a 44px-class icon button so the hamburger is tappable", () => {
    renderMenu();
    const button = screen.getByRole("button", {name: "Navigation menu"});
    expect(button.className).toMatch(/MuiIconButton-sizeLarge/);
  });
});
