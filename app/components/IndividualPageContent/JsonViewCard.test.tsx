// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import JsonViewCard from "./JsonViewCard";

const useMediaQueryMock = vi.fn(() => false);

vi.mock("@mui/material", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mui/material")>();
  return {
    ...actual,
    useMediaQuery: () => useMediaQueryMock(),
  };
});

const longFunction =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::public_apis::call";

const payload = {
  function: longFunction,
  type_arguments: [],
  arguments: [
    {
      inner:
        "0xadd54349a08430067cd5a6e32815faaf9d9f595a6e44bdc59d553a2b61fe1ac1",
    },
    5000,
  ],
  type: "entry_function_payload",
};

describe("FEAT-TXN-005 — JsonViewCard value interactions", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    useMediaQueryMock.mockReturnValue(false);
  });

  it("copies the complete raw value from a row button without hover", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {writeText},
    });

    render(<JsonViewCard data={payload} />);
    const copyButton = await screen.findByRole("button", {
      name: "Copy function value",
    });

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(longFunction);
    });
  });

  it("keeps long-string expansion separate from copying", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {writeText},
    });

    const {container} = render(<JsonViewCard data={payload} />);
    const truncatedValue = await waitFor(() => {
      const value = container.querySelector(".w-rjv-value-short");
      if (!value) throw new Error("Truncated value has not rendered yet");
      return value;
    });

    fireEvent.click(truncatedValue);

    expect(writeText).not.toHaveBeenCalled();
    expect(container.querySelector(".w-rjv-value-short")).toBeNull();
    expect(container.textContent).toContain(longFunction);
  });

  it("offers a copy action for the full JSON value", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {writeText},
    });

    render(<JsonViewCard data={payload} />);

    const copyJsonButton = await screen.findByRole("button", {
      name: "Copy JSON",
    });
    fireEvent.click(copyJsonButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(JSON.stringify(payload, null, 2));
    });
  });

  it("copies copyData instead of display data when provided", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {writeText},
    });

    const raw = '{"foo":"bar"}';
    render(<JsonViewCard data={{__PLACEHOLDER__: raw}} copyData={raw} />);

    fireEvent.click(await screen.findByRole("button", {name: "Copy JSON"}));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(raw);
    });
  });

  it("reports a failed clipboard write", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {writeText},
    });

    render(<JsonViewCard data={payload} />);

    fireEvent.click(await screen.findByRole("button", {name: "Copy JSON"}));

    await waitFor(() => {
      expect(screen.getByRole("button", {name: "Copy failed"})).toBeTruthy();
    });
  });

  it("uses a compact copy icon on mobile viewports", async () => {
    useMediaQueryMock.mockReturnValue(true);

    render(<JsonViewCard data={payload} />);

    const copyJsonButton = await screen.findByRole("button", {
      name: "Copy JSON",
    });

    expect(copyJsonButton.className).toContain("MuiIconButton-root");
    expect(copyJsonButton.className).not.toContain("MuiButton-fullWidth");
  });

  it("keeps row copy buttons visible on mobile without hover", async () => {
    useMediaQueryMock.mockReturnValue(true);

    render(<JsonViewCard data={payload} />);

    await screen.findByRole("button", {name: "Copy function value"});
  });
});
