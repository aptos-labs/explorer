// @vitest-environment jsdom
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {cleanup, render} from "@testing-library/react";
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

vi.mock("../../../../components/HashButton", () => ({
  default: function HashButtonStub({hash}: {hash: string}) {
    return <span data-testid="hash-stub">{hash.slice(0, 6)}…</span>;
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

import SignatureOverviewTable from "./SignatureOverviewTable";

const theme = createTheme();

function withTheme(ui: ReactNode) {
  return <ThemeProvider theme={theme}>{ui}</ThemeProvider>;
}

const ed25519Account = {
  type: "ed25519_signature",
  public_key:
    "0x8d2a6dc60eaeacf89cba9e53db787d77165c63be218175c24009252eaf57c513",
  signature:
    "0x19ad346523d83bd0626aaf8e6910c4ec1f54f124eb6fefc2fdd004619e54a281ca4ae756675d331458bd968a1cf7a42263fc6fe1aebe0cd91d041bd291355503",
};

describe("SignatureOverviewTable — FEAT-TXN-002", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Ed25519 signature as labeled rows (fee-statement-style table)", () => {
    const {container} = render(
      withTheme(<SignatureOverviewTable signature={ed25519Account} />),
    );

    const text = container.textContent ?? "";
    expect(container.querySelector("table")).toBeTruthy();
    expect(text).toContain("Scheme");
    expect(text).toContain("Public key");
    expect(text).toContain("Signature");
    expect(text).toContain("Ed25519");
  });

  it("shows empty state when signature is missing", () => {
    const {container} = render(
      withTheme(<SignatureOverviewTable signature={undefined} />),
    );
    expect(container.textContent).toContain("N/A");
  });

  it("renders multi-Ed25519 threshold, bitmap, and per-key rows", () => {
    const signature = {
      type: "multi_ed25519_signature",
      public_keys: [
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222222222222222222222222222",
      ],
      signatures: [
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ],
      threshold: "2",
      bitmap: "0x03",
    };

    const {container} = render(
      withTheme(<SignatureOverviewTable signature={signature} />),
    );
    const text = container.textContent ?? "";
    expect(text).toContain("Multi-Ed25519");
    expect(text).toContain("Threshold");
    expect(text).toContain("2");
    expect(text).toContain("Bitmap");
    expect(text).toContain("Public key 1");
    expect(text).toContain("Public key 2");
    expect(text).toContain("Signature 1");
    expect(text).toContain("Signature 2");
  });

  it("renders single_sender public key and signature sub-objects", () => {
    const signature = {
      type: "single_sender",
      public_key: {type: "ed25519", value: ed25519Account.public_key},
      signature: {type: "ed25519", value: ed25519Account.signature},
    };

    const {container} = render(
      withTheme(<SignatureOverviewTable signature={signature} />),
    );
    const text = container.textContent ?? "";
    expect(text).toContain("Single sender");
    expect(text).toContain("Public key type");
    expect(text).toContain("ed25519");
    expect(text).toContain("Signature type");
  });

  it("renders multi_agent_signature with nested sender and secondary signers", () => {
    const secondaryAddr =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const signature = {
      type: "multi_agent_signature",
      sender: ed25519Account,
      secondary_signer_addresses: [secondaryAddr],
      secondary_signers: [ed25519Account],
    };

    const {container} = render(
      withTheme(<SignatureOverviewTable signature={signature} />),
    );
    const text = container.textContent ?? "";
    expect(text).toContain("Multi-agent");
    expect(text).toContain("Top-level scheme");
    expect(text).toContain("Primary signer authenticator");
    expect(text).toContain("Secondary signer 1 (address)");
  });

  it("uses distinct React keys when secondary signer addresses repeat", () => {
    const addr =
      "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
    const signature = {
      type: "multi_agent_signature",
      sender: ed25519Account,
      secondary_signer_addresses: [addr, addr],
      secondary_signers: [ed25519Account, ed25519Account],
    };

    const {container} = render(
      withTheme(<SignatureOverviewTable signature={signature} />),
    );
    expect(container.querySelectorAll("table").length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it("renders fee_payer_signature with fee payer address and nested signers", () => {
    const feePayer =
      "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
    const signature = {
      type: "fee_payer_signature",
      fee_payer_address: feePayer,
      sender: ed25519Account,
      secondary_signer_addresses: [],
      secondary_signers: [],
      fee_payer_signer: ed25519Account,
    };

    const {container} = render(
      withTheme(<SignatureOverviewTable signature={signature} />),
    );
    const text = container.textContent ?? "";
    expect(text).toContain("Fee payer");
    expect(text).toContain("Fee payer address");
    expect(text).toContain("Fee payer signer");
    expect(text).toContain("Authenticator used by the fee payer");
  });

  it("falls back to raw JSON view for unknown nested signature shape", () => {
    const signature = {
      type: "custom_wrapper",
      inner: {a: 1},
    };

    const {getByTestId} = render(
      withTheme(<SignatureOverviewTable signature={signature} />),
    );
    expect(getByTestId("json-view-stub").textContent).toContain(
      "custom_wrapper",
    );
  });

  it("renders Signer data JSON fallback for unrecognized account authenticator", () => {
    const inner = {type: "not_a_real_variant", foo: "bar"};
    const signature = {
      type: "multi_agent_signature",
      sender: inner,
      secondary_signer_addresses: [],
      secondary_signers: [],
    };

    const {getByTestId} = render(
      withTheme(<SignatureOverviewTable signature={signature} />),
    );
    expect(getByTestId("json-view-stub").textContent).toContain(
      "not_a_real_variant",
    );
  });
});
