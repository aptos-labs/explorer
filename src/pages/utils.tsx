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
    !/^0x[a-fA-F0-9]{1,64}::[a-zA-Z_]+::[a-zA-Z_]+(<.+>)?$/.test(maybeStruct)
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
