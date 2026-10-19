/** @vitest-environment jsdom */
// Covers FEAT-TXLIST-003 / FEAT-TXN-002 — highlighted transfer function labels
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import type {Types} from "~/types/aptos";
import {I18nProvider} from "../../../../i18n";
import {ExplorerSettingsProvider} from "../../../../settings";
import getDesignTokens from "../../../../themes/theme";

vi.mock("../../../../routing", () => ({
  Link: ({children, to}: {children: React.ReactNode; to: string}) => (
    <a href={to}>{children}</a>
  ),
}));

vi.mock("../../../../global-config/GlobalConfig", () => ({
  useNetworkName: () => "mainnet",
}));

import TransactionFunction, {specialTransferKind} from "./TransactionFunction";

const theme = createTheme(getDesignTokens("light"));

function entryTx(functionId: string): Types.Transaction {
  return {
    type: "user_transaction",
    payload: {
      type: "entry_function_payload",
      function: functionId,
      type_arguments: [],
      arguments: [],
    },
  } as unknown as Types.Transaction;
}

function renderFunction(functionId: string) {
  function Wrapper({children}: {children: ReactNode}) {
    return (
      <ExplorerSettingsProvider>
        <I18nProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </I18nProvider>
      </ExplorerSettingsProvider>
    );
  }
  return render(<TransactionFunction transaction={entryTx(functionId)} />, {
    wrapper: Wrapper,
  });
}

describe("FEAT-TXLIST-003 / FEAT-TXN-002 — special transfer labels", () => {
  afterEach(() => {
    cleanup();
  });

  it("classifies coin and primary fungible-store transfers", () => {
    expect(specialTransferKind("0x1::coin::transfer")).toBe("coin");
    expect(specialTransferKind("0x1::aptos_account::transfer")).toBe("coin");
    expect(
      specialTransferKind("0x1::aptos_account::transfer_fungible_assets"),
    ).toBe("fungibleAsset");
    expect(specialTransferKind("0x1::primary_fungible_store::transfer")).toBe(
      "fungibleAsset",
    );
    expect(specialTransferKind("0x1::coin::balance")).toBeUndefined();
    expect(specialTransferKind("0x1::aptos_account::transfer_coins")).toBe(
      undefined,
    );
  });

  it("shows Coin Transfer for coin sends", () => {
    renderFunction("0x1::aptos_account::transfer");
    const link = screen.getByRole("link", {name: "Coin Transfer"});
    expect(link.getAttribute("href")).toBe(
      "/account/0x0000000000000000000000000000000000000000000000000000000000000001/modules/code/aptos_account/transfer",
    );
  });

  it("shows Fungible Asset Transfer for transfer_fungible_assets", () => {
    renderFunction("0x1::aptos_account::transfer_fungible_assets");
    const link = screen.getByRole("link", {name: "Fungible Asset Transfer"});
    expect(link.getAttribute("href")).toBe(
      "/account/0x0000000000000000000000000000000000000000000000000000000000000001/modules/code/aptos_account/transfer_fungible_assets",
    );
    expect(screen.queryByText("Coin Transfer")).toBeNull();
  });

  it("shows Fungible Asset Transfer for primary_fungible_store::transfer", () => {
    renderFunction("0x1::primary_fungible_store::transfer");
    const link = screen.getByRole("link", {name: "Fungible Asset Transfer"});
    expect(link.getAttribute("href")).toBe(
      "/account/0x0000000000000000000000000000000000000000000000000000000000000001/modules/code/primary_fungible_store/transfer",
    );
  });

  it("keeps other entry functions as module::function", () => {
    renderFunction("0x1::coin::balance");
    expect(screen.getByRole("link", {name: "coin::balance"})).toBeTruthy();
    expect(screen.queryByText("Coin Transfer")).toBeNull();
    expect(screen.queryByText("Fungible Asset Transfer")).toBeNull();
  });
});
