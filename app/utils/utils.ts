import {Types} from "aptos";
import pako from "pako";
import {
  AccountAddress,
  AccountAddressInput,
  Hex,
  parseTypeTag,
} from "@aptos-labs/ts-sdk";
import {
  AdapterNotDetectedWallet,
  AdapterWallet,
} from "@aptos-labs/wallet-adapter-react";
import {format, differenceInMilliseconds} from "date-fns";

/**
 * Hydration-safe timestamp formatter.
 * Returns a consistent placeholder during SSR to avoid hydration mismatches.
 */
export function formatTimestampLocal(
  timestamp: string | number | bigint,
  options?: {placeholder?: string},
): string {
  // During SSR, return a placeholder to avoid hydration mismatch
  if (typeof window === "undefined") {
    return options?.placeholder ?? "-";
  }

  // Convert to milliseconds
  let ms: number;
  if (typeof timestamp === "bigint") {
    ms = Number(timestamp) / 1000; // Assume microseconds
  } else if (typeof timestamp === "string") {
    const num = Number(timestamp);
    // Assume microseconds if > 1e15, otherwise milliseconds
    ms = num > 1e15 ? num / 1000 : num;
  } else {
    // Assume microseconds if > 1e15, otherwise milliseconds
    ms = timestamp > 1e15 ? timestamp / 1000 : timestamp;
  }

  return new Date(ms).toLocaleString();
}

/**
 * Helper function for exhaustiveness checks.
 */
export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

export function addressFromWallet(address?: string | AccountAddress): string {
  if (!address) {
    return "";
  }
  return standardizeAddress(address);
}

/*
If the transaction doesn't have a version property,
that means it's a pending transaction (and thus it's expected version will be higher than any existing versions).
*/
export function sortTransactions(
  a: Types.Transaction,
  b: Types.Transaction,
): number {
  const first = "version" in a ? parseInt(a.version) : Infinity;
  const second = "version" in b ? parseInt(b.version) : Infinity;
  return first < second ? 1 : -1;
}

/**
 * Cache Manager - localStorage with expiry
 */
const CACHE_PREFIX = "aptos_explorer_cache_";
const CACHE_VERSION = "1.0";

interface CacheItem<T = string> {
  value: T;
  expiry: number;
  version: string;
  timestamp: number;
}

export function setLocalStorageWithExpiry<T = string>(
  key: string,
  value: T,
  ttl: number,
): void {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const item: CacheItem<T> = {
      value,
      expiry: now + ttl,
      version: CACHE_VERSION,
      timestamp: now,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch (error) {
    console.error("Error storing cache item:", error);
  }
}

export function getLocalStorageWithExpiry<T = string>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    const itemStr = localStorage.getItem(fullKey);

    if (!itemStr) return null;

    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    if (now > item.expiry || item.version !== CACHE_VERSION) {
      localStorage.removeItem(fullKey);
      return null;
    }

    return item.value;
  } catch {
    return null;
  }
}

/**
 * Rate Limiter utilities
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if ("status" in error && (error as {status: number}).status === 429)
    return true;
  if ("type" in error && (error as {type: string}).type === "Too Many Requests")
    return true;
  return false;
}

export function getEndpointFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export async function withRateLimit<T>(
  fn: () => Promise<T>,
  _endpoint: string, // Reserved for future rate limiting implementation
): Promise<T> {
  return fn();
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error)) throw error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export async function fetchJsonResponse(url: string) {
  const response = await fetch(url);
  return await response.json();
}

/**
 * Convert a module source code in gzipped hex string to plain text
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
  const byteArray = Hex.fromHexString(bytecodeHex).toUint8Array();
  const sizeInKB = byteArray.length / 1024;
  return parseFloat(sizeInKB.toFixed(2));
}

/**
 * Standardizes an address to the format "0x" followed by 64 lowercase hexadecimal digits.
 */
export const standardizeAddress = (address: AccountAddressInput): string => {
  return (
    AccountAddress.from(address, {
      maxMissingChars: 63,
    })?.toStringLong() ?? ""
  );
};

export const tryStandardizeAddress = (
  address: AccountAddressInput | null | undefined,
  logError?: boolean,
): string | undefined => {
  if (address) {
    try {
      return standardizeAddress(address);
    } catch (e) {
      if (logError && process.env.NODE_ENV === "development") {
        console.warn("Failed to standardize address", address, e);
      }
      return undefined;
    }
  }
  return undefined;
};

function escapeRegExp(regexpString: string) {
  return regexpString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getPublicFunctionLineNumber(
  sourceCode: string,
  functionName: string,
) {
  const lines = sourceCode.split("\n");
  const publicEntryFunRegexp = new RegExp(
    `\\s*public\\s*(entry\\s*)?fun\\s*${escapeRegExp(functionName)}\\s*(?:<|\\()`,
  );

  const lineNumber = lines.findIndex((line) =>
    line.match(publicEntryFunRegexp),
  );
  return lineNumber !== -1 ? lineNumber : 0;
}

/**
 * Extract parameter names from Move source code for a given function.
 * Returns an array of parameter names in order, or null if parsing fails.
 *
 * Example Move function:
 *   public entry fun transfer<T>(sender: &signer, recipient: address, amount: u64)
 * Would return: ["sender", "recipient", "amount"]
 */
export function extractFunctionParamNames(
  sourceCode: string,
  functionName: string,
): string[] | null {
  if (!sourceCode || !functionName) return null;

  try {
    // Find the function definition - handles public, public(friend), entry, view
    const funcRegex = new RegExp(
      `(?:public(?:\\s*\\([^)]*\\))?\\s*)?(?:entry\\s+)?fun\\s+${escapeRegExp(functionName)}\\s*(?:<[^>]*>)?\\s*\\(([^)]*)\\)`,
      "s",
    );

    const match = sourceCode.match(funcRegex);
    if (!match || !match[1]) return null;

    const paramsStr = match[1].trim();
    if (!paramsStr) return [];

    // Parse parameters - they're in format: name: type, name2: type2
    // Handle multi-line and complex types like vector<u8>, Option<address>, etc.
    const params: string[] = [];
    let depth = 0;
    let currentParam = "";

    for (let i = 0; i < paramsStr.length; i++) {
      const char = paramsStr[i];

      if (char === "<") {
        depth++;
        currentParam += char;
      } else if (char === ">") {
        depth--;
        currentParam += char;
      } else if (char === "," && depth === 0) {
        // End of parameter
        const paramName = extractParamName(currentParam.trim());
        if (paramName) params.push(paramName);
        currentParam = "";
      } else {
        currentParam += char;
      }
    }

    // Don't forget the last parameter
    if (currentParam.trim()) {
      const paramName = extractParamName(currentParam.trim());
      if (paramName) params.push(paramName);
    }

    return params.length > 0 ? params : null;
  } catch {
    return null;
  }
}

/**
 * Extract just the parameter name from a "name: type" string
 */
function extractParamName(paramStr: string): string | null {
  // Format is: name: type
  // Handle references like &signer, &mut T
  const colonIndex = paramStr.indexOf(":");
  if (colonIndex === -1) return null;

  const name = paramStr.substring(0, colonIndex).trim();
  // Remove any leading & or mut
  return name || null;
}

/**
 * Extract generic type parameter names from Move source code for a given function.
 * Returns an array of type parameter names in order, or null if parsing fails.
 *
 * Example Move function:
 *   public entry fun transfer<CoinType, Recipient: key + store>(sender: &signer, amount: u64)
 * Would return: ["CoinType", "Recipient"]
 */
export function extractFunctionTypeParamNames(
  sourceCode: string,
  functionName: string,
): string[] | null {
  if (!sourceCode || !functionName) return null;

  try {
    // Find the function definition and capture the generic type params part
    // Handles public, public(friend), entry, view
    const funcRegex = new RegExp(
      `(?:public(?:\\s*\\([^)]*\\))?\\s*)?(?:entry\\s+)?fun\\s+${escapeRegExp(functionName)}\\s*<([^>]*)>`,
      "s",
    );

    const match = sourceCode.match(funcRegex);
    if (!match || !match[1]) return null;

    const typeParamsStr = match[1].trim();
    if (!typeParamsStr) return [];

    // Parse type parameters - they're in format: T, U: key + store, V: drop
    // We need to handle nested generics like T: Struct<U>
    const typeParams: string[] = [];
    let depth = 0;
    let currentParam = "";

    for (let i = 0; i < typeParamsStr.length; i++) {
      const char = typeParamsStr[i];

      if (char === "<") {
        depth++;
        currentParam += char;
      } else if (char === ">") {
        depth--;
        currentParam += char;
      } else if (char === "," && depth === 0) {
        // End of type parameter
        const paramName = extractTypeParamName(currentParam.trim());
        if (paramName) typeParams.push(paramName);
        currentParam = "";
      } else {
        currentParam += char;
      }
    }

    // Don't forget the last type parameter
    if (currentParam.trim()) {
      const paramName = extractTypeParamName(currentParam.trim());
      if (paramName) typeParams.push(paramName);
    }

    return typeParams.length > 0 ? typeParams : null;
  } catch {
    return null;
  }
}

/**
 * Extract just the type parameter name from a "T: constraint" string
 * For example:
 *   "T" -> "T"
 *   "CoinType: key + store" -> "CoinType"
 *   "T: Struct<U>" -> "T"
 */
function extractTypeParamName(typeParamStr: string): string | null {
  // Type params may have constraints after a colon
  // Format: Name or Name: constraints
  const colonIndex = typeParamStr.indexOf(":");
  if (colonIndex === -1) {
    // No constraints, just the name
    return typeParamStr.trim() || null;
  }

  const name = typeParamStr.substring(0, colonIndex).trim();
  return name || null;
}

export function encodeInputArgsForViewRequest(type: string, value: string) {
  if (type.includes("vector")) {
    return value.trim().startsWith("0x")
      ? value.trim()
      : encodeVectorForViewRequest(type, value);
  } else if (type === "bool") {
    if (value !== "true" && value !== "false")
      throw new Error(`Invalid bool value: ${value}`);
    return value === "true";
  } else if (["u8", "u16", "u32"].includes(type)) {
    return ensureNumber(value);
  } else if (["u64", "u128", "u256"].includes(type)) {
    ensureBigInt(value);
    return value.trim();
  } else if (type.startsWith("0x1::option::Option")) {
    return {vec: [...(value ? [value] : [])]};
  } else return value;
}

export function deserializeVector(vectorString: string): string[] {
  let result = vectorString.trim();
  if (result[0] === "[" && result[result.length - 1] === "]") {
    result = result.slice(1, -1);
  }
  if (result.length == 0) return [];
  return result.split(",");
}

function encodeVectorForViewRequest(type: string, value: string) {
  const rawVector = deserializeVector(value);
  const regex = /vector<([^]+)>/;
  const match = type.match(regex);
  if (match) {
    if (match[1] === "u8") {
      return new Hex(
        new Uint8Array(
          rawVector.map((v) => {
            const result = ensureNumber(v.trim());
            if (result < 0 || result > 255)
              throw new Error(`Invalid u8 value: ${result}`);
            return result;
          }),
        ),
      ).toString();
    } else if (["u16", "u32"].includes(match[1])) {
      return rawVector.map((v) => ensureNumber(v.trim()));
    } else if (["u64", "u128", "u256"].includes(match[1])) {
      rawVector.forEach((v) => ensureBigInt(v.trim()));
      return rawVector;
    } else if (match[1] === "bool") {
      return rawVector.map((v) => ensureBoolean(v.trim()));
    } else {
      return rawVector;
    }
  } else {
    throw new Error(`Unsupported type: ${type}`);
  }
}

function ensureNumber(val: number | string): number {
  if (typeof val === "number") return val;
  const res = Number.parseInt(val, 10);
  if (Number.isNaN(res)) throw new Error("Invalid number string.");
  return res;
}

export function ensureBigInt(val: number | bigint | string): bigint {
  return BigInt(val);
}

export function ensureBoolean(val: boolean | string): boolean {
  if (typeof val === "boolean") return val;
  if (val === "true") return true;
  if (val === "false") return false;
  throw new Error("Invalid boolean string.");
}

/** A wallet sort function to ensure that Petra is always at the top of the wallet list. */
export function sortPetraFirst(a: AdapterWallet | AdapterNotDetectedWallet) {
  return a.name === "Petra" ? -1 : 1;
}

export function getAssetSymbol(
  panoraSymbol: string | null | undefined,
  bridge: string | null | undefined,
  symbol: string | null | undefined,
) {
  if (panoraSymbol && panoraSymbol !== symbol) {
    if (bridge) return `${panoraSymbol} (${bridge} ${symbol})`;
    return `${panoraSymbol} (${symbol})`;
  } else if (symbol) {
    return symbol;
  } else {
    return "Unknown Symbol";
  }
}

/**
 * Timestamp utilities
 */
export function ensureMillisecondTimestamp(
  timestamp: string | undefined | null,
): bigint {
  if (!timestamp) {
    return BigInt(0);
  }
  if (timestamp.length > 13) {
    timestamp = timestamp.slice(0, 13);
  }
  if (timestamp.length == 10) {
    timestamp = timestamp + "000";
  }
  return BigInt(timestamp);
}

/**
 * Parse a timestamp string into a Date object
 * @param timestamp - Timestamp string (microseconds or milliseconds)
 * @param ensureMilliSeconds - Whether to convert to milliseconds
 * @returns Date object
 */
export function parseTimestamp(
  timestamp: string,
  ensureMilliSeconds: boolean = true,
): Date {
  let time: bigint;
  if (ensureMilliSeconds) {
    time = ensureMillisecondTimestamp(timestamp);
  } else {
    time = BigInt(timestamp);
  }
  // Max safe date value
  if (time > 8640000000000000n) {
    return new Date(8640000000000000);
  } else {
    return new Date(Number(time));
  }
}

export function parseTimestampString(
  timestamp: string,
  ensureMilliSeconds: boolean = true,
): string {
  let time: bigint;
  if (ensureMilliSeconds) {
    time = ensureMillisecondTimestamp(timestamp);
  } else {
    time = BigInt(timestamp);
  }
  if (time > 8640000000000000n) {
    return `> ${timestampDisplay(new Date(8640000000000000)).local_formatted}`;
  } else {
    return timestampDisplay(new Date(Number(time))).local_formatted;
  }
}

export function parseExpirationTimestamp(timestamp: string): string {
  return (BigInt(timestamp) * 1000n).toString(10);
}

export interface TimestampDisplay {
  formatted: string;
  local_formatted: string;
  local_formatted_short: string;
}

export function timestampDisplay(timestamp: Date): TimestampDisplay {
  return {
    formatted: format(timestamp, "MM/dd/yy HH:mm:ss.SSS") + " UTC",
    local_formatted: format(timestamp, "MM/dd/yyyy HH:mm:ss.SSS"),
    local_formatted_short: format(timestamp, "MM/dd/yy HH:mm:ss.SSS"),
  };
}

/**
 * Calculate the difference between two dates in milliseconds
 * Replacement for moment.duration().diff()
 */
export function getTimeDiffInMs(startDate: Date, endDate: Date): number {
  return differenceInMilliseconds(endDate, startDate);
}

/**
 * Calculate the difference between two dates in seconds
 */
export function getTimeDiffInSeconds(startDate: Date, endDate: Date): number {
  return differenceInMilliseconds(endDate, startDate) / 1000;
}

export function truncate(
  str: string,
  frontLen: number,
  backLen: number,
  truncateStr: string,
) {
  if (!str) return "";

  if (!Number.isInteger(frontLen) || !Number.isInteger(backLen)) {
    throw `${frontLen} and ${backLen} should be an Integer`;
  }

  const strLen = str.length;
  truncateStr = truncateStr || "…";
  if (
    (frontLen === 0 && backLen === 0) ||
    frontLen >= strLen ||
    backLen >= strLen ||
    frontLen + backLen >= strLen
  ) {
    return str;
  } else if (backLen === 0) {
    return str.slice(0, frontLen) + truncateStr;
  } else {
    return str.slice(0, frontLen) + truncateStr + str.slice(strLen - backLen);
  }
}

export function truncateAddress(accountAddress: string) {
  return truncate(accountAddress, 6, 4, "…");
}

export function truncateAddressMiddle(accountAddress: string) {
  return truncate(accountAddress, 20, 20, "…");
}

export function isValidAccountAddress(accountAddr: string): boolean {
  return /^((0[xX])?[a-fA-F0-9]{64}|(0[xX])[a-fA-F0-9]{1,64})$/.test(
    accountAddr,
  );
}

export function isValidStruct(maybeStruct: string): boolean {
  if (
    !/^0x[a-fA-F0-9]{1,64}::[a-zA-Z_][a-zA-Z0-9_]*::[a-zA-Z_][a-zA-Z0-9_]*(<.+>)?$/.test(
      maybeStruct,
    )
  ) {
    return false;
  }

  try {
    parseTypeTag(maybeStruct);
  } catch {
    return false;
  }
  return true;
}

export function is32ByteHex(text: string) {
  return /^(0[xX])?[a-fA-F0-9]{64}$/.test(text);
}

export function isNumeric(text: string) {
  return /^-?\d+$/.test(text);
}

export function getTableFormattedTimestamp(timestamp?: string): string {
  if (!timestamp || timestamp === "0") return "-";
  return parseTimestampString(timestamp);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a URL is an IPFS URL (either native ipfs:// or gateway URL)
 * Matches:
 * - ipfs://hash
 * - ipns://hash
 * - https://any-domain.com/ipfs/hash
 * - https://any-domain.com/ipns/hash
 * - https://{hash}.ipfs.{domain}/ (subdomain gateway)
 * - https://{hash}.ipns.{domain}/ (subdomain gateway)
 */
export function isValidIpfsUrl(url: string): boolean {
  if (!url) return false;

  // Check for native IPFS/IPNS protocol
  if (url.startsWith("ipfs://") || url.startsWith("ipns://")) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);

    // Check for path-based gateway URLs (/ipfs/hash or /ipns/hash)
    const pathMatch = parsedUrl.pathname.match(/^\/(ipfs|ipns)\/(.+)/);
    if (pathMatch) {
      return true;
    }

    // Check for subdomain gateway URLs ({hash}.ipfs.{domain} or {hash}.ipns.{domain})
    // e.g., bafybei...ipfs.w3s.link, bafybei...ipfs.dweb.link
    const subdomainMatch = parsedUrl.hostname.match(
      /^([a-zA-Z0-9]+)\.(ipfs|ipns)\..+$/,
    );
    if (subdomainMatch) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Convert any IPFS URL to a normalized ipfs.io gateway URL for loading data
 * Handles:
 * - ipfs://hash → https://ipfs.io/ipfs/hash
 * - ipns://hash → https://ipfs.io/ipns/hash
 * - https://any-gateway.com/ipfs/hash → https://ipfs.io/ipfs/hash
 * - https://any-gateway.com/ipns/hash → https://ipfs.io/ipns/hash
 * - https://{hash}.ipfs.{domain}/path → https://ipfs.io/ipfs/{hash}/path
 * - https://{hash}.ipns.{domain}/path → https://ipfs.io/ipns/{hash}/path
 */
export function toIpfsUrl(url: string): string {
  if (!url) return url;

  // Handle native ipfs:// protocol
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }

  // Handle native ipns:// protocol
  if (url.startsWith("ipns://")) {
    return `https://ipfs.io/ipns/${url.slice(7)}`;
  }

  try {
    const parsedUrl = new URL(url);

    // Handle path-based gateway URLs - extract the /ipfs/hash or /ipns/hash part
    const pathMatch = parsedUrl.pathname.match(/^\/(ipfs|ipns)\/(.+)/);
    if (pathMatch) {
      const [, protocol, hash] = pathMatch;
      // Preserve any query string and fragment
      const suffix = (parsedUrl.search || "") + (parsedUrl.hash || "");
      return `https://ipfs.io/${protocol}/${hash}${suffix}`;
    }

    // Handle subdomain gateway URLs ({hash}.ipfs.{domain} or {hash}.ipns.{domain})
    const subdomainMatch = parsedUrl.hostname.match(
      /^([a-zA-Z0-9]+)\.(ipfs|ipns)\..+$/,
    );
    if (subdomainMatch) {
      const [, hash, protocol] = subdomainMatch;
      // Include pathname (minus leading slash if combining with hash)
      const path = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname;
      const suffix = (parsedUrl.search || "") + (parsedUrl.hash || "");
      return `https://ipfs.io/${protocol}/${hash}${path}${suffix}`;
    }
  } catch {
    // Not a valid URL, return as-is
  }

  return url;
}

/**
 * Convert any IPFS URL to a normalized ipfs:// or ipns:// protocol URL for display
 * Handles:
 * - https://any-gateway.com/ipfs/hash → ipfs://hash
 * - https://any-gateway.com/ipns/hash → ipns://hash
 * - https://{hash}.ipfs.{domain}/path → ipfs://{hash}/path
 * - https://{hash}.ipns.{domain}/path → ipns://{hash}/path
 * - ipfs://hash → ipfs://hash (unchanged)
 * - ipns://hash → ipns://hash (unchanged)
 */
export function toIpfsDisplayUrl(url: string): string {
  if (!url) return url;

  // Already in native format
  if (url.startsWith("ipfs://") || url.startsWith("ipns://")) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);

    // Handle path-based gateway URLs - extract the /ipfs/hash or /ipns/hash part
    const pathMatch = parsedUrl.pathname.match(/^\/(ipfs|ipns)\/(.+)/);
    if (pathMatch) {
      const [, protocol, hash] = pathMatch;
      // Preserve any query string and fragment
      const suffix = (parsedUrl.search || "") + (parsedUrl.hash || "");
      return `${protocol}://${hash}${suffix}`;
    }

    // Handle subdomain gateway URLs ({hash}.ipfs.{domain} or {hash}.ipns.{domain})
    const subdomainMatch = parsedUrl.hostname.match(
      /^([a-zA-Z0-9]+)\.(ipfs|ipns)\..+$/,
    );
    if (subdomainMatch) {
      const [, hash, protocol] = subdomainMatch;
      // Include pathname (minus leading slash if combining with hash)
      const path = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname;
      const suffix = (parsedUrl.search || "") + (parsedUrl.hash || "");
      return `${protocol}://${hash}${path}${suffix}`;
    }
  } catch {
    // Not a valid URL, return as-is
  }

  return url;
}

/**
 * Formatting utilities
 */
export function formatNumber(num: number | string): string {
  return Number(num).toLocaleString("en-US");
}

export function octaToApt(octa: number | string | bigint): number {
  const OCTA = 100000000;
  return Number(octa) / OCTA;
}

export function formatApt(
  octa: number | string | bigint,
  decimals = 2,
): string {
  const apt = octaToApt(octa);
  return `${apt.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} APT`;
}

/**
 * CSV Export utilities
 */
export function formatTransactionForCSV(
  transaction: Types.Transaction,
  address?: string,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  if ("version" in transaction) result.Version = transaction.version;
  if ("success" in transaction) result.Success = transaction.success;
  result.Type = transaction.type;
  if ("timestamp" in transaction && transaction.timestamp) {
    result.Timestamp = getTableFormattedTimestamp(transaction.timestamp);
  }
  if ("sender" in transaction) result.Sender = transaction.sender;
  if ("sequence_number" in transaction)
    result.SequenceNumber = transaction.sequence_number;
  if ("gas_used" in transaction) result.GasUsed = transaction.gas_used;
  if ("gas_unit_price" in transaction)
    result.GasUnitPrice = transaction.gas_unit_price;
  if ("max_gas_amount" in transaction)
    result.MaxGasAmount = transaction.max_gas_amount;
  if ("expiration_timestamp_secs" in transaction) {
    result.ExpirationTimestamp = transaction.expiration_timestamp_secs;
  }
  if (
    transaction.type === "user_transaction" &&
    "payload" in transaction &&
    transaction.payload &&
    typeof transaction.payload === "object" &&
    "function" in transaction.payload
  ) {
    result.Function = `${(transaction.payload as {function: string}).function}`;
  }
  if (address) result.Address = address;

  return result;
}

export function transactionsToCSV(
  transactions: Types.Transaction[],
  address?: string,
): string {
  if (transactions.length === 0) return "";

  const allKeys = new Set<string>();
  transactions.forEach((txn) => {
    const formatted = formatTransactionForCSV(txn, address);
    Object.keys(formatted).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys).sort();
  let csv = headers.join(",") + "\n";

  transactions.forEach((txn) => {
    const formatted = formatTransactionForCSV(txn, address);
    const row = headers.map((header) => {
      const value = formatted[header];
      if (
        typeof value === "string" &&
        (value.includes(",") || value.includes('"') || value.includes("\n"))
      ) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? "";
    });
    csv += row.join(",") + "\n";
  });

  return csv;
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
