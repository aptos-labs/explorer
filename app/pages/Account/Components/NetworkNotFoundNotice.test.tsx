// @vitest-environment jsdom
// Covers FEAT-ACCOUNT-014 — "Not Found on Network" switch buttons
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

const networkMocks = vi.hoisted(() => ({
  setNetworkName: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("../../../global-config", () => ({
  useNetworkSelector: () => ["mainnet", networkMocks.setNetworkName],
}));

vi.mock("../../../routing", () => ({
  useNavigate: () => networkMocks.navigate,
}));

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({pathname: "/object/0xabc"}),
}));

import NetworkNotFoundNotice from "./NetworkNotFoundNotice";

afterEach(() => {
  cleanup();
  networkMocks.setNetworkName.mockClear();
  networkMocks.navigate.mockClear();
});

describe("FEAT-ACCOUNT-014 — NetworkNotFoundNotice", () => {
  it("offers only the other public networks", () => {
    render(<NetworkNotFoundNotice />);
    const labels = screen.getAllByRole("button").map((b) => b.textContent);
    expect(labels).toEqual(["Testnet", "Devnet"]);
  });

  it("switches network the same way as the header selector", () => {
    render(<NetworkNotFoundNotice />);
    fireEvent.click(screen.getByRole("button", {name: "Testnet"}));

    expect(networkMocks.setNetworkName).toHaveBeenCalledWith("testnet");
    expect(networkMocks.navigate).toHaveBeenCalledWith({
      to: "/object/0xabc",
      search: {network: "testnet"},
    });
  });
});
