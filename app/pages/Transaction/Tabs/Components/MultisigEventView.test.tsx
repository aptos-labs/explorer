// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render, screen} from "@testing-library/react";
import type {ReactNode} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";

vi.mock("../../../../components/IndividualPageContent/JsonViewCard", () => ({
  default: function JsonViewCardStub({data}: {data: unknown}) {
    return (
      <span data-testid="json-view-stub">
        {typeof data === "object" && data !== null
          ? JSON.stringify(data)
          : String(data)}
      </span>
    );
  },
}));

// The real ResponsiveKeyValueRow renders GeneralTableRow, which depends on the
// router context and app theme. Stub it to a simple label/value layout so this
// test stays focused on MultisigEventView's field mapping.
vi.mock("../../../../components/Table/ResponsiveKeyValueTable", () => ({
  ResponsiveKeyValueTable: ({children}: {children: ReactNode}) => (
    <div>{children}</div>
  ),
  ResponsiveKeyValueRow: ({
    label,
    children,
  }: {
    label: ReactNode;
    children: ReactNode;
  }) => (
    <div>
      <span>{label}</span>
      <span>{children}</span>
    </div>
  ),
}));

vi.mock("../../../../routing", () => ({
  Link: function LinkStub({children}: {children: ReactNode}) {
    return <span data-testid="link-stub">{children}</span>;
  },
}));

vi.mock("../../../../components/HashButton", () => ({
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

import MultisigEventView, {isMultisigEvent} from "./MultisigEventView";

const theme = createTheme();

function withTheme(ui: ReactNode) {
  return <ThemeProvider theme={theme}>{ui}</ThemeProvider>;
}

// Covers FEAT-TXN-004 (multisig event formatting)
describe("MultisigEventView — FEAT-TXN-004", () => {
  afterEach(() => {
    cleanup();
  });

  describe("isMultisigEvent", () => {
    it("matches 0x1::multisig_account events (v1 and v2 naming)", () => {
      expect(
        isMultisigEvent("0x1::multisig_account::TransactionExecutionSucceeded"),
      ).toBe(true);
      expect(isMultisigEvent("0x1::multisig_account::VoteEvent")).toBe(true);
    });

    it("does not match unrelated events", () => {
      expect(isMultisigEvent("0x1::coin::DepositEvent")).toBe(false);
      expect(isMultisigEvent("0x1::transaction_fee::FeeStatement")).toBe(false);
    });
  });

  it("renders a friendly summary chip and labeled rows for TransactionExecutionSucceeded", () => {
    render(
      withTheme(
        <MultisigEventView
          eventType="0x1::multisig_account::TransactionExecutionSucceeded"
          data={{
            multisig_account: "0xabc",
            executor: "0xdef",
            sequence_number: "7",
            num_approvals: "2",
            transaction_payload: "0x1234",
          }}
        />,
      ),
    );

    expect(screen.getByText("Execution Succeeded")).toBeTruthy();
    expect(screen.getByText("Approvals")).toBeTruthy();
    expect(screen.getByText("Sequence Number")).toBeTruthy();
    // Byte length annotation for the payload (0x1234 -> 2 bytes)
    expect(screen.getByText("2 bytes")).toBeTruthy();
  });

  it("decodes the transaction_payload of an execution event into a function", () => {
    render(
      withTheme(
        <MultisigEventView
          eventType="0x1::multisig_account::TransactionExecutionSucceeded"
          data={{
            multisig_account: "0xabc",
            executor: "0xdef",
            sequence_number: "1",
            num_approvals: "1",
            transaction_payload:
              "0x000000000000000000000000000000000000000000000000000000000000000001106d756c74697369675f6163636f756e740c72656d6f76655f6f776e6572000120794b17ff4abc6e98dec576d0ac5d7bd0bd5fb92177f66f971b273b5292d7f21b",
          }}
        />,
      ),
    );

    expect(screen.getByText("Decoded")).toBeTruthy();
    expect(
      screen.getByText("0x1::multisig_account::remove_owner"),
    ).toBeTruthy();
  });

  it("decodes the inner payload of a CreateTransaction event", () => {
    render(
      withTheme(
        <MultisigEventView
          eventType="0x1::multisig_account::CreateTransactionEvent"
          data={{
            creator: "0xcreator",
            sequence_number: "1",
            multisig_account: "0xabc",
            transaction: {
              creation_time_secs: "1685997892",
              creator: "0xcreator",
              payload: {
                vec: [
                  "0x000000000000000000000000000000000000000000000000000000000000000001106d756c74697369675f6163636f756e740c72656d6f76655f6f776e6572000120794b17ff4abc6e98dec576d0ac5d7bd0bd5fb92177f66f971b273b5292d7f21b",
                ],
              },
              payload_hash: {vec: []},
              votes: {data: [{key: "0xcreator", value: true}]},
            },
          }}
        />,
      ),
    );

    expect(
      screen.getByText("0x1::multisig_account::remove_owner"),
    ).toBeTruthy();
    expect(screen.getByText("Approved")).toBeTruthy();
  });

  it("renders an Approved chip for a Vote event", () => {
    render(
      withTheme(
        <MultisigEventView
          eventType="0x1::multisig_account::Vote"
          data={{
            multisig_account: "0xabc",
            owner: "0xowner",
            sequence_number: "3",
            approved: true,
          }}
        />,
      ),
    );

    expect(screen.getByText("Approved")).toBeTruthy();
  });

  it("normalizes the v1 *Event suffix to the same renderer", () => {
    render(
      withTheme(
        <MultisigEventView
          eventType="0x1::multisig_account::VoteEvent"
          data={{
            multisig_account: "0xabc",
            owner: "0xowner",
            sequence_number: "3",
            approved: false,
          }}
        />,
      ),
    );

    expect(screen.getByText("Rejected")).toBeTruthy();
  });

  it("falls back to the raw JSON view for unknown multisig events", () => {
    render(
      withTheme(
        <MultisigEventView
          eventType="0x1::multisig_account::SomethingNew"
          data={{foo: "bar"}}
        />,
      ),
    );

    expect(screen.getByTestId("json-view-stub")).toBeTruthy();
  });

  it("surfaces extra (unconfigured) fields so new framework fields stay visible", () => {
    render(
      withTheme(
        <MultisigEventView
          eventType="0x1::multisig_account::ExecuteRejectedTransaction"
          data={{
            multisig_account: "0xabc",
            executor: "0xdef",
            sequence_number: "1",
            num_rejections: "2",
            future_field: "surprise",
          }}
        />,
      ),
    );

    expect(screen.getByText("Future Field")).toBeTruthy();
    expect(screen.getByText("surprise")).toBeTruthy();
  });
});
