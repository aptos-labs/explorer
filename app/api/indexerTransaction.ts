import type {Aptos} from "@aptos-labs/ts-sdk";
import type {Types} from "~/types/aptos";

/**
 * Reconstruct a REST-shaped `Types.Transaction` from indexer GraphQL tables.
 *
 * The public indexer does not expose `transactions` / `events` / write-set
 * resources, so this is a best-effort fallback for fullnode-pruned history:
 * sender, version, function, gas, signature, success (from FA gas fee), and
 * table-item changes. Hash, events, payload arguments, and resource changes
 * are omitted when the indexer does not have them.
 */

const INDEXER_SOURCE = Symbol.for("aptos-explorer.indexerTransaction");

export function markIndexerSourced<T extends object>(transaction: T): T {
  Object.defineProperty(transaction, INDEXER_SOURCE, {
    value: true,
    enumerable: false,
  });
  return transaction;
}

export function isIndexerSourced(transaction: object): boolean {
  return Boolean((transaction as Record<symbol, unknown>)[INDEXER_SOURCE]);
}

export function indexerTimestampToMicros(timestamp: string): string {
  const trimmed = timestamp.trim();
  if (!trimmed) return "0";
  if (/^\d+$/.test(trimmed)) return trimmed;

  const core = trimmed.replace(/(?:Z|[+-]\d{2}:?\d{2})$/i, "");
  const [dateTime, fracRaw = ""] = core.split(".");
  const ms = Date.parse(`${dateTime}Z`);
  if (Number.isNaN(ms)) return "0";
  const frac = fracRaw.replace(/\D/g, "").padEnd(6, "0").slice(0, 6);
  return String(ms * 1000 + Number(frac));
}

export function indexerTimestampToUnixSeconds(timestamp: string): string {
  const trimmed = timestamp.trim();
  if (!trimmed) return "0";
  if (/^\d+$/.test(trimmed)) return trimmed;
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  const ms = Date.parse(hasZone ? trimmed : `${trimmed}Z`);
  if (Number.isNaN(ms)) return "0";
  return String(Math.floor(ms / 1000));
}

function asString(value: unknown, fallback = "0"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

export type IndexerSignatureRow = {
  type: string;
  signer: string;
  public_key: string;
  signature: string;
  is_sender_primary: boolean;
  public_key_type?: string | null;
  any_signature_type?: string | null;
  function_info?: string | null;
  threshold?: number | string | null;
  public_key_indices?: unknown;
};

export type IndexerUserTransactionRow = {
  version: number | string;
  sender: string;
  sequence_number: number | string;
  max_gas_amount: number | string;
  gas_unit_price: number | string;
  expiration_timestamp_secs: string;
  timestamp: string;
  entry_function_id_str?: string | null;
  block_height?: number | string | null;
  epoch?: number | string | null;
  parent_signature_type?: string | null;
  signature?: IndexerSignatureRow | null;
};

export type IndexerBlockMetadataRow = {
  version: number | string;
  block_height?: number | string | null;
  id?: string | null;
  epoch?: number | string | null;
  round?: number | string | null;
  proposer?: string | null;
  timestamp: string;
  previous_block_votes_bitvec?: number[] | null;
  failed_proposer_indices?: number[] | null;
};

export type IndexerFungibleAssetActivityRow = {
  amount?: number | string | null;
  is_gas_fee?: boolean | null;
  is_transaction_success?: boolean | null;
  gas_fee_payer_address?: string | null;
  event_index?: number | string | null;
};

export type IndexerTableItemRow = {
  key: string;
  table_handle: string;
  decoded_key?: unknown;
  decoded_value?: unknown;
  write_set_change_index?: number | string | null;
};

export type IndexerTransactionQueryResult = {
  user_transactions?: IndexerUserTransactionRow[] | null;
  block_metadata_transactions?: IndexerBlockMetadataRow[] | null;
  signatures?: IndexerSignatureRow[] | null;
  fungible_asset_activities?: IndexerFungibleAssetActivityRow[] | null;
  table_items?: IndexerTableItemRow[] | null;
};

export const INDEXER_TRANSACTION_BY_VERSION_QUERY = `
  query TransactionByVersion($version: bigint!) {
    user_transactions(where: {version: {_eq: $version}}) {
      version
      sender
      sequence_number
      max_gas_amount
      gas_unit_price
      expiration_timestamp_secs
      timestamp
      entry_function_id_str
      block_height
      epoch
      parent_signature_type
      signature {
        type
        signer
        public_key
        signature
        is_sender_primary
        public_key_type
        any_signature_type
        function_info
        threshold
      }
    }
    block_metadata_transactions(where: {version: {_eq: $version}}) {
      version
      block_height
      id
      epoch
      round
      proposer
      timestamp
      previous_block_votes_bitvec
      failed_proposer_indices
    }
    signatures(where: {transaction_version: {_eq: $version}}) {
      type
      signer
      public_key
      signature
      is_sender_primary
      public_key_type
      any_signature_type
      function_info
      threshold
      public_key_indices
    }
    fungible_asset_activities(where: {transaction_version: {_eq: $version}}) {
      amount
      is_gas_fee
      is_transaction_success
      gas_fee_payer_address
      event_index
    }
    table_items(where: {transaction_version: {_eq: $version}}) {
      key
      table_handle
      decoded_key
      decoded_value
      write_set_change_index
    }
  }
`;

function payloadFromEntryFunction(
  entryFunctionId: string | null | undefined,
): Types.TransactionPayload {
  if (!entryFunctionId) {
    return {
      type: "script_payload",
      code: {bytecode: "0x"},
      type_arguments: [],
      arguments: [],
    };
  }
  return {
    type: "entry_function_payload",
    function: entryFunctionId,
    type_arguments: [],
    arguments: [],
  };
}

function mapSignature(
  row: IndexerSignatureRow | null | undefined,
  feePayerAddress?: string | null,
): Types.TransactionSignature | undefined {
  if (!row) return undefined;
  const mapped: Types.TransactionSignature = {
    type: row.type || "ed25519_signature",
    public_key: row.public_key,
    signature: row.signature,
  };
  if (feePayerAddress) {
    mapped.fee_payer_address = feePayerAddress;
  }
  return mapped;
}

function tableItemChanges(
  rows: IndexerTableItemRow[] | null | undefined,
): Types.WriteSetChange[] {
  if (!rows?.length) return [];
  const sorted = [...rows].sort(
    (a, b) =>
      Number(a.write_set_change_index ?? 0) -
      Number(b.write_set_change_index ?? 0),
  );
  return sorted.map((row) => ({
    type: "write_table_item" as const,
    state_key_hash: "",
    handle: row.table_handle,
    key: row.key,
    value: "",
    data: {
      key: row.decoded_key,
      key_type: "",
      value: row.decoded_value,
      value_type: "",
    },
  }));
}

function gasUsedFromActivities(
  activities: IndexerFungibleAssetActivityRow[] | null | undefined,
  gasUnitPrice: string,
): {gasUsed: string; success: boolean; feePayer?: string} {
  const gasFee = activities?.find((a) => a.is_gas_fee);
  const success = gasFee?.is_transaction_success ?? true;
  const feePayer = gasFee?.gas_fee_payer_address || undefined;
  const price = BigInt(gasUnitPrice || "0");
  const feeOctas = BigInt(asString(gasFee?.amount, "0"));
  if (price > 0n && feeOctas > 0n) {
    return {gasUsed: (feeOctas / price).toString(), success, feePayer};
  }
  return {gasUsed: "0", success, feePayer};
}

export function mapIndexerUserTransaction(
  row: IndexerUserTransactionRow,
  extras?: {
    signatures?: IndexerSignatureRow[] | null;
    activities?: IndexerFungibleAssetActivityRow[] | null;
    tableItems?: IndexerTableItemRow[] | null;
  },
): Types.Transaction_UserTransaction {
  const gasUnitPrice = asString(row.gas_unit_price);
  const {gasUsed, success, feePayer} = gasUsedFromActivities(
    extras?.activities,
    gasUnitPrice,
  );
  const primary =
    extras?.signatures?.find((s) => s.is_sender_primary) ??
    row.signature ??
    extras?.signatures?.[0];

  return markIndexerSourced({
    type: "user_transaction",
    version: asString(row.version),
    hash: "",
    state_change_hash: "",
    event_root_hash: "",
    state_checkpoint_hash: null,
    gas_used: gasUsed,
    success,
    vm_status: success ? "Executed successfully" : "Execution failed",
    accumulator_root_hash: "",
    changes: tableItemChanges(extras?.tableItems),
    sender: row.sender,
    sequence_number: asString(row.sequence_number),
    max_gas_amount: asString(row.max_gas_amount),
    gas_unit_price: gasUnitPrice,
    expiration_timestamp_secs: indexerTimestampToUnixSeconds(
      asString(row.expiration_timestamp_secs, ""),
    ),
    payload: payloadFromEntryFunction(row.entry_function_id_str),
    signature: mapSignature(primary, feePayer),
    events: [],
    timestamp: indexerTimestampToMicros(row.timestamp),
  });
}

export function mapIndexerBlockMetadataTransaction(
  row: IndexerBlockMetadataRow,
): Types.Transaction_BlockMetadataTransaction {
  return markIndexerSourced({
    type: "block_metadata_transaction",
    version: asString(row.version),
    hash: "",
    state_change_hash: "",
    event_root_hash: "",
    state_checkpoint_hash: null,
    gas_used: "0",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "",
    changes: [],
    id: row.id ?? "",
    epoch: asString(row.epoch),
    round: asString(row.round),
    events: [],
    previous_block_votes_bitvec: row.previous_block_votes_bitvec ?? [],
    proposer: row.proposer ?? "",
    failed_proposer_indices: row.failed_proposer_indices ?? [],
    timestamp: indexerTimestampToMicros(row.timestamp),
  });
}

export function mapIndexerTransactionResult(
  data: IndexerTransactionQueryResult | null | undefined,
): Types.Transaction | null {
  if (!data) return null;
  const user = data.user_transactions?.[0];
  if (user) {
    return mapIndexerUserTransaction(user, {
      signatures: data.signatures,
      activities: data.fungible_asset_activities,
      tableItems: data.table_items,
    });
  }
  const blockMeta = data.block_metadata_transactions?.[0];
  if (blockMeta) {
    return mapIndexerBlockMetadataTransaction(blockMeta);
  }
  return null;
}

export type IndexerQueryable = {
  queryIndexer: Aptos["queryIndexer"];
};

export async function getTransactionFromIndexer(
  client: IndexerQueryable,
  txnHashOrVersion: string,
): Promise<Types.Transaction | null> {
  if (!/^\d+$/.test(txnHashOrVersion)) {
    // The public indexer has no transaction-hash column.
    return null;
  }

  const data = await client.queryIndexer<IndexerTransactionQueryResult>({
    query: {
      query: INDEXER_TRANSACTION_BY_VERSION_QUERY,
      variables: {version: txnHashOrVersion},
    },
  });

  return mapIndexerTransactionResult(data);
}
