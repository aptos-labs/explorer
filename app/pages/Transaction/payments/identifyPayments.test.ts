// Covers FEAT-TXN-016 — transaction Payments tab identification
import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {CONFIDENTIAL_ASSET_EVENT_TYPES} from "../confidentialAsset/parseConfidentialAssetEvents";
import {CLIENT_SIDE_PAYMENT_TRACKER} from "./clientTrace";
import {
  canonicalAssetId,
  identifyPayments,
  isControlledTransferFunction,
  parseExchangeEvent,
  parsePaymentFees,
  P2P_ENTRY_FUNCTIONS,
  sameAddress,
} from "./identifyPayments";
import {paymentFlowToMermaid, shouldRenderPaymentMermaid} from "./mermaid";

const SENDER =
  "0x00000000000000000000000000000000000000000000000000000000000000aa";
const RECEIVER =
  "0x00000000000000000000000000000000000000000000000000000000000000bb";
const PARTNER =
  "0x00000000000000000000000000000000000000000000000000000000000000cc";
const SENDER_STORE =
  "0x0000000000000000000000000000000000000000000000000000000000000aaa";
const RECEIVER_STORE =
  "0x0000000000000000000000000000000000000000000000000000000000000bbb";
const PARTNER_STORE =
  "0x0000000000000000000000000000000000000000000000000000000000000ccc";
const USDC =
  "0x0000000000000000000000000000000000000000000000000000000000000cdc";

function makeEvent(
  type: string,
  data: Record<string, unknown>,
  account = SENDER,
): Types.Event {
  return {
    guid: {creation_number: "0", account_address: account},
    sequence_number: "0",
    type,
    data,
  };
}

function makeStoreChanges(store: string, owner: string, metadata = "0xa") {
  return [
    {
      type: "write_resource" as const,
      address: store,
      state_key_hash: "0x",
      data: {
        type: "0x1::object::ObjectCore",
        data: {owner},
      },
    },
    {
      type: "write_resource" as const,
      address: store,
      state_key_hash: "0x",
      data: {
        type: "0x1::fungible_asset::FungibleStore",
        data: {metadata: {inner: metadata}, balance: "0", frozen: false},
      },
    },
  ];
}

function makeUserTx(
  overrides: Partial<Types.Transaction_UserTransaction> = {},
): Types.Transaction_UserTransaction {
  return {
    type: "user_transaction",
    version: "1",
    hash: "0xabc",
    state_change_hash: "0x",
    event_root_hash: "0x",
    state_checkpoint_hash: null,
    gas_used: "100",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "0x",
    changes: [],
    sender: SENDER,
    sequence_number: "0",
    max_gas_amount: "10000",
    gas_unit_price: "100",
    expiration_timestamp_secs: "999999999",
    payload: {
      type: "entry_function_payload",
      function: "0x1::aptos_account::transfer",
      type_arguments: [],
      arguments: [RECEIVER, "100000000"],
    },
    events: [],
    timestamp: "1000000",
    ...overrides,
  };
}

function feeStatementEvent(): Types.Event {
  return makeEvent("0x1::transaction_fee::FeeStatement", {
    execution_gas_units: "80",
    io_gas_units: "20",
    storage_fee_octas: "500",
    storage_fee_refund_octas: "200",
    total_charge_gas_units: "100",
  });
}

describe("FEAT-TXN-016 — helpers", () => {
  it("recognizes P2P and controlled entry functions", () => {
    expect(P2P_ENTRY_FUNCTIONS.has("0x1::aptos_account::transfer")).toBe(true);
    expect(
      isControlledTransferFunction(
        "0x1::dispatchable_fungible_asset::transfer",
      ),
    ).toBe(true);
    expect(
      isControlledTransferFunction("0xabc::stablecoin::transfer_with_ref"),
    ).toBe(true);
    expect(isControlledTransferFunction("0x1::aptos_account::transfer")).toBe(
      false,
    );
  });

  it("canonicalizes APT coin and FA metadata to the same asset", () => {
    expect(canonicalAssetId("0xa")).toBe(
      canonicalAssetId("0x1::aptos_coin::AptosCoin"),
    );
  });

  it("compares addresses after padding", () => {
    expect(sameAddress("0xaa", SENDER)).toBe(true);
    expect(sameAddress(SENDER, RECEIVER)).toBe(false);
  });
});

describe("FEAT-TXN-016 — P2P transfers", () => {
  it("identifies a direct APT transfer from payload when events are missing", () => {
    const result = identifyPayments({transaction: makeUserTx()});
    expect(result.primaryKind).toBe("p2p");
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].kind).toBe("p2p");
    expect(result.steps[0].from).toBe(SENDER);
    expect(result.steps[0].to).toBe(RECEIVER);
    expect(result.steps[0].amount?.visibility).toBe("public");
    expect(result.steps[0].amount?.raw).toBe("100000000");
    expect(result.headline).toMatch(/Peer-to-peer/i);
    expect(result.explanation).toMatch(/no intermediary/i);
  });

  it("pairs FA withdraw/deposit events into a P2P hop", () => {
    const tx = makeUserTx({
      changes: [
        ...makeStoreChanges(SENDER_STORE, SENDER),
        ...makeStoreChanges(RECEIVER_STORE, RECEIVER),
      ],
      events: [
        makeEvent("0x1::fungible_asset::Withdraw", {
          store: SENDER_STORE,
          amount: "5000",
        }),
        makeEvent("0x1::fungible_asset::Deposit", {
          store: RECEIVER_STORE,
          amount: "5000",
        }),
        feeStatementEvent(),
      ],
    });
    const result = identifyPayments({transaction: tx});
    const p2p = result.steps.find((step) => step.kind === "p2p");
    expect(p2p).toBeDefined();
    expect(p2p?.from).toBe(SENDER);
    expect(p2p?.to).toBe(RECEIVER);
    expect(p2p?.amount?.raw).toBe("5000");
  });

  it("expands batch FA transfers into multiple P2P steps", () => {
    const third =
      "0x00000000000000000000000000000000000000000000000000000000000000dd";
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::aptos_account::batch_transfer_fungible_assets",
        type_arguments: [],
        arguments: ["0xa", [RECEIVER, third], ["10", "20"]],
      },
    });
    const result = identifyPayments({transaction: tx});
    expect(result.steps).toHaveLength(2);
    expect(result.steps.every((step) => step.kind === "p2p")).toBe(true);
    expect(shouldRenderPaymentMermaid(result.steps.length)).toBe(true);
    expect(paymentFlowToMermaid(result.flow)).toContain("flowchart LR");
  });
});

describe("FEAT-TXN-016 — controlled transfers", () => {
  it("labels dispatchable FA transfers as partner-controlled", () => {
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::dispatchable_fungible_asset::transfer",
        type_arguments: [],
        arguments: [{inner: SENDER_STORE}, {inner: RECEIVER_STORE}, "1000"],
      },
      changes: [
        ...makeStoreChanges(SENDER_STORE, SENDER, USDC),
        ...makeStoreChanges(RECEIVER_STORE, RECEIVER, USDC),
      ],
    });
    const result = identifyPayments({transaction: tx});
    expect(result.primaryKind).toBe("controlled");
    expect(result.steps[0].partnerLabel).toMatch(
      /TransferRef|dispatchable|partner/i,
    );
    expect(result.explanation).toMatch(/partner/i);
  });

  it("detects a multi-hop payment through an intermediary", () => {
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0xpay::rail::settle",
        type_arguments: [],
        arguments: [],
      },
      changes: [
        ...makeStoreChanges(SENDER_STORE, SENDER, USDC),
        ...makeStoreChanges(PARTNER_STORE, PARTNER, USDC),
        ...makeStoreChanges(RECEIVER_STORE, RECEIVER, USDC),
      ],
      events: [
        makeEvent("0x1::fungible_asset::Withdraw", {
          store: SENDER_STORE,
          amount: "100",
        }),
        makeEvent("0x1::fungible_asset::Deposit", {
          store: PARTNER_STORE,
          amount: "100",
        }),
        makeEvent("0x1::fungible_asset::Withdraw", {
          store: PARTNER_STORE,
          amount: "100",
        }),
        makeEvent("0x1::fungible_asset::Deposit", {
          store: RECEIVER_STORE,
          amount: "100",
        }),
      ],
    });
    const result = identifyPayments({transaction: tx});
    expect(result.steps.length).toBeGreaterThanOrEqual(2);
    expect(result.steps.every((step) => step.kind === "controlled")).toBe(true);
    expect(shouldRenderPaymentMermaid(result.steps.length)).toBe(true);
    const mermaid = paymentFlowToMermaid(result.flow);
    expect(mermaid.split("\n").length).toBeGreaterThan(3);
  });

  it("records a partner skim when withdraw exceeds deposit", () => {
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::dispatchable_fungible_asset::transfer",
        type_arguments: [],
        arguments: [{inner: SENDER_STORE}, {inner: RECEIVER_STORE}, "100"],
      },
      changes: [
        ...makeStoreChanges(SENDER_STORE, SENDER, USDC),
        ...makeStoreChanges(RECEIVER_STORE, RECEIVER, USDC),
      ],
      events: [
        makeEvent("0x1::fungible_asset::Withdraw", {
          store: SENDER_STORE,
          amount: "100",
        }),
        makeEvent("0x1::fungible_asset::Deposit", {
          store: RECEIVER_STORE,
          amount: "97",
        }),
      ],
    });
    const result = identifyPayments({transaction: tx});
    expect(result.steps[0].partnerFee?.raw).toBe("3");
    expect(result.fees.some((fee) => fee.kind === "partner")).toBe(true);
  });
});

describe("FEAT-TXN-016 — confidential transfers", () => {
  it("hides encrypted transfer amounts even when the sender wallet is connected", () => {
    const tx = makeUserTx({
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
        makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.transferred, {
          from: SENDER,
          to: RECEIVER,
          asset_type: {inner: "0xa"},
        }),
      ],
    });
    const result = identifyPayments({
      transaction: tx,
      connectedWallet: SENDER,
    });
    const step = result.steps.find((s) => s.kind === "confidential");
    expect(step).toBeDefined();
    expect(step?.amount?.visibility).toBe("encrypted");
    expect(step?.amount?.raw).toBeUndefined();
    expect(step?.amount?.involvesConnectedWallet).toBe(true);
    expect(result.involvesConnectedWallet).toBe(true);
    expect(result.explanation).toMatch(/encrypted/i);
    expect(result.explanation).toMatch(/auditor/i);
    expect(result.explanation).not.toMatch(/\b100000000\b/);
  });

  it("does not reveal encrypted amounts to an uninvolved connected wallet", () => {
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::confidential_asset::confidential_transfer_raw",
        type_arguments: [],
        arguments: [{inner: "0xa"}, RECEIVER],
      },
      events: [
        makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.transferred, {
          from: SENDER,
          to: RECEIVER,
          asset_type: {inner: "0xa"},
        }),
      ],
    });
    const result = identifyPayments({
      transaction: tx,
      connectedWallet: PARTNER,
    });
    expect(result.steps[0].amount?.visibility).toBe("encrypted");
    expect(result.steps[0].amount?.involvesConnectedWallet).toBe(false);
    expect(result.explanation).toMatch(/not a party/i);
  });

  it("shows plaintext amounts for confidential → public withdraws", () => {
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::confidential_asset::withdraw_to_raw",
        type_arguments: [],
        arguments: ["0x", {inner: "0xa"}, RECEIVER, "42"],
      },
      events: [
        makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.withdrawn, {
          from: SENDER,
          to: RECEIVER,
          asset_type: {inner: "0xa"},
          amount: "42",
        }),
      ],
    });
    const result = identifyPayments({transaction: tx});
    const step = result.steps.find((s) => s.kind === "confidential_to_public");
    expect(step?.amount?.visibility).toBe("public");
    expect(step?.amount?.raw).toBe("42");
    expect(result.headline).toMatch(/Confidential → public/);
  });

  it("shows plaintext amounts for public → confidential deposits", () => {
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::confidential_asset::deposit",
        type_arguments: [],
        arguments: [{inner: "0xa"}, "99"],
      },
      events: [
        makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.deposited, {
          addr: SENDER,
          asset_type: {inner: "0xa"},
          amount: "99",
        }),
      ],
    });
    const result = identifyPayments({transaction: tx});
    const step = result.steps.find((s) => s.kind === "public_to_confidential");
    expect(step?.amount?.raw).toBe("99");
    expect(result.headline).toMatch(/Public → confidential/);
  });
});

describe("FEAT-TXN-016 — exchange inputs and outputs", () => {
  it("parses Pancake-style SwapEvent type arguments", () => {
    const event = makeEvent(
      "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::SwapEvent<0x1::aptos_coin::AptosCoin, 0x1::usdc::USDC>",
      {
        amount_x_in: "1000",
        amount_y_in: "0",
        amount_x_out: "0",
        amount_y_out: "500",
      },
    );
    const swap = parseExchangeEvent(event);
    expect(swap?.amountIn).toBe("1000");
    expect(swap?.amountOut).toBe("500");
    expect(swap?.assetIn).toContain("aptos_coin");
    expect(swap?.assetOut).toContain("usdc");
  });

  it("identifies exchange I/O from a swap event", () => {
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function:
          "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::router::swap",
        type_arguments: [],
        arguments: [],
      },
      events: [
        makeEvent(
          "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::SwapEvent<0x1::aptos_coin::AptosCoin, 0x1::usdc::USDC>",
          {
            amount_x_in: "1000",
            amount_y_in: "0",
            amount_x_out: "0",
            amount_y_out: "500",
          },
        ),
      ],
    });
    const result = identifyPayments({transaction: tx});
    expect(result.primaryKind).toBe("exchange");
    expect(result.steps[0].amount?.raw).toBe("1000");
    expect(result.steps[0].amountOut?.raw).toBe("500");
    expect(result.explanation).toMatch(/inputs and outputs/i);
  });

  it("infers exchange I/O from mixed asset movements when no swap event exists", () => {
    const usdcStoreIn =
      "0x0000000000000000000000000000000000000000000000000000000000000d01";
    const aptStoreOut =
      "0x0000000000000000000000000000000000000000000000000000000000000d02";
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0xdex::pool::swap_anonymous",
        type_arguments: [],
        arguments: [],
      },
      changes: [
        ...makeStoreChanges(aptStoreOut, SENDER, "0xa"),
        ...makeStoreChanges(usdcStoreIn, SENDER, USDC),
      ],
      events: [
        makeEvent("0x1::fungible_asset::Withdraw", {
          store: aptStoreOut,
          amount: "1000",
        }),
        makeEvent("0x1::fungible_asset::Deposit", {
          store: usdcStoreIn,
          amount: "2500",
        }),
      ],
    });
    const result = identifyPayments({transaction: tx});
    const exchange = result.steps.find((step) => step.kind === "exchange");
    expect(exchange).toBeDefined();
    expect(exchange?.amount?.raw).toBe("1000");
    expect(exchange?.amountOut?.raw).toBe("2500");
  });
});

describe("FEAT-TXN-016 — fees", () => {
  it("breaks down FeeStatement gas, storage, refund, and net", () => {
    const tx = makeUserTx({
      events: [feeStatementEvent()],
      signature: {
        type: "fee_payer_signature",
        fee_payer_address: PARTNER,
        sender: {
          type: "ed25519_signature",
          public_key: "0x0",
          signature: "0x0",
        },
        fee_payer_signer: {
          type: "ed25519_signature",
          public_key: "0x0",
          signature: "0x0",
        },
        secondary_signer_addresses: [],
        secondary_signers: [],
      } as Types.TransactionSignature,
    });
    const fees = parsePaymentFees(tx);
    expect(fees.find((f) => f.kind === "execution")?.amountOctas).toBe("8000");
    expect(fees.find((f) => f.kind === "io")?.amountOctas).toBe("2000");
    expect(fees.find((f) => f.kind === "storage")?.amountOctas).toBe("500");
    expect(fees.find((f) => f.kind === "storage_refund")?.amountOctas).toBe(
      "200",
    );
    const net = fees.find((f) => f.kind === "net");
    expect(net?.amountOctas).toBe("9800");
    expect(net?.payer).toBe(PARTNER);
    expect(net?.explanation).toMatch(/fee payer/i);
  });

  it("still reports fees when no token payment is identified", () => {
    const tx = makeUserTx({
      payload: {
        type: "entry_function_payload",
        function: "0x1::account::rotate_authentication_key",
        type_arguments: [],
        arguments: [],
      },
      events: [feeStatementEvent()],
    });
    const result = identifyPayments({transaction: tx});
    expect(result.primaryKind).toBe("fees_only");
    expect(result.headline).toMatch(/Network fees only/);
    expect(result.fees.some((fee) => fee.kind === "net")).toBe(true);
  });
});

describe("FEAT-TXN-016 — mermaid + client-side tracker", () => {
  it("escapes mermaid labels and skips the diagram for a single step", () => {
    expect(shouldRenderPaymentMermaid(1)).toBe(false);
    expect(shouldRenderPaymentMermaid(2)).toBe(true);
    const mermaid = paymentFlowToMermaid({
      nodes: [
        {id: "nSender", label: 'Alice "A" [from]', role: "account"},
        {id: "nRecv", label: "Bob", role: "account"},
      ],
      edges: [
        {from: "nSender", to: "nRecv", label: "10 APT | secret", kind: "p2p"},
      ],
    });
    expect(mermaid).toContain("flowchart LR");
    expect(mermaid).not.toContain('"A"');
    expect(mermaid).not.toContain("[from]");
    expect(mermaid).toContain("nSender");
  });

  it("keeps the client-side call-graph tracker disabled", () => {
    expect(CLIENT_SIDE_PAYMENT_TRACKER.enabled).toBe(false);
    const result = identifyPayments({
      transaction: makeUserTx(),
      source: "client_trace",
    });
    expect(result.source).toBe("client_trace");
    expect(result.clientTraceAvailable).toBe(false);
    expect(result.steps[0].kind).toBe("p2p");
  });

  it("does not identify payments on block metadata transactions", () => {
    const result = identifyPayments({
      transaction: {type: "block_metadata_transaction"} as Types.Transaction,
    });
    expect(result.primaryKind).toBe("none");
    expect(result.steps).toHaveLength(0);
  });
});
