// Covers FEAT-TXN-009 — confidential asset event and payload parsing
import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {
  CONFIDENTIAL_ASSET_EVENT_TYPES,
  confidentialAssetEventParsers,
  parseConfidentialAssetFromPayload,
  parseConfidentialDepositEvent,
  parseConfidentialKeyRotationEvent,
  parseConfidentialNormalizeEvent,
  parseConfidentialRegisterEvent,
  parseConfidentialRolloverEvent,
  parseConfidentialTransferEvent,
  parseConfidentialWithdrawEvent,
} from "./parseConfidentialAssetEvents";

function makeEvent(type: string, data: Record<string, unknown>): Types.Event {
  return {
    guid: {creation_number: "0", account_address: "0x1"},
    sequence_number: "0",
    type,
    data,
  };
}

function makeUserTx(
  functionId: string,
  args: unknown[],
  sender = "0x323842ee0d7b9e4c343ceaf604d0ee5942b82938fbb0fbea70db791bde2574b3",
): Types.Transaction {
  return {
    type: "user_transaction",
    version: "1",
    hash: "0x1",
    state_change_hash: "0x0",
    event_root_hash: "0x0",
    state_checkpoint_hash: null,
    gas_used: "1",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "0x0",
    changes: [],
    sender,
    sequence_number: "1",
    max_gas_amount: "100",
    gas_unit_price: "100",
    expiration_timestamp_secs: "0",
    payload: {
      type: "entry_function_payload",
      function: functionId,
      type_arguments: [],
      arguments: args,
    },
    signature: {
      type: "ed25519_signature",
      public_key: "0x0",
      signature: "0x0",
    },
    events: [],
    timestamp: "0",
  };
}

// Fixture from testnet txn 11057176761 (confidential_transfer_raw → Transferred)
const TRANSFERRED_EVENT_V11057176761 = makeEvent(
  CONFIDENTIAL_ASSET_EVENT_TYPES.transferred,
  {
    __variant__: "V1",
    from: "0x323842ee0d7b9e4c343ceaf604d0ee5942b82938fbb0fbea70db791bde2574b3",
    to: "0x74fe48393d7f82440b6945d4fcd24aa4aa095aee283354aa4434852fde9be2f6",
    asset_type: {inner: "0xa"},
    amount: {
      compressed_P: [
        {
          data: "0x7a4a5ec8f255956b436b01efab33fbb23a7fe531a09533cd0e6673b583d05e0f",
        },
      ],
      compressed_R_sender: [],
      compressed_R_recip: [],
      compressed_R_eff_aud: [],
      compressed_R_volun_auds: [],
    },
    memo: "0x",
    ek_volun_auds: [],
    sender_auditor_hint: {vec: []},
    new_sender_available_balance: {P: [], R: [], R_aud: 0},
    new_recip_pending_balance: {P: [], R: [], R_aud: 0},
  },
);

describe("FEAT-TXN-009 — parseConfidentialTransferEvent", () => {
  it("parses Transferred from txn 11057176761", () => {
    const result = parseConfidentialTransferEvent(
      TRANSFERRED_EVENT_V11057176761,
    );
    expect(result).toEqual({
      actionType: "confidential asset",
      subAction: "transfer",
      metadata: "0xa",
      from: "0x323842ee0d7b9e4c343ceaf604d0ee5942b82938fbb0fbea70db791bde2574b3",
      to: "0x74fe48393d7f82440b6945d4fcd24aa4aa095aee283354aa4434852fde9be2f6",
    });
    expect(result?.amount).toBeUndefined();
  });

  it("returns undefined for unrelated events", () => {
    expect(
      parseConfidentialTransferEvent(
        makeEvent("0x1::fungible_asset::Deposit", {}),
      ),
    ).toBeUndefined();
  });
});

describe("FEAT-TXN-009 — parseConfidentialDepositEvent", () => {
  it("parses Deposited with plaintext amount", () => {
    const result = parseConfidentialDepositEvent(
      makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.deposited, {
        __variant__: "V1",
        addr: "0xabc",
        amount: "1000000",
        asset_type: {inner: "0xa"},
      }),
    );
    expect(result).toEqual({
      actionType: "confidential asset",
      subAction: "deposit",
      metadata: "0xa",
      addr: "0xabc",
      amount: "1000000",
    });
  });
});

describe("FEAT-TXN-009 — parseConfidentialWithdrawEvent", () => {
  it("parses Withdrawn with plaintext amount and recipient", () => {
    const result = parseConfidentialWithdrawEvent(
      makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.withdrawn, {
        __variant__: "V1",
        from: "0xabc",
        to: "0xdef",
        amount: "500",
        asset_type: {inner: "0xa"},
      }),
    );
    expect(result).toEqual({
      actionType: "confidential asset",
      subAction: "withdraw",
      metadata: "0xa",
      from: "0xabc",
      to: "0xdef",
      amount: "500",
    });
  });
});

describe("FEAT-TXN-009 — lifecycle event parsers", () => {
  it("parses Registered", () => {
    expect(
      parseConfidentialRegisterEvent(
        makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.registered, {
          addr: "0x1",
          asset_type: {inner: "0xa"},
        }),
      ),
    ).toEqual({
      actionType: "confidential asset",
      subAction: "register",
      metadata: "0xa",
      addr: "0x1",
    });
  });

  it("parses RolledOver", () => {
    expect(
      parseConfidentialRolloverEvent(
        makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.rolledOver, {
          addr: "0x1",
          asset_type: {inner: "0xa"},
        }),
      ),
    ).toEqual({
      actionType: "confidential asset",
      subAction: "rollover",
      metadata: "0xa",
      addr: "0x1",
    });
  });

  it("parses Normalized", () => {
    expect(
      parseConfidentialNormalizeEvent(
        makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.normalized, {
          addr: "0x1",
          asset_type: {inner: "0xa"},
        }),
      ),
    ).toEqual({
      actionType: "confidential asset",
      subAction: "normalize",
      metadata: "0xa",
      addr: "0x1",
    });
  });

  it("parses KeyRotated", () => {
    expect(
      parseConfidentialKeyRotationEvent(
        makeEvent(CONFIDENTIAL_ASSET_EVENT_TYPES.keyRotated, {
          addr: "0x1",
          asset_type: {inner: "0xa"},
        }),
      ),
    ).toEqual({
      actionType: "confidential asset",
      subAction: "key_rotation",
      metadata: "0xa",
      addr: "0x1",
    });
  });
});

describe("FEAT-TXN-009 — parseConfidentialAssetFromPayload", () => {
  it("parses confidential_transfer_raw when no Transferred event", () => {
    const tx = makeUserTx(
      "0x1::confidential_asset::confidential_transfer_raw",
      [
        {inner: "0xa"},
        "0x74fe48393d7f82440b6945d4fcd24aa4aa095aee283354aa4434852fde9be2f6",
      ],
    );
    const results = parseConfidentialAssetFromPayload(tx);
    expect(results).toEqual([
      {
        actionType: "confidential asset",
        subAction: "transfer",
        metadata: "0xa",
        from: "0x323842ee0d7b9e4c343ceaf604d0ee5942b82938fbb0fbea70db791bde2574b3",
        to: "0x74fe48393d7f82440b6945d4fcd24aa4aa095aee283354aa4434852fde9be2f6",
      },
    ]);
  });

  it("parses deposit entry function", () => {
    const tx = makeUserTx("0x1::confidential_asset::deposit", [
      {inner: "0xa"},
      "2500",
    ]);
    const results = parseConfidentialAssetFromPayload(tx);
    expect(results).toEqual([
      {
        actionType: "confidential asset",
        subAction: "deposit",
        metadata: "0xa",
        addr: "0x323842ee0d7b9e4c343ceaf604d0ee5942b82938fbb0fbea70db791bde2574b3",
        amount: "2500",
      },
    ]);
  });

  it("skips payload fallback when event already parsed", () => {
    const tx = makeUserTx(
      "0x1::confidential_asset::confidential_transfer_raw",
      [
        {inner: "0xa"},
        "0x74fe48393d7f82440b6945d4fcd24aa4aa095aee283354aa4434852fde9be2f6",
      ],
    );
    const existing = parseConfidentialTransferEvent(
      TRANSFERRED_EVENT_V11057176761,
    );
    expect(existing).toBeDefined();
    if (!existing) {
      return;
    }
    const results = parseConfidentialAssetFromPayload(tx, [existing]);
    expect(results).toEqual([]);
  });
});

describe("FEAT-TXN-009 — confidentialAssetEventParsers registry", () => {
  it("includes all seven event parsers", () => {
    expect(confidentialAssetEventParsers).toHaveLength(7);
  });
});
