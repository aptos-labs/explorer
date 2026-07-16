import {
  AccountAddress,
  Bool,
  Hex,
  MoveString,
  MoveVector,
  parseTypeTag,
  type ScriptFunctionArgumentTypes,
  U8,
  U16,
  U32,
  U64,
  U128,
  U256,
} from "@aptos-labs/ts-sdk";

/**
 * The set of argument types that a user can pick from the dropdown when
 * building a Move script transaction by hand. Because a raw script has no
 * on-chain ABI, the explorer cannot infer the type of each argument — the user
 * must declare it. "custom" reveals a free-form field where any Move type tag
 * (for example `vector<vector<u8>>`) can be entered.
 */
export const SCRIPT_ARG_TYPE_OPTIONS = [
  {value: "address", label: "address"},
  {value: "bool", label: "bool"},
  {value: "u8", label: "u8"},
  {value: "u16", label: "u16"},
  {value: "u32", label: "u32"},
  {value: "u64", label: "u64"},
  {value: "u128", label: "u128"},
  {value: "u256", label: "u256"},
  {value: "0x1::string::String", label: "String"},
  {value: "vector<u8>", label: "vector<u8> (bytes)"},
  {value: "vector<address>", label: "vector<address>"},
  {value: "vector<u64>", label: "vector<u64>"},
  {value: "custom", label: "Custom type…"},
] as const;

/**
 * Placeholder / hint text for the value input, keyed by the selected type.
 */
export function getScriptArgPlaceholder(type: string): string {
  if (type === "address") return "0x1";
  if (type === "bool") return "true or false";
  if (type.startsWith("u")) return "0";
  if (type === "0x1::string::String") return "Enter text...";
  if (type === "vector<u8>") return "0xDEADBEEF or [222, 173, 190, 239]";
  if (type.startsWith("vector<address>")) return '0x1, 0x2 or ["0x1", "0x2"]';
  if (type.startsWith("vector<"))
    return 'value1, value2 or ["value1", "value2"]';
  return "";
}

/**
 * Convert a hex string (with or without a `0x` prefix) to bytes.
 */
function hexToBytes(hexString: string): Uint8Array {
  const trimmed = hexString.trim();
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  return Hex.fromHexString(hex).toUint8Array();
}

/**
 * Split a vector value that is written either as JSON (`["a", "b"]`) or as a
 * comma separated list (`a, b`).
 */
function parseVectorItems(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "[]") {
    return [];
  }
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as unknown[];
    if (!Array.isArray(parsed)) {
      throw new Error("Expected a JSON array");
    }
    return parsed.map((item) =>
      typeof item === "string" ? item : String(item),
    );
  }
  return trimmed.split(",").map((item) => item.trim());
}

/**
 * Convert a value for a normalized (canonical) Move type string. The type
 * string must already be validated/normalized via {@link parseTypeTag} (see
 * {@link convertScriptFunctionArgument}). Switching on the string — rather than
 * the `TypeTag` type-guard methods — avoids TypeScript narrowing the
 * structurally-identical `TypeTag` subclasses to `never`.
 */
function convertByType(
  normalizedType: string,
  value: string,
): ScriptFunctionArgumentTypes {
  const raw = value.trim();

  switch (normalizedType) {
    case "bool": {
      const normalized = raw.toLowerCase();
      if (normalized !== "true" && normalized !== "false") {
        throw new Error(
          `Invalid bool value "${value}" (expected true or false)`,
        );
      }
      return new Bool(normalized === "true");
    }
    case "u8":
      return new U8(Number(raw));
    case "u16":
      return new U16(Number(raw));
    case "u32":
      return new U32(Number(raw));
    case "u64":
      return new U64(BigInt(raw));
    case "u128":
      return new U128(BigInt(raw));
    case "u256":
      return new U256(BigInt(raw));
    case "address":
      return AccountAddress.fromString(raw);
    case "0x1::string::String":
      return new MoveString(raw);
    default:
      break;
  }

  if (normalizedType.startsWith("vector<") && normalizedType.endsWith(">")) {
    const inner = normalizedType.slice("vector<".length, -1);
    // vector<u8> accepts either a hex string or an array of byte values.
    if (inner === "u8") {
      if (raw.startsWith("[")) {
        const items = parseVectorItems(raw).map((item) => Number(item));
        return MoveVector.U8(items);
      }
      return MoveVector.U8(hexToBytes(raw));
    }
    const items = parseVectorItems(raw).map((item) =>
      convertByType(inner, item),
    );
    return new MoveVector(
      items as unknown as (Bool | U8 | U16 | U32 | U64 | U128 | U256)[],
    ) as ScriptFunctionArgumentTypes;
  }

  throw new Error(`Unsupported argument type "${normalizedType}"`);
}

/**
 * Convert a single `(type, value)` pair entered in the Run Script form into the
 * BCS-serializable argument the SDK expects for a script payload.
 *
 * Unlike entry functions, script arguments have no remote ABI, so every value
 * must be explicitly typed by the caller.
 */
export function convertScriptFunctionArgument(
  type: string,
  value: string,
): ScriptFunctionArgumentTypes {
  const trimmedType = type.trim();
  if (trimmedType === "") {
    throw new Error("Argument type is required");
  }
  let normalizedType: string;
  try {
    normalizedType = parseTypeTag(trimmedType, {
      allowGenerics: false,
    }).toString();
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid type";
    throw new Error(`Could not parse type "${trimmedType}": ${message}`);
  }
  return convertByType(normalizedType, value);
}

export type ScriptArgInput = {
  /** Either a known option value or, when "custom" is selected, the raw type. */
  type: string;
  /** Free-form type text used when `type === "custom"`. */
  customType?: string;
  value: string;
};

/**
 * Resolve the effective Move type for an argument row (handles the "custom"
 * escape hatch).
 */
export function resolveScriptArgType(arg: ScriptArgInput): string {
  return arg.type === "custom" ? (arg.customType ?? "") : arg.type;
}

/**
 * Convert an ordered list of script argument rows into typed BCS arguments.
 * Throws a descriptive error (including the 1-based argument index) on the
 * first failure so the UI can surface exactly which input was invalid.
 */
export function convertScriptFunctionArguments(
  args: ScriptArgInput[],
): ScriptFunctionArgumentTypes[] {
  return args.map((arg, i) => {
    try {
      return convertScriptFunctionArgument(
        resolveScriptArgType(arg),
        arg.value,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "invalid value";
      throw new Error(`Argument #${i + 1}: ${message}`);
    }
  });
}

/**
 * Normalize the pasted bytecode into a `0x`-prefixed hex string, validating
 * that it is a plausible Move script (non-empty, valid hex, even length).
 */
export function normalizeScriptBytecode(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "") {
    throw new Error("Script bytecode is required");
  }
  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(
      "Bytecode must be a hex string (0-9, a-f), optionally 0x-prefixed",
    );
  }
  if ((hex.length - 2) % 2 !== 0) {
    throw new Error("Bytecode hex string must have an even number of digits");
  }
  return hex;
}
