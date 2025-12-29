import {parseTypeTag} from "@aptos-labs/ts-sdk";
import {Types} from "aptos";

/**
 * Extract module address and name from a Move type string
 * Example: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
 * Returns: { address: "0x1", moduleName: "coin" }
 */
export function extractModuleMetadata(typeString: string): {
  address: string;
  moduleName: string;
} | null {
  const TYPE_PATTERN = /^(0x[a-fA-F0-9]+)::([^:]+)::/;
  const match = typeString.match(TYPE_PATTERN);
  if (!match) {
    return null;
  }
  return {
    address: match[1],
    moduleName: match[2],
  };
}

/**
 * Parse a Move type string to extract struct information
 */
export function parseMoveType(typeString: string): {
  address: string;
  moduleName: string;
  structName: string;
  typeArgs: string[];
} | null {
  try {
    const typeTag = parseTypeTag(typeString, {allowGenerics: true});
    if (!typeTag.isStruct()) {
      return null;
    }

    const structTag = typeTag.value;
    return {
      address: structTag.address.toString(),
      moduleName: String(structTag.moduleName),
      structName: String(structTag.name),
      typeArgs: structTag.typeArgs.map((arg) => arg.toString()),
    };
  } catch {
    return null;
  }
}

/**
 * Extract table key and value types from a resource type string
 * Handles patterns like:
 * - 0x1::table::Table<KeyType, ValueType>
 * - 0x1::table::TableWithLength<KeyType, ValueType>
 * - Any other type that has Table<KeyType, ValueType> as a type argument
 */
export function extractTableTypesFromResourceType(
  resourceType: string,
): {keyType: string; valueType: string} | null {
  try {
    // Try to parse the resource type to see if it contains Table<KeyType, ValueType>
    const parsed = parseMoveType(resourceType);
    if (!parsed) {
      return null;
    }

    // Check if this is a Table type itself
    if (
      parsed.moduleName === "table" &&
      (parsed.structName === "Table" || parsed.structName === "TableWithLength")
    ) {
      if (parsed.typeArgs.length >= 2) {
        return {
          keyType: parsed.typeArgs[0],
          valueType: parsed.typeArgs[1],
        };
      }
    }

    // Check if any type argument is a Table type
    for (const typeArg of parsed.typeArgs) {
      const tableTypes = extractTableTypesFromResourceType(typeArg);
      if (tableTypes) {
        return tableTypes;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Find a struct definition in ABI that matches the given type
 */
export function findStructInABI(
  abi: Types.MoveModule | undefined,
  structName: string,
): Types.MoveStruct | null {
  if (!abi || !abi.structs) {
    return null;
  }

  return abi.structs.find((s) => s.name === structName) || null;
}

/**
 * Parse result with error handling
 */
export interface ParseResult {
  parsed: boolean;
  value: unknown;
  error?: Error;
  rawHex?: string;
}

/**
 * Convert a value to hex string representation
 */
export function valueToHex(value: unknown): string {
  if (typeof value === "string") {
    // If it's already hex-like, return as is
    if (value.startsWith("0x")) {
      return value;
    }
    // Otherwise, convert string to hex using TextEncoder
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `0x${hex}`;
  }
  if (typeof value === "object" && value !== null) {
    try {
      const jsonString = JSON.stringify(value);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(jsonString);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return `0x${hex}`;
    } catch {
      return "0x";
    }
  }
  return `0x${value?.toString() || ""}`;
}
