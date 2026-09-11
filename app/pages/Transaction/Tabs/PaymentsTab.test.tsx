/** @vitest-environment jsdom */
// Covers FEAT-TXN-016 — Payments tab copy, fees, confidential hiding, mermaid
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {cleanup, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";
import type {Types} from "~/types/aptos";
import {CONFIDENTIAL_ASSET_EVENT_TYPES} from "../confidentialAsset/parseConfidentialAssetEvents";

const walletMock: {account: {address: string} | undefined} = {
  account: undefined,
};

vi.mock("@aptos-labs/wallet-adapter-react", () => ({
  useWallet: () => walletMock,
}));

vi.mock("../../../api/hooks/useGetCoinList", () => ({
  useGetCoinList: () => ({data: {data: []}}),
}));

vi.mock("../../../api/hooks/useGetAssetMetadata", () => ({
  useGetAssetMetadata: () => ({data: undefined}),
}));

vi.mock("../utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils")>();
  return {
    ...actual,
    useTransactionBalanceChanges: () => ({
      data: undefined,
      isLoading: false,
      isError: false,
    }),
  };
});

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

import PaymentsTab from "./PaymentsTab";

const SENDER =
  "0x00000000000000000000000000000000000000000000000000000000000000aa";
const RECEIVER =
  "0x00000000000000000000000000000000000000000000000000000000000000bb";
const THIRD =
  "0x00000000000000000000000000000000000000000000000000000000000000dd";

const theme = createTheme();

function withProviders(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  });
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </QueryClientProvider>
  );
}

function feeStatement(): Types.Event {
  return {
    guid: {
      creation_number: "0",
      account_address: "0x0000000000000000000000000000000000000001",
    },
    sequence_number: "0",
    type: "0x1::transaction_fee::FeeStatement",
    data: {
      execution_gas_units: "8",
      io_gas_units: "2",
      storage_fee_octas: "0",
      storage_fee_refund_octas: "0",
      total_charge_gas_units: "10",
    },
  };
}

function baseUserTx(
  overrides: Partial<Types.Transaction_UserTransaction> = {},
): Types.Transaction_UserTransaction {
  return {
    type: "user_transaction",
    version: "99",
    hash: "0xpay",
    state_change_hash: "0x0",
    event_root_hash: "0x0",
    gas_used: "100",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "0x0",
    changes: [],
    sender: SENDER,
    sequence_number: "1",
    max_gas_amount: "1000",
    gas_unit_price: "100",
    expiration_timestamp_secs: "0",
    payload: {
      type: "entry_function_payload",
      function: "0x1::aptos_account::transfer_coins",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [RECEIVER, "500"],
    },
    signature: {
      type: "ed25519_signature",
      public_key: "0x1",
      signature: "0x2",
    },
    events: [feeStatement()],
    timestamp: "1",
    ...overrides,
  };
}

describe("PaymentsTab — FEAT-TXN-016", () => {
  afterEach(() => {
    cleanup();
    walletMock.account = undefined;
    vi.clearAllMocks();
  });

  it("explains a peer-to-peer transfer and lists gas fees", () => {
    render(withProviders(<PaymentsTab transaction={baseUserTx()} />));

    expect(
      screen.getByRole("heading", {name: /Peer-to-peer transfer/i}),
    ).toBeTruthy();
    expect(screen.getByText(/no intermediary/i)).toBeTruthy();
    expect(screen.getByLabelText("Payment fees")).toBeTruthy();
    expect(screen.getByText(/Net network fee/i)).toBeTruthy();
    expect(screen.getByText("Execution (compute)")).toBeTruthy();
    expect(screen.getByText("I/O (storage access)")).toBeTruthy();
  });

  it("renders mermaid source for multi-step batch transfers", () => {
    const txn = baseUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::aptos_account::batch_transfer_fungible_assets",
        type_arguments: [],
        arguments: ["0xa", [RECEIVER, THIRD], ["10", "20"]],
      },
    });
    render(withProviders(<PaymentsTab transaction={txn} />));

    expect(screen.getByText(/How value moved|Payment flow/i)).toBeTruthy();
    expect(screen.getByLabelText("Payment flow diagram")).toBeTruthy();
    const source = screen.getByLabelText("Mermaid source");
    expect(source.textContent).toMatch(/flowchart LR/);
  });

  it("keeps confidential transfer amounts encrypted when the sender wallet is connected", () => {
    walletMock.account = {address: SENDER};
    const txn = baseUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::confidential_asset::confidential_transfer_raw",
        type_arguments: [],
        arguments: [
          {inner: "0xa"},
          RECEIVER,
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          ["auditor-ek"],
        ],
      },
      events: [
        {
          guid: {creation_number: "0", account_address: SENDER},
          sequence_number: "0",
          type: CONFIDENTIAL_ASSET_EVENT_TYPES.transferred,
          data: {
            from: SENDER,
            to: RECEIVER,
            asset_type: {inner: "0xa"},
          },
        },
        feeStatement(),
      ],
    });
    render(withProviders(<PaymentsTab transaction={txn} />));

    expect(screen.getByText("Amount encrypted")).toBeTruthy();
    expect(screen.getByText(/Involves your connected wallet/i)).toBeTruthy();
    expect(screen.queryByText(/\b500\b/)).toBeNull();
  });
});
