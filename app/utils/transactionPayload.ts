import type {Types} from "~/types/aptos";

function isEntryFunctionPayload(
  payload: unknown,
): payload is Types.TransactionPayload_EntryFunctionPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "type" in payload &&
    payload.type === "entry_function_payload" &&
    "function" in payload &&
    typeof payload.function === "string" &&
    "type_arguments" in payload &&
    Array.isArray(payload.type_arguments) &&
    "arguments" in payload &&
    Array.isArray(payload.arguments)
  );
}

export function isEncryptedTransactionPayload(
  payload: Types.TransactionPayload,
): payload is Types.TransactionPayload_EncryptedTransactionPayload {
  return payload.type === "encrypted_transaction_payload";
}

/**
 * Formats a claimed entry function for display (module::name when name is set).
 */
export function formatClaimedEntryFunction(
  claimed: Types.ClaimedEntryFunction | null | undefined,
): string | undefined {
  if (!claimed?.module) return undefined;
  return claimed.name ? `${claimed.module}::${claimed.name}` : claimed.module;
}

export function encryptedStateLabel(
  state: Types.TransactionPayload_EncryptedTransactionPayload["encrypted_state"],
): string {
  if (state === "decrypted") return "Decrypted";
  if (state === "failed_decryption") return "Decryption failed";
  return "Encrypted";
}

/**
 * Returns the entry function that the explorer can safely display. This accepts
 * direct and multisig payloads plus a fullnode-provided decrypted payload, but
 * deliberately never decrypts ciphertext in the browser.
 */
export function extractDisplayableEntryFunctionPayload(
  transaction: Types.Transaction,
): Types.TransactionPayload_EntryFunctionPayload | undefined {
  if (!("payload" in transaction)) return undefined;

  const {payload} = transaction;
  if (isEntryFunctionPayload(payload)) return payload;

  if (
    payload.type === "multisig_payload" &&
    isEntryFunctionPayload(payload.transaction_payload)
  ) {
    return payload.transaction_payload;
  }

  if (
    isEncryptedTransactionPayload(payload) &&
    payload.encrypted_state === "decrypted" &&
    isEntryFunctionPayload(payload.decrypted_payload)
  ) {
    return payload.decrypted_payload;
  }

  return undefined;
}
