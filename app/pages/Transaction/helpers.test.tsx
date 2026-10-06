/** @vitest-environment jsdom */
// Covers FEAT-TXN-002 — info tooltips on transaction overview fields
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it} from "vitest";
import {I18nProvider} from "../../i18n";
import {ExplorerSettingsProvider} from "../../settings";
import {getLearnMoreTooltip} from "./helpers";

const theme = createTheme();

function renderTooltip(field: string) {
  function Wrapper({children}: {children: ReactNode}) {
    return (
      <ExplorerSettingsProvider>
        <I18nProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </I18nProvider>
      </ExplorerSettingsProvider>
    );
  }
  return render(getLearnMoreTooltip(field), {wrapper: Wrapper});
}

async function openTooltip() {
  const icon = document.querySelector("svg");
  expect(icon).toBeTruthy();
  fireEvent.mouseOver(icon as Element);
  fireEvent.mouseEnter(icon as Element);
  return waitFor(() => screen.getByRole("tooltip"));
}

describe("FEAT-TXN-002 — transaction field tooltips", () => {
  afterEach(() => {
    cleanup();
  });

  it("explains status, including that a failure stays on chain", async () => {
    renderTooltip("status");
    const tooltip = await openTooltip();
    expect(tooltip.textContent).toContain(
      "Whether the transaction executed successfully or failed.",
    );
    expect(tooltip.textContent).toContain(
      "A failed transaction is still recorded on chain.",
    );
  });

  it("explains the receiver as the account that received assets", async () => {
    renderTooltip("receiver");
    const tooltip = await openTooltip();
    expect(tooltip.textContent).toContain(
      "The account that received the assets in this transfer.",
    );
  });

  it("explains the smart contract and links to the glossary", async () => {
    renderTooltip("smartContract");
    const tooltip = await openTooltip();
    expect(tooltip.textContent).toContain(
      "The account that published the Move module called by this transaction.",
    );
    const link = tooltip.querySelector("a");
    expect(link?.getAttribute("href")).toBe(
      "https://aptos.dev/en/network/glossary#smart-contract",
    );
    expect(link?.getAttribute("rel")).toContain("noopener");
  });

  it("explains amount as the larger APT deposit or withdrawal", async () => {
    renderTooltip("amount");
    const tooltip = await openTooltip();
    expect(tooltip.textContent).toContain(
      "How much APT this transaction moved.",
    );
    expect(tooltip.textContent).toContain(
      "the larger of total APT deposited and total APT withdrawn",
    );
  });

  it("explains the signature and links to the glossary", async () => {
    renderTooltip("signature");
    const tooltip = await openTooltip();
    expect(tooltip.textContent).toContain(
      "The digital signature that authorizes this transaction.",
    );
    expect(tooltip.textContent).toContain("The sender must sign");
    const link = tooltip.querySelector("a");
    expect(link?.getAttribute("href")).toBe(
      "https://aptos.dev/en/network/glossary#transaction",
    );
  });
});
