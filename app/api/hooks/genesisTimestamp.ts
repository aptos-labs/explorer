import type {NetworkName} from "../../lib/constants";
import {fallbackArchiveNodeUrl, parseArchivalEndpoint} from "../archivalNode";

/**
 * Microseconds. Anything earlier than ~2001-09-09 is not a chain start:
 * Aptos reports an unset genesis time as `0` (and the genesis transaction
 * itself has no timestamp field).
 */
export const MIN_PLAUSIBLE_GENESIS_TIMESTAMP_US = 1_000_000_000_000_000n;

export type GenesisTime = {
  /** Microseconds since the Unix epoch. */
  timestamp: string;
  /**
   * Ledger version the timestamp was taken from.
   * `"0"` is the genesis block; `"1"` is transaction 1 (block 1).
   */
  version: "0" | "1";
};

export function chainTimestampDigits(value: unknown): string | null {
  if (typeof value === "string") {
    const raw = value.trim();
    return /^\d+$/.test(raw) ? raw : null;
  }
  if (typeof value === "bigint" && value >= 0n) return value.toString();
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return String(value);
  }
  return null;
}

export function isPlausibleGenesisTimestamp(digits: string): boolean {
  try {
    return BigInt(digits) >= MIN_PLAUSIBLE_GENESIS_TIMESTAMP_US;
  } catch {
    return false;
  }
}

/**
 * Prefer the genesis block timestamp when it is a real chain time.
 * Aptos leaves that timestamp unset (`0`, and the genesis transaction omits
 * it). Transaction version 1 — the first block-metadata transaction, which
 * is block 1 — carries the actual start time.
 */
export function resolveGenesisTimestamp(
  genesisTimestamp: unknown,
  transactionOneTimestamp: unknown,
): GenesisTime | null {
  const genesis = chainTimestampDigits(genesisTimestamp);
  if (genesis && isPlausibleGenesisTimestamp(genesis)) {
    return {timestamp: genesis, version: "0"};
  }
  const txn1 = chainTimestampDigits(transactionOneTimestamp);
  if (txn1 && txn1 !== "0") {
    return {timestamp: txn1, version: "1"};
  }
  return null;
}

type BlockRead = {
  status: number;
  timestamp: unknown;
  archivalEndpoint: string | undefined;
};

function blockTimestamp(body: unknown): unknown {
  if (!body || typeof body !== "object" || !("block_timestamp" in body)) {
    return undefined;
  }
  return (body as {block_timestamp?: unknown}).block_timestamp;
}

function headerArchivalEndpoint(res: Response): string | null {
  try {
    return res.headers?.get?.("x-aptos-archival-endpoint") ?? null;
  } catch {
    return null;
  }
}

async function readBlock(
  baseUrl: string,
  height: number,
  headers?: Record<string, string>,
): Promise<BlockRead> {
  const url = `${baseUrl}/blocks/by_height/${height}?with_transactions=false`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: headers && Object.keys(headers).length > 0 ? headers : undefined,
      credentials: "omit",
    });
  } catch {
    return {status: 0, timestamp: undefined, archivalEndpoint: undefined};
  }

  let body: unknown = null;
  if (typeof res.json === "function") {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  }

  const archival =
    parseArchivalEndpoint(body, baseUrl) ??
    parseArchivalEndpoint(
      {archival_endpoint: headerArchivalEndpoint(res)},
      baseUrl,
    );

  return {
    status: res.status,
    timestamp: blockTimestamp(body),
    archivalEndpoint: archival,
  };
}

async function genesisFromNode(
  baseUrl: string,
  headers: Record<string, string> | undefined,
  block0?: BlockRead,
): Promise<GenesisTime | null> {
  const genesisBlock = block0 ?? (await readBlock(baseUrl, 0, headers));
  const genesisDigits = chainTimestampDigits(genesisBlock.timestamp);
  if (genesisDigits && isPlausibleGenesisTimestamp(genesisDigits)) {
    return {timestamp: genesisDigits, version: "0"};
  }
  const block1 = await readBlock(baseUrl, 1, headers);
  return resolveGenesisTimestamp(genesisBlock.timestamp, block1.timestamp);
}

/**
 * Chain start time for a network.
 *
 * Block 0 is the genesis block. Its `block_timestamp` matches the genesis
 * transaction, which Aptos leaves at `0`. Block 1's `block_timestamp` is
 * transaction version 1 (`first_version` is `"1"`). Pruned fullnodes answer
 * 410; the retry goes to the advertised archive **without** the gateway key
 * (archive hosts 401 when that key is forwarded).
 */
export async function fetchGenesisTimestamp(
  networkName: NetworkName,
  baseUrl: string,
  headers: Record<string, string>,
): Promise<GenesisTime | null> {
  const node = baseUrl.replace(/\/+$/, "");
  const block0 = await readBlock(node, 0, headers);
  if (block0.status === 410) {
    const archive =
      block0.archivalEndpoint ?? fallbackArchiveNodeUrl(node, networkName);
    if (!archive) return null;
    return genesisFromNode(archive, undefined);
  }
  return genesisFromNode(node, headers, block0);
}
