import {HexString, Types} from "aptos";
import pako from "pako";
import {Statsig} from "statsig-react";
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
  a: Types.Transaction,
  b: Types.Transaction,
): number {
  const first = "version" in a ? parseInt(a.version) : Infinity;
  const second = "version" in b ? parseInt(b.version) : Infinity;
  return first < second ? 1 : -1;
}

/*
Converts a utf8 string encoded as hex back to string
if hex starts with 0x - ignore this part and start from the 3rd char (at index 2).
*/
export function hex_to_string(hex: string): string {
  const hexString = hex.toString();
  let str = "";
  let n = hex.startsWith("0x") ? 2 : 0;
  for (n; n < hexString.length; n += 2) {
    str += String.fromCharCode(parseInt(hexString.substring(n, n + 2), 16));
  }
  return str;
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
    return pako.ungzip(new HexString(source).toUint8Array(), {to: "string"});
  } catch {
    return "";
  }
}

export function getBytecodeSizeInKB(bytecodeHex: string): number {
  // Convert the hex string to a byte array
  const textEncoder = new TextEncoder();
  const byteArray = new Uint8Array(textEncoder.encode(bytecodeHex));

  // Compute the size of the byte array in kilobytes (KB)
  const sizeInKB = byteArray.length / 1024;

  // Return the size in KB with two decimal places
  return parseFloat(sizeInKB.toFixed(2));
}

// if ANS name is in the form of "name." or "name.a" or "name.ap" or "name.apt", remove the suffix
export function truncateAptSuffix(name: string): string {
  return name.replace(
    /^([a-z\d][a-z\d-]{1,61}[a-z\d])(\.apt|\.ap|\.a|\.?)$/,
    "$1",
  );
}

/**
 * Standardizes an address to the format "0x" followed by 64 lowercase hexadecimal digits.
 */
export const standardizeAddress = (address: string): string => {
  // Convert the address to lowercase
  address = address.toLowerCase();
  // If the address has more than 66 characters, it's already invalid
  if (address.length > 66) {
    return address;
  }
  // Remove the "0x" prefix if present
  const addressWithoutPrefix = address.startsWith("0x")
    ? address.slice(2)
    : address;
  // If the address has more than 64 characters after removing the prefix, it's already invalid
  if (addressWithoutPrefix.length > 64) {
    return address;
  }
  // Pad the address with leading zeros if necessary to ensure it has exactly 64 characters (excluding the "0x" prefix)
  const addressWithPadding = addressWithoutPrefix.padStart(64, "0");
  // Return the standardized address with the "0x" prefix
  return "0x" + addressWithPadding;
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

    return value === "true" ? true : false;
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
        HexString.fromUint8Array(
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

// address' coming back from the node trim leading zeroes
// for example: 0x123 => 0x000...000123  (61 0s before 123)
export function normalizeAddress(address: string): string {
  return "0x" + address.substring(2).padStart(64, "0");
}
