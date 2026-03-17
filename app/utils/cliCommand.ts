import type {Types} from "~/types/aptos";

/**
 * Formats a single argument value for the Aptos CLI.
 * Handles nested objects/arrays by JSON-serializing them,
 * and wraps string values appropriately.
 */
function formatArgForCli(type: string, value: unknown): string {
  if (value === null || value === undefined) {
    return `${type}:""`;
  }

  if (typeof value === "object") {
    return `${type}:${JSON.stringify(value)}`;
  }

  return `${type}:${String(value)}`;
}

/**
 * Generates an `aptos move run` CLI command string from a transaction payload.
 *
 * When paramTypes are available (from the module ABI), arguments are formatted
 * with their proper types (e.g. `address:0x1`, `u64:1000`).
 * When unavailable, arguments are shown as raw values with a `?:` prefix to
 * indicate the type is unknown.
 */
export function generateCliCommand(
  payload: Types.TransactionPayload_EntryFunctionPayload,
  paramTypes?: string[],
): string {
  const parts = ["aptos move run \\"];
  parts.push(`  --function-id '${payload.function}'`);

  if (payload.type_arguments.length > 0) {
    const typeArgs = payload.type_arguments.map((ta) => `'${ta}'`).join(" ");
    parts.push(`  --type-args ${typeArgs}`);
  }

  if (payload.arguments.length > 0) {
    const filteredParamTypes = paramTypes
      ? paramTypes.filter((p) => p !== "&signer" && p !== "signer")
      : undefined;

    const args = payload.arguments.map((arg, i) => {
      const type = filteredParamTypes?.[i] ?? "?";
      return `'${formatArgForCli(type, arg)}'`;
    });
    parts.push(`  --args ${args.join(" ")}`);
  }

  return parts.join(" \\\n");
}

/**
 * Extracts the entry_function_payload from a transaction, handling
 * both direct entry_function_payload and multisig_payload wrappers.
 * Returns undefined if the transaction doesn't have a suitable payload.
 */
export function extractEntryFunctionPayload(
  transaction: Types.Transaction,
): Types.TransactionPayload_EntryFunctionPayload | undefined {
  if (!("payload" in transaction)) return undefined;

  const payload = transaction.payload;

  if (payload.type === "entry_function_payload") {
    return payload as Types.TransactionPayload_EntryFunctionPayload;
  }

  if (
    payload.type === "multisig_payload" &&
    "transaction_payload" in payload &&
    payload.transaction_payload
  ) {
    return payload.transaction_payload as Types.TransactionPayload_EntryFunctionPayload;
  }

  return undefined;
}
