// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import IntegerValue from "./IntegerValue";

vi.mock("../../../routing", () => ({
  Link: ({to, children}: {to: string; children: ReactNode}) => (
    <a href={to}>{children}</a>
  ),
}));

describe("FEAT-I18N-001 / FEAT-TXN-002 / FEAT-BLOCK-001 — copyable integers", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("formats with grouping and does not show a copy control by default", () => {
    render(<IntegerValue value="1234567" />);
    expect(screen.getByText("1,234,567")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("copies the ungrouped ASCII integer, not the locale-formatted display", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: {writeText},
    });

    render(<IntegerValue value="1234567" copyable />);

    expect(screen.getByText("1,234,567")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", {name: "Copy 1234567"}));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("1234567");
    });
  });

  it("links the formatted number while keeping copy and the href ungrouped", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: {writeText},
    });

    render(<IntegerValue value="7283503314" copyable to="/txn/7283503314" />);

    const link = screen.getByRole("link", {name: "7,283,503,314"});
    expect(link.getAttribute("href")).toBe("/txn/7283503314");

    fireEvent.click(screen.getByRole("button", {name: "Copy 7283503314"}));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("7283503314");
    });
  });
});
