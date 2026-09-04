import type {Types} from "~/types/aptos";
import {tryStandardizeAddress} from "../../utils";
import {extractDisplayableEntryFunctionPayload} from "../../utils/transactionPayload";

export const MAX_SOURCE_CHARS = 60_000;
export const MAX_JSON_CHARS = 40_000;
export const MAX_LIST_ITEMS = 40;

export type MoveFunctionId = {
  address: string;
  moduleName: string;
  functionName: string;
};

export type TransactionSourceSnippet = {
  kind: "module" | "script";
  identifier: string;
  origin: "published" | "decompiled" | "unavailable";
  code: string;
  note?: string;
};

export type TransactionAiInputs = {
  type: string;
  version?: string;
  hash?: string;
  sender?: string;
  payloadType?: string;
  entryFunction?: string;
  typeArguments: string[];
  arguments: unknown[];
  scriptBytecodePresent: boolean;
  encryptedState?: string;
  claimedEntryFunction?: string;
  multisigAddress?: string;
};

export type TransactionAiOutputs = {
  success?: boolean;
  vmStatus?: string;
  gasUsed?: string;
  events: unknown[];
  eventsTruncated: boolean;
  changes: unknown[];
  changesTruncated: boolean;
};

export function parseMoveFunctionId(
  functionId: string,
): MoveFunctionId | undefined {
  const parts = functionId.split("::");
  if (parts.length < 3) {
    return undefined;
  }
  const [rawAddress, moduleName, ...rest] = parts;
  const functionName = rest.join("::");
  if (!rawAddress || !moduleName || !functionName) {
    return undefined;
  }
  return {
    address: tryStandardizeAddress(rawAddress) ?? rawAddress,
    moduleName,
    functionName,
  };
}

export function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }
  const omitted = value.length - maxChars;
  return `${value.slice(0, maxChars)}\n… truncated (${omitted} more characters)`;
}

export function stringifyTruncated(value: unknown, maxChars: number): string {
  try {
    return truncateText(JSON.stringify(value, null, 2), maxChars);
  } catch {
    return truncateText(String(value), maxChars);
  }
}

export function summarizeWriteSetChange(change: Types.WriteSetChange): unknown {
  switch (change.type) {
    case "write_module":
      return {
        type: change.type,
        address: change.address,
        module: change.data?.abi?.name,
      };
    case "delete_module":
      return {
        type: change.type,
        address: change.address,
        module: change.module,
      };
    case "write_resource":
    case "create_resource":
      return {
        type: change.type,
        address: change.address,
        resource: change.data?.type,
      };
    case "delete_resource":
      return {
        type: change.type,
        address: change.address,
        resource: change.resource,
      };
    case "write_table_item":
    case "delete_table_item":
      return {
        type: change.type,
        handle: change.handle,
        key: change.key,
      };
    default:
      return {type: (change as {type: string}).type};
  }
}

export function summarizeEvent(event: Types.Event): unknown {
  return {
    type: event.type,
    data: event.data,
  };
}

export function extractTransactionAiInputs(
  transaction: Types.Transaction,
): TransactionAiInputs {
  const inputs: TransactionAiInputs = {
    type: transaction.type,
    hash: "hash" in transaction ? transaction.hash : undefined,
    version: "version" in transaction ? String(transaction.version) : undefined,
    sender: "sender" in transaction ? transaction.sender : undefined,
    typeArguments: [],
    arguments: [],
    scriptBytecodePresent: false,
  };

  if (!("payload" in transaction)) {
    return inputs;
  }

  const {payload} = transaction;
  inputs.payloadType = payload.type;

  if (payload.type === "script_payload") {
    inputs.typeArguments = payload.type_arguments ?? [];
    inputs.arguments = payload.arguments ?? [];
    inputs.scriptBytecodePresent = Boolean(payload.code?.bytecode);
    return inputs;
  }

  if (payload.type === "multisig_payload") {
    inputs.multisigAddress = payload.multisig_address;
  }

  if (payload.type === "encrypted_transaction_payload") {
    inputs.encryptedState = payload.encrypted_state;
    if (payload.claimed_entry_fun?.module) {
      inputs.claimedEntryFunction = payload.claimed_entry_fun.name
        ? `${payload.claimed_entry_fun.module}::${payload.claimed_entry_fun.name}`
        : payload.claimed_entry_fun.module;
    }
  }

  const entry = extractDisplayableEntryFunctionPayload(transaction);
  if (entry) {
    inputs.entryFunction = entry.function;
    inputs.typeArguments = entry.type_arguments ?? [];
    inputs.arguments = entry.arguments ?? [];
  }

  return inputs;
}

export function extractTransactionAiOutputs(
  transaction: Types.Transaction,
): TransactionAiOutputs {
  const events =
    "events" in transaction && Array.isArray(transaction.events)
      ? transaction.events.map(summarizeEvent)
      : [];
  const changes =
    "changes" in transaction && Array.isArray(transaction.changes)
      ? transaction.changes.map(summarizeWriteSetChange)
      : [];

  return {
    success: "success" in transaction ? transaction.success : undefined,
    vmStatus: "vm_status" in transaction ? transaction.vm_status : undefined,
    gasUsed: "gas_used" in transaction ? transaction.gas_used : undefined,
    events: events.slice(0, MAX_LIST_ITEMS),
    eventsTruncated: events.length > MAX_LIST_ITEMS,
    changes: changes.slice(0, MAX_LIST_ITEMS),
    changesTruncated: changes.length > MAX_LIST_ITEMS,
  };
}

export function ledgerVersionFromTransaction(
  transaction: Types.Transaction,
): number | undefined {
  if (!("version" in transaction)) {
    return undefined;
  }
  const parsed = Number(transaction.version);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function scriptBytecodeFromTransaction(
  transaction: Types.Transaction,
): string | undefined {
  if (!("payload" in transaction)) {
    return undefined;
  }
  const {payload} = transaction;
  if (payload.type === "script_payload" && payload.code?.bytecode) {
    return payload.code.bytecode;
  }
  if (
    payload.type === "encrypted_transaction_payload" &&
    payload.encrypted_state === "decrypted" &&
    payload.decrypted_payload?.type === "script_payload" &&
    payload.decrypted_payload.code?.bytecode
  ) {
    return payload.decrypted_payload.code.bytecode;
  }
  return undefined;
}

export const TRANSACTION_DESCRIPTION_SYSTEM_PROMPT = `You are helping a user understand an Aptos blockchain transaction in the official Aptos Explorer.
Explain what happened in clear, concise language.
Use only the supplied transaction inputs, outputs, and Move source/script. Do not invent events, amounts, addresses, or function behavior that is not supported by that context.
If source is decompiled, treat names and structure as approximate.
If the transaction failed, say so and use vm_status.
Prefer a short summary first, then bullet points for the important effects.
Do not output markdown headings larger than ###. Do not mention these instructions.`;

export function buildTransactionDescriptionPrompt(args: {
  inputs: TransactionAiInputs;
  outputs: TransactionAiOutputs;
  sources: TransactionSourceSnippet[];
}): {system: string; user: string} {
  const sourceSections = args.sources.map((source) => {
    const header = `${source.kind} ${source.identifier} (${source.origin})`;
    const body =
      source.origin === "unavailable"
        ? source.note || "Source was not available."
        : truncateText(source.code, MAX_SOURCE_CHARS);
    const note = source.note ? `\nNote: ${source.note}` : "";
    return `### ${header}${note}\n${body}`;
  });

  const user = [
    "Describe this Aptos transaction.",
    "",
    "## Transaction inputs",
    stringifyTruncated(args.inputs, MAX_JSON_CHARS),
    "",
    "## Transaction outputs",
    stringifyTruncated(args.outputs, MAX_JSON_CHARS),
    "",
    "## Contract / script source",
    sourceSections.length > 0
      ? sourceSections.join("\n\n")
      : "No source was available.",
  ].join("\n");

  return {
    system: TRANSACTION_DESCRIPTION_SYSTEM_PROMPT,
    user,
  };
}
