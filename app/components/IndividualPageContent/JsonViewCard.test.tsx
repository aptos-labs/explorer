// @vitest-environment jsdom
import {fireEvent, render, waitFor} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";
import JsonViewCard from "./JsonViewCard";

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
    vi.restoreAllMocks();
  });

  it("copies the complete raw value from the row copy button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {writeText},
    });

    const {container} = render(<JsonViewCard data={payload} />);
    const functionRow = await waitFor(() => {
      const row = Array.from(container.querySelectorAll(".w-rjv-line")).find(
        (candidate) => candidate.textContent?.includes("function"),
      );
      if (!row) throw new Error("Function row has not rendered yet");
      return row;
    });

    fireEvent.mouseEnter(functionRow);

    const copyButton = await waitFor(() => {
      const button = functionRow.querySelector(
        'button[aria-label="Copy function value"]',
      );
      if (!button) throw new Error("Copy button has not appeared yet");
      return button;
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
});
