/** @vitest-environment jsdom */
// Covers FEAT-TXN-001 / FEAT-TXN-002 — Decibel tab bulk with_repricing + event fallback
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import type {Types} from "~/types/aptos";
import {I18nProvider} from "../../../i18n";
import {ExplorerSettingsProvider} from "../../../settings";

const mediaQueryMock = vi.fn(() => true);

vi.mock("@mui/material", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mui/material")>();
  return {
    ...actual,
    useMediaQuery: () => mediaQueryMock(),
  };
});

vi.mock("../../../api/hooks/useGetCoinList", () => ({
  useGetCoinList: () => ({data: {data: []}}),
}));

vi.mock("../../../api/hooks/useGetAssetMetadata", () => ({
  useGetAssetMetadata: () => ({data: undefined}),
}));

vi.mock("../../../api/hooks/useGetDecibelMarketName", () => ({
  useGetDecibelMarketName: () => ({data: "BTC-PERP"}),
  useGetDecibelMarketConfig: () => ({
    data: {
      name: "BTC-PERP",
      baseAsset: "BTC",
      quoteAsset: "USD",
      priceDecimals: 0,
      szDecimals: 0,
    },
  }),
}));

vi.mock("../../../components/HashButton", () => ({
  default: function HashButtonStub({hash}: {hash: string}) {
    return <span data-testid="hash-stub">{hash}</span>;
  },
  HashType: {
    ACCOUNT: "account",
    OTHERS: "others",
    TRANSACTION: "transaction",
    OBJECT: "object",
    COIN: "coin",
    FUNGIBLE_ASSET: "fungible_asset",
  },
}));

import DecibelTab from "./DecibelTab";

const MAINNET =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

const theme = createTheme();

function withProviders(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  });
  return (
    <QueryClientProvider client={client}>
      <ExplorerSettingsProvider>
        <I18nProvider>
          <ThemeProvider theme={theme}>{ui}</ThemeProvider>
        </I18nProvider>
      </ExplorerSettingsProvider>
    </QueryClientProvider>
  );
}

function baseUserTx(
  overrides: Partial<Types.Transaction_UserTransaction> = {},
): Types.Transaction_UserTransaction {
  return {
    type: "user_transaction",
    version: "7283503314",
    hash: "0xabc",
    state_change_hash: "0x0",
    event_root_hash: "0x0",
    state_checkpoint_hash: null,
    gas_used: "100",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "0x0",
    changes: [],
    sender: "0x1",
    sequence_number: "1",
    max_gas_amount: "1000",
    gas_unit_price: "100",
    expiration_timestamp_secs: "0",
    payload: {
      type: "entry_function_payload",
      function: "0x1::aptos_account::transfer",
      type_arguments: [],
      arguments: [],
    },
    signature: {
      type: "ed25519_signature",
      public_key: "0x1",
      signature: "0x1",
    },
    events: [],
    timestamp: "0",
    ...overrides,
  };
}

function withRepricingPayload(args: unknown[]) {
  return {
    type: "entry_function_payload" as const,
    function: `${MAINNET}::dex_accounts_entry::place_bulk_orders_to_subaccount_with_repricing`,
    type_arguments: [] as string[],
    arguments: args,
  };
}

function placedEvent(overrides: Record<string, unknown> = {}): Types.Event {
  return {
    guid: {creation_number: "0", account_address: "0x0"},
    sequence_number: "0",
    type: `${MAINNET}::market_types::BulkOrderPlacedEvent`,
    data: {
      market: "0xmarket1",
      order_id: "42",
      user: "0xuser1",
      sequence_number: "99",
      previous_seq_num: "98",
      bid_prices: ["5000"],
      bid_sizes: ["100"],
      ask_prices: ["5100"],
      ask_sizes: ["150"],
      cancelled_bid_prices: [],
      cancelled_bid_sizes: [],
      cancelled_ask_prices: [],
      cancelled_ask_sizes: [],
      ...overrides,
    },
  };
}

describe("DecibelTab — bulk with_repricing", () => {
  afterEach(() => {
    cleanup();
    mediaQueryMock.mockReset();
    // Prefer the mobile OrderCard layout so tests avoid GeneralTableRow's
    // router dependency while still covering bulk detail rendering.
    mediaQueryMock.mockReturnValue(true);
  });

  it("shows bulk order and max collapse size from with_repricing payload", () => {
    const txn = baseUserTx({
      payload: withRepricingPayload([
        {inner: "0xsub1"},
        {inner: "0xmarket1"},
        "99",
        ["5000", "4900"],
        ["100", "200"],
        ["5100"],
        ["150"],
        {vec: []},
        {vec: []},
        {vec: ["126040000"]},
      ]),
      events: [placedEvent()],
    });

    render(withProviders(<DecibelTab transaction={txn} />));

    expect(screen.getByText("Orders")).toBeTruthy();
    expect(screen.getByText("Bulk Orders")).toBeTruthy();

    fireEvent.click(screen.getByText("Show details"));
    expect(screen.getByText("Submitted Order")).toBeTruthy();
    expect(screen.getByText("Max Collapse Size")).toBeTruthy();
    expect(
      screen.getByText(
        (content) => content.includes("126") && content.includes("BTC"),
      ),
    ).toBeTruthy();
    expect(screen.getByText("Placed")).toBeTruthy();
  });

  it("shows Unlimited when max_collapse_size Option is none", () => {
    const txn = baseUserTx({
      payload: withRepricingPayload([
        {inner: "0xsub1"},
        {inner: "0xmarket1"},
        "1",
        ["5000"],
        ["100"],
        ["5100"],
        ["150"],
        {vec: []},
        {vec: []},
        {vec: []},
      ]),
    });

    render(withProviders(<DecibelTab transaction={txn} />));
    fireEvent.click(screen.getByText("Show details"));
    expect(screen.getByText("Unlimited")).toBeTruthy();
  });

  it("renders bulk detail from events when no order row was parsed", () => {
    // Deposit payload → no order row; BulkOrderPlacedEvent still has ladders.
    const txn = baseUserTx({
      payload: {
        type: "entry_function_payload",
        function: `${MAINNET}::dex_accounts_entry::deposit_to_subaccount_at`,
        type_arguments: [],
        arguments: [{inner: "0xsub1"}, {inner: "0xasset"}, "1000"],
      },
      events: [placedEvent()],
    });

    render(withProviders(<DecibelTab transaction={txn} />));
    expect(screen.getByText("Orders")).toBeTruthy();
    fireEvent.click(screen.getByText("Show details"));
    expect(screen.getByText("Placed")).toBeTruthy();
    expect(
      screen.getByText((content) => /\$?5,?000/.test(content)),
    ).toBeTruthy();
  });

  it("shows bulk detail beside non-bulk orders when events exist", () => {
    const txn = baseUserTx({
      payload: {
        type: "entry_function_payload",
        function: `${MAINNET}::dex_accounts_entry::deposit_to_subaccount_at`,
        type_arguments: [],
        arguments: [{inner: "0xsub1"}, {inner: "0xasset"}, "1000"],
      },
      events: [
        {
          guid: {creation_number: "0", account_address: "0x0"},
          sequence_number: "0",
          type: `${MAINNET}::market_types::OrderEvent`,
          data: {
            is_bid: true,
            market: "0xmarket1",
            orig_size: "10",
            price: "100",
            status: {__variant__: "OPEN"},
            time_in_force: {__variant__: "GTC"},
            order_id: "1",
            user: "0xuser1",
          },
        },
        placedEvent(),
      ],
    });

    render(withProviders(<DecibelTab transaction={txn} />));
    expect(screen.getByText("Limit Order")).toBeTruthy();
    fireEvent.click(screen.getByText("Show details"));
    expect(screen.getByText("Placed")).toBeTruthy();
  });
});
