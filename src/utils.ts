import {AnyAptosWallet} from "@aptos-labs/wallet-adapter-react";
import pako from "pako";
import {Statsig} from "statsig-react";
import {
  AccountAddress,
  AccountAddressInput,
  Hex,
  TransactionResponse,
} from "@aptos-labs/ts-sdk";

/**
 * Helper function for exhaustiveness checks.
 *
 * Hint: If this function is causing a type error, check to make sure that your
 * switch statement covers all cases!
 */
export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

/*
If the transaction doesn't have a version property,
that means it's a pending transaction (and thus it's expected version will be higher than any existing versions).
We can consider the version to be Infinity for this case.
*/
export function sortTransactions(
  a: TransactionResponse,
  b: TransactionResponse,
): number {
  const first = "version" in a ? parseInt(a.version) : Infinity;
  const second = "version" in b ? parseInt(b.version) : Infinity;
  return first < second ? 1 : -1;
}

/* set localStorage with Expiry */
export function setLocalStorageWithExpiry(
  key: string,
  value: string,
  ttl: number,
) {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };

  localStorage.setItem(key, JSON.stringify(item));
}

/* get localStorage with Expiry */
export function getLocalStorageWithExpiry(key: string) {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

export async function fetchJsonResponse(url: string) {
  const response = await fetch(url);
  return await response.json();
}

/**
 * Convert a module source code in gzipped hex string to plain text
 * @param source module source code in gzipped hex string
 * @returns original source code in plain text
 */
export function transformCode(source: string): string {
  try {
    return pako.ungzip(Hex.fromHexString(source).toUint8Array(), {
      to: "string",
    });
  } catch {
    return "";
  }
}

export function getBytecodeSizeInKB(bytecodeHex: string): number {
  // Convert the hex string to a byte array
  const byteArray = Hex.fromHexString(bytecodeHex).toUint8Array();

  // Compute the size of the byte array in kilobytes (KB)
  const sizeInKB = byteArray.length / 1024;

  // Return the size in KB with two decimal places
  return parseFloat(sizeInKB.toFixed(2));
}

/**
 * Standardizes an address to the format "0x" followed by 64 lowercase hexadecimal digits.
 */
export const standardizeAddress = (address: AccountAddressInput): string => {
  return AccountAddress.from(address).toStringLong();
};

export const tryStandardizeAddress = (
  address: AccountAddressInput | null | undefined,
  logError?: boolean,
): string | undefined => {
  if (address) {
    try {
      return standardizeAddress(address);
    } catch (e) {
      if (logError) {
        console.log("Failed to standardize address", address, e);
      }
      return undefined;
    }
  }
  return undefined;
};

// inspired by https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(regexpString: string) {
  return regexpString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Get the line number of a public function in a source code.
// The line number is zero-based.
// Return 0 if the function is not found.
export function getPublicFunctionLineNumber(
  sourceCode: string,
  functionName: string,
) {
  const lines = sourceCode.split("\n");
  const publicEntryFunRegexp = new RegExp(
    `\\s*public\\s*(entry\\s*)?fun\\s*${escapeRegExp(
      functionName,
    )}\\s*(?:<|\\()`,
  );

  const lineNumber = lines.findIndex((line) =>
    line.match(publicEntryFunRegexp),
  );
  if (lineNumber !== -1) {
    return lineNumber;
  }

  return 0;
}

export function encodeInputArgsForViewRequest(type: string, value: string) {
  if (type.includes("vector")) {
    // when it's a vector, we support both hex and javascript array format
    return value.trim().startsWith("0x")
      ? value.trim()
      : encodeVectorForViewRequest(type, value);
  } else if (type === "bool") {
    if (value !== "true" && value !== "false")
      throw new Error(`Invalid bool value: ${value}`);

    return value === "true";
  } else if (["u8", "u16", "u32"].includes(type)) {
    return ensureNumber(value);
  } else if (type.startsWith("0x1::option::Option")) {
    return {vec: [...(value ? [value] : [])]};
  } else return value;
}

// Deserialize "[1,2,3]" or "1,2,3" to ["1", "2", "3"]
export function deserializeVector(vectorString: string): string[] {
  let result = vectorString.trim();
  if (result[0] === "[" && result[result.length - 1] === "]") {
    result = result.slice(1, -1);
  }
  // There's a tradeoff here between empty string, and empty array.  We're going with empty array.
  if (result.length == 0) {
    return [];
  }
  return result.split(",");
}

function encodeVectorForViewRequest(type: string, value: string) {
  const rawVector = deserializeVector(value);
  const regex = /vector<([^]+)>/;
  const match = type.match(regex);
  if (match) {
    if (match[1] === "u8") {
      return (
        new Hex(
          new Uint8Array(
            rawVector.map((v) => {
              const result = ensureNumber(v.trim());
              if (result < 0 || result > 255)
                throw new Error(`Invalid u8 value: ${result}`);
              return result;
            }),
          ),
        ) as any
      ).hexString;
    } else if (["u16", "u32"].includes(match[1])) {
      return rawVector.map((v) => ensureNumber(v.trim()));
    } else if (["u64", "u128", "u256"].includes(match[1])) {
      // For bigint, not need to convert, only validation
      rawVector.forEach((v) => ensureBigInt(v.trim()));
      return rawVector;
    } else if (match[1] === "bool") {
      return rawVector.map((v) => ensureBoolean(v.trim()));
    } else {
      // 1. Address type no need to convert
      // 2. Other complex types like Struct is not support yet. We just pass what user input.
      return rawVector;
    }
  } else {
    throw new Error(`Unsupported type: ${type}`);
  }
}

function ensureNumber(val: number | string): number {
  assertType(val, ["number", "string"]);
  if (typeof val === "number") {
    return val;
  }

  const res = Number.parseInt(val, 10);
  if (Number.isNaN(res)) {
    throw new Error("Invalid number string.");
  }

  return res;
}

export function ensureBigInt(val: number | bigint | string): bigint {
  assertType(val, ["number", "bigint", "string"]);
  return BigInt(val);
}

export function ensureBoolean(val: boolean | string): boolean {
  assertType(val, ["boolean", "string"]);
  if (typeof val === "boolean") {
    return val;
  }

  if (val === "true") {
    return true;
  }
  if (val === "false") {
    return false;
  }

  throw new Error("Invalid boolean string.");
}

function assertType(val: any, types: string[] | string, message?: string) {
  if (!types?.includes(typeof val)) {
    throw new Error(
      message ||
        `Invalid arg: ${val} type should be ${
          types instanceof Array ? types.join(" or ") : types
        }`,
    );
  }
}

// We should not be using statsig for logging like this, we will transition to google analytics
export function getStableID(): string {
  return Statsig.initializeCalled() ? Statsig.getStableID() : "not_initialized";
}

/** A wallet sort function to ensure that Petra is always at the top of the wallet list. */
export function sortPetraFirst(a: AnyAptosWallet) {
  return a.name === "Petra" ? -1 : 1;
}

export function getAssetSymbol(
  panoraSymbol: string | null | undefined,
  bridge: string | null | undefined,
  symbol: string | null | undefined,
) {
  if (panoraSymbol && panoraSymbol !== symbol) {
    if (bridge) {
      return `${panoraSymbol} (${bridge} ${symbol})`;
    }
    return `${panoraSymbol} (${symbol})`;
  } else if (symbol) {
    return symbol;
  } else {
    return "Unknown Symbol";
  }
}
