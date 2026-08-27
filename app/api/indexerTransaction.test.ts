import {describe, expect, it, vi} from "vitest";
import {
  getBlockHeightForVersion,
  getTransactionFromIndexer,
  indexerTimestampToMicros,
  indexerTimestampToUnixSeconds,
  isIndexerSourced,
  mapIndexerBlockMetadataTransaction,
  mapIndexerTransactionResult,
  mapIndexerUserTransaction,
} from "./indexerTransaction";

// Covers FEAT-TXN-014 — reconstruct pruned transactions from indexer GraphQL

describe("indexerTimestampToMicros", () => {
  it("converts indexer ISO timestamps to REST microsecond strings", () => {
    // Mainnet user txn 685: indexer timestamp vs archival REST `timestamp`
    expect(indexerTimestampToMicros("2022-10-12T21:26:20.299882")).toBe(
      "1665609980299882",
    );
  });

  it("passes through already-numeric values", () => {
    expect(indexerTimestampToMicros("1665609980299882")).toBe(
      "1665609980299882",
    );
  });

  it("returns 0 for empty or invalid input", () => {
    expect(indexerTimestampToMicros("")).toBe("0");
    expect(indexerTimestampToMicros("not-a-date")).toBe("0");
  });
});

describe("indexerTimestampToUnixSeconds", () => {
  it("converts expiration timestamps to unix seconds", () => {
    expect(indexerTimestampToUnixSeconds("2022-10-12T21:26:49")).toBe(
      "1665610009",
    );
  });
});

describe("mapIndexerUserTransaction", () => {
  const row = {
    version: 685,
    sender:
      "0xfda457fe15be3102b748877e674b4b076b06e4c13e8eaf4d817b5baa77889bf9",
    sequence_number: 0,
    max_gas_amount: 861,
    gas_unit_price: 100,
    expiration_timestamp_secs: "2022-10-12T21:26:49",
    timestamp: "2022-10-12T21:26:20.299882",
    entry_function_id_str: "0x1::stake::update_network_and_fullnode_addresses",
    signature: {
      type: "ed25519_signature",
      signer:
        "0xfda457fe15be3102b748877e674b4b076b06e4c13e8eaf4d817b5baa77889bf9",
      public_key:
        "0x52c68c2ebe3fde3e479d7b04f486745245984daee3411ac1218cf123348603fd",
      signature: "0xabc",
      is_sender_primary: true,
    },
  };

  it("maps user txn fields and derives gas_used from the FA gas-fee row", () => {
    const txn = mapIndexerUserTransaction(row, {
      activities: [
        {
          amount: 57400,
          is_gas_fee: true,
          is_transaction_success: true,
          gas_fee_payer_address: null,
        },
      ],
      tableItems: [
        {
          key: "0x06ab",
          table_handle: "0x1b85",
          decoded_key: "0x06ab",
          decoded_value: "100",
          write_set_change_index: 4,
        },
      ],
    });

    expect(txn.type).toBe("user_transaction");
    expect(txn.version).toBe("685");
    expect(txn.sender).toBe(row.sender);
    expect(txn.gas_used).toBe("574");
    expect(txn.success).toBe(true);
    expect(txn.vm_status).toBe("Executed successfully");
    expect(txn.timestamp).toBe("1665609980299882");
    expect(txn.expiration_timestamp_secs).toBe("1665610009");
    expect(txn.payload).toEqual({
      type: "entry_function_payload",
      function: "0x1::stake::update_network_and_fullnode_addresses",
      type_arguments: [],
      arguments: [],
    });
    expect(txn.signature?.type).toBe("ed25519_signature");
    expect(txn.changes).toHaveLength(1);
    expect(txn.changes[0]).toMatchObject({
      type: "write_table_item",
      handle: "0x1b85",
      key: "0x06ab",
    });
    expect(isIndexerSourced(txn)).toBe(true);
  });

  it("records failed execution from the gas-fee activity", () => {
    const txn = mapIndexerUserTransaction(row, {
      activities: [
        {
          amount: 100,
          is_gas_fee: true,
          is_transaction_success: false,
        },
      ],
    });
    expect(txn.success).toBe(false);
    expect(txn.vm_status).toBe("Execution failed");
  });

  it("uses a script payload when entry_function_id_str is missing", () => {
    const txn = mapIndexerUserTransaction({
      ...row,
      entry_function_id_str: null,
    });
    expect(txn.payload.type).toBe("script_payload");
  });
});

describe("mapIndexerBlockMetadataTransaction", () => {
  it("maps block metadata rows", () => {
    const txn = mapIndexerBlockMetadataTransaction({
      version: 1,
      block_height: 1,
      id: "0x014e",
      epoch: 1,
      round: 2,
      proposer: "0x94",
      timestamp: "2022-10-12T21:22:40.857472",
      previous_block_votes_bitvec: [0],
      failed_proposer_indices: [],
    });
    expect(txn.type).toBe("block_metadata_transaction");
    expect(txn.version).toBe("1");
    expect(txn.proposer).toBe("0x94");
    expect(txn.round).toBe("2");
    expect(isIndexerSourced(txn)).toBe(true);
  });
});

describe("mapIndexerTransactionResult", () => {
  it("prefers user_transactions over block metadata", () => {
    const txn = mapIndexerTransactionResult({
      user_transactions: [
        {
          version: 2,
          sender: "0x1",
          sequence_number: 0,
          max_gas_amount: 1,
          gas_unit_price: 1,
          expiration_timestamp_secs: "2022-10-12T21:26:49",
          timestamp: "2022-10-12T21:26:20.299882",
          entry_function_id_str: "0x1::coin::transfer",
        },
      ],
      block_metadata_transactions: [
        {
          version: 2,
          timestamp: "2022-10-12T21:26:20.299882",
          proposer: "0x2",
        },
      ],
    });
    expect(txn?.type).toBe("user_transaction");
  });

  it("returns null when the indexer has no matching row", () => {
    expect(mapIndexerTransactionResult({user_transactions: []})).toBeNull();
    expect(mapIndexerTransactionResult(null)).toBeNull();
  });
});

describe("getTransactionFromIndexer", () => {
  it("returns null for hash lookups (indexer has no hash column)", async () => {
    const queryIndexer = vi.fn();
    const result = await getTransactionFromIndexer({queryIndexer}, "0xabc");
    expect(result).toBeNull();
    expect(queryIndexer).not.toHaveBeenCalled();
  });

  it("queries by version and maps the result", async () => {
    const queryIndexer = vi.fn().mockResolvedValue({
      user_transactions: [
        {
          version: "685",
          sender: "0x1",
          sequence_number: 0,
          max_gas_amount: 1,
          gas_unit_price: 100,
          expiration_timestamp_secs: "2022-10-12T21:26:49",
          timestamp: "2022-10-12T21:26:20.299882",
          entry_function_id_str: "0x1::coin::transfer",
        },
      ],
      fungible_asset_activities: [
        {amount: 200, is_gas_fee: true, is_transaction_success: true},
      ],
    });

    const txn = await getTransactionFromIndexer({queryIndexer}, "685");
    expect(queryIndexer).toHaveBeenCalledTimes(1);
    expect(queryIndexer.mock.calls[0][0].query.variables).toEqual({
      version: "685",
    });
    expect(txn?.type).toBe("user_transaction");
    expect(txn && "gas_used" in txn ? txn.gas_used : undefined).toBe("2");
  });
});

describe("getBlockHeightForVersion", () => {
  it("returns the user-transaction block height when present", async () => {
    const queryIndexer = vi.fn().mockResolvedValue({
      user_transactions: [{block_height: 12}],
      block_metadata_transactions: [],
    });
    await expect(getBlockHeightForVersion({queryIndexer}, "685")).resolves.toBe(
      "12",
    );
  });

  it("falls back to block metadata when the version is not a user txn", async () => {
    const queryIndexer = vi.fn().mockResolvedValue({
      user_transactions: [],
      block_metadata_transactions: [{block_height: 0}],
    });
    await expect(getBlockHeightForVersion({queryIndexer}, "1")).resolves.toBe(
      "0",
    );
  });

  it("returns null for hash lookups", async () => {
    const queryIndexer = vi.fn();
    await expect(
      getBlockHeightForVersion({queryIndexer}, "0xabc"),
    ).resolves.toBeNull();
    expect(queryIndexer).not.toHaveBeenCalled();
  });
});
