import moment from "moment";
import {parseTypeTag} from "@aptos-labs/ts-sdk";
import {CoinDescription} from "../api/hooks/useGetCoinList";

export function ensureMillisecondTimestamp(timestamp: string): bigint {
  /*
  Could be: 1646458457
        or: 1646440953658538
   */
  if (timestamp.length > 13) {
    timestamp = timestamp.slice(0, 13);
  }
  if (timestamp.length == 10) {
    timestamp = timestamp + "000";
  }
  return BigInt(timestamp);
}

export function parseTimestamp(
  timestamp: string,
  ensureMilliSeconds: boolean = true,
): moment.Moment {
  let time: bigint;
  if (ensureMilliSeconds) {
    time = ensureMillisecondTimestamp(timestamp);
  } else {
    time = BigInt(timestamp);
  }
  if (time > 8640000000000000n) {
    return moment(8640000000000000);
  } else {
    return moment(parseInt(time.toString()));
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
    return `> ${timestampDisplay(moment(8640000000000000)).local_formatted}`;
  } else {
    return timestampDisplay(moment(parseInt(time.toString()))).local_formatted;
  }
}

// expiration_timestamp can be user inputted so we don't want to do any ensuring of milliseconds,
// but it comes back at a different factor than what we need for parsing on the frontend
export function parseExpirationTimestamp(timestamp: string): string {
  return (BigInt(timestamp) * 1000n).toString(10);
}

export interface TimestampDisplay {
  formatted: string;
  local_formatted: string;
  local_formatted_short: string;
}

export function timestampDisplay(timestamp: moment.Moment): TimestampDisplay {
  return {
    formatted: timestamp.format("MM/DD/YY HH:mm:ss.SSS [UTC]"),
    local_formatted: timestamp.local().format("MM/DD/YYYY HH:mm:ss.SSS"),
    local_formatted_short: timestamp.local().format("MM/DD/YY HH:mm:ss.SSS"),
  };
}

export function truncate(
  str: string,
  frontLen: number,
  backLen: number,
  truncateStr: string,
) {
  if (!str) {
    return "";
  }

  if (!Number.isInteger(frontLen) || !Number.isInteger(backLen)) {
    throw `${frontLen} and ${backLen} should be an Integer`;
  }

  const strLen = str.length;
  // Setting default values
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
  // account address is 0x{64 hex characters}
  // with multiple options - 0X, 0x001, 0x1, 0x01
  // can start with that and see if any fails to parsing
  return /^((0[xX])?[a-fA-F0-9]{64}|(0[xX])[a-fA-F0-9]{1,64})$/.test(
    accountAddr,
  );
}

export function isValidStruct(maybeStruct: string): boolean {
  // First regex it, since it'll be faster, for simplicity, we ignore what's inside <>
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
  // If it's 32 byte hex, it must be 64 characters with or without a 0x in front
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

export function isValidIpfsUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.toString().startsWith("ipfs://");
    return true;
  } catch {
    return false;
  }
}

export function toIpfsUrl(url: string): string {
  return `https://ipfs.io/ipfs/${url.slice(7)}`;
}

export function coinOrderIndex(coin: CoinDescription) {
  if (coin.isBanned) {
    return 10000000;
  }

  if (!coin.panoraIndex) {
    return 1000000;
  }
  if (coin.panoraTags.includes("InternalFA")) {
    return coin.panoraIndex + 100000;
  }

  if (coin.panoraTags.includes("LP")) {
    return coin.panoraIndex + 100000;
  }

  if (coin.panoraTags.includes("Bridged")) {
    return coin.panoraIndex + 10000;
  }

  // wrapped but not bridged
  if (coin.name.toLowerCase().includes("wrap")) {
    return coin.panoraIndex + 50000;
  }

  return coin.panoraIndex;
}

// CSV Export Utilities
import {Types} from "aptos";

export function formatTransactionForCSV(
  transaction: Types.Transaction,
  address?: string,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  // Version
  if ("version" in transaction) {
    result.Version = transaction.version;
  }

  // Success
  if ("success" in transaction) {
    result.Success = transaction.success;
  }

  // Type
  result.Type = transaction.type;

  // Timestamp
  if ("timestamp" in transaction && transaction.timestamp) {
    result.Timestamp = getTableFormattedTimestamp(transaction.timestamp);
  }

  // Sender
  if ("sender" in transaction) {
    result.Sender = transaction.sender;
  }

  // Sequence Number
  if ("sequence_number" in transaction) {
    result.SequenceNumber = transaction.sequence_number;
  }

  // Gas Used
  if ("gas_used" in transaction) {
    result.GasUsed = transaction.gas_used;
  }

  // Gas Unit Price
  if ("gas_unit_price" in transaction) {
    result.GasUnitPrice = transaction.gas_unit_price;
  }

  // Max Gas Amount
  if ("max_gas_amount" in transaction) {
    result.MaxGasAmount = transaction.max_gas_amount;
  }

  // Expiration Timestamp
  if ("expiration_timestamp_secs" in transaction) {
    result.ExpirationTimestamp = transaction.expiration_timestamp_secs;
  }

  // Function (if it's a script/user transaction)
  if (transaction.type === "user_transaction" && "payload" in transaction) {
    const payload = transaction.payload;
    if (payload && typeof payload === "object" && "function" in payload) {
      result.Function = `${payload.function}`;
    }
  }

  // Amount and counterparty (if it's a coin transfer)
  if (address && transaction.type === "user_transaction") {
    try {
      // This would need the same logic as getTransactionAmount and getTransactionCounterparty
      // For now, we'll leave it simple - this could be enhanced later
      result.Address = address;
    } catch {
      // If we can't parse the amount, just include the address
      result.Address = address;
    }
  }

  return result;
}

export function transactionsToCSV(
  transactions: Types.Transaction[],
  address?: string,
): string {
  if (transactions.length === 0) {
    return "";
  }

  // Get all unique keys from all transactions
  const allKeys = new Set<string>();
  transactions.forEach((txn) => {
    const formatted = formatTransactionForCSV(txn, address);
    Object.keys(formatted).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys).sort();

  // Create CSV header row
  let csv = headers.join(",") + "\n";

  // Create CSV data rows
  transactions.forEach((txn) => {
    const formatted = formatTransactionForCSV(txn, address);
    const row = headers.map((header) => {
      const value = formatted[header];
      // Escape commas and quotes in CSV
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

  // Clean up the URL object
  URL.revokeObjectURL(url);
}
