import {BCS, HexString, TxnBuilderTypes, Types} from "aptos";
import pako from "pako";

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
  return pako.ungzip(new HexString(source).toUint8Array(), {to: "string"});
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

// Deserialize "[1,2,3]" or "1,2,3" to ["1", "2", "3"]
export function deserializeVector(vectorString: string): string[] {
  let result = vectorString.trim();
  if (result[0] === "[" && result[result.length - 1] === "]") {
    result = result.slice(1, -1);
  }
  return result.split(",");
}

export function encodeVectorForViewRequest(type: string, value: string) {
  const rawVector = deserializeVector(value);
  const regex = /vector<([^]+)>/;
  const match = type.match(regex);
  if (match) {
    if (match[1] === "u8") {
      return (
        HexString.fromUint8Array(
          new Uint8Array(
            rawVector.map((v) => {
              return parseInt(v.trim());
            }),
          ),
        ) as any
      ).hexString;
    } else {
      return rawVector;
    }
  } else {
    throw new Error(`Unsupported type: ${type}`);
  }
}
