// @vitest-environment jsdom
// Covers FEAT-NETWORK-001 — header network dropdown must open on mobile browsers
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import getDesignTokens from "../../themes/theme";

const networkMocks = vi.hoisted(() => ({
  setNetworkName: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("../../global-config", () => ({
  useNetworkSelector: () => ["mainnet", networkMocks.setNetworkName],
}));

vi.mock("../../routing", () => ({
  useNavigate: () => networkMocks.navigate,
}));

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({pathname: "/"}),
}));

import NetworkSelect, {networkStatusPaletteKey} from "./NetworkSelect";

const theme = createTheme(getDesignTokens("light"));

function renderSelect() {
  return render(
    <ThemeProvider theme={theme}>
      <NetworkSelect />
    </ThemeProvider>,
  );
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  networkMocks.setNetworkName.mockClear();
  networkMocks.navigate.mockClear();
});

describe("FEAT-NETWORK-001 — header network selector", () => {
  it("maps each network to a status color", () => {
    expect(networkStatusPaletteKey("mainnet")).toBe("success");
    expect(networkStatusPaletteKey("testnet")).toBe("warning");
    expect(networkStatusPaletteKey("devnet")).toBe("info");
    expect(networkStatusPaletteKey("local")).toBe("disabled");
    expect(networkStatusPaletteKey("decibel")).toBe("disabled");
  });

  it("shows a status indicator for the current network", () => {
    renderSelect();
    expect(
      document.querySelector("[data-network-status='mainnet']"),
    ).toBeTruthy();
  });

  it("does not cover Mainnet with the Select Network tooltip while the menu is open", async () => {
    renderSelect();
    const control = screen.getByLabelText("Select network");
    fireEvent.mouseDown(control);
    expect(screen.getByRole("option", {name: /^mainnet$/i})).toBeTruthy();

    fireEvent.mouseOver(control);
    fireEvent.mouseEnter(control);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(screen.getByRole("option", {name: /^mainnet$/i})).toBeTruthy();
  });

  it("opens the network list without locking body scroll", () => {
    renderSelect();

    fireEvent.mouseDown(screen.getByLabelText("Select network"));

    expect(screen.getByRole("option", {name: /testnet/i})).toBeTruthy();
    expect(screen.getByRole("option", {name: /localnet/i})).toBeTruthy();
    expect(document.body.style.overflow).not.toBe("hidden");
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });

  it("updates the network and URL when an option is chosen", () => {
    renderSelect();

    fireEvent.mouseDown(screen.getByLabelText("Select network"));
    fireEvent.click(screen.getByRole("option", {name: /testnet/i}));

    expect(networkMocks.setNetworkName).toHaveBeenCalledWith("testnet");
    expect(networkMocks.navigate).toHaveBeenCalledWith({
      to: "/",
      search: {network: "testnet"},
      replace: true,
    });
  });
});
