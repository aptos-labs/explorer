import {AccountAddress, type Aptos, type Block} from "@aptos-labs/ts-sdk";
import type {Types} from "~/types/aptos";
import {mapWithConcurrencyLimit} from "../utils/mapWithConcurrencyLimit";
import {
  fetchBlockFromArchival,
  headersFromAptosClient,
  networkNameFromAptosClient,
} from "./archivalNode";
import {
  getTransaction,
  recoverHistoricalData,
  withResponseError,
} from "./client";
import {toMoveResource} from "./moveResource";

/** Avoid bursting dozens of parallel `getBlockByHeight` calls (edge/CDN rate limits). */
const DEFAULT_BLOCKS_REST_CONCURRENCY = 8;

function fetchBlockFromArchiveNode(
  aptos: Aptos,
  request: {
    height?: number;
    version?: number;
    withTransactions: boolean;
  },
): Promise<Block | null> {
  const fullnode = aptos.config?.fullnode;
  if (!fullnode) return Promise.resolve(null);
  return fetchBlockFromArchival(
    fullnode,
    request,
    headersFromAptosClient(aptos),
    undefined,
    networkNameFromAptosClient(aptos),
  ).then((archived) => (archived ? (archived as Block) : null));
}

export async function getBlockByHeight(
  requestParameters: {height: number; withTransactions: boolean},
  aptos: Aptos,
): Promise<Block> {
  const {height, withTransactions} = requestParameters;
  try {
    return await aptos.getBlockByHeight({
      blockHeight: height,
      options: {withTransactions},
    });
  } catch (error) {
    const recovered = await recoverHistoricalData(error, () =>
      fetchBlockFromArchiveNode(aptos, {height, withTransactions}),
    );
    if (recovered) return recovered;
    return withResponseError(Promise.reject(error));
  }
}

export async function getBlockByVersion(
  requestParameters: {version: number; withTransactions: boolean},
  aptos: Aptos,
): Promise<Block> {
  const {version, withTransactions} = requestParameters;
  try {
    return await aptos.getBlockByVersion({
      ledgerVersion: version,
      options: {withTransactions},
    });
  } catch (error) {
    const recovered = await recoverHistoricalData(error, () =>
      fetchBlockFromArchiveNode(aptos, {version, withTransactions}),
    );
    if (recovered) return recovered;
    return withResponseError(Promise.reject(error));
  }
}

export async function getRecentBlocks(
  currentBlockHeight: bigint | number,
  count: bigint | number,
  aptos: Aptos,
  options?: {maxConcurrency?: number},
): Promise<Block[]> {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return [];

  const heights = Array.from({length: n}, (_, i) => {
    return BigInt(currentBlockHeight) - BigInt(i);
  });

  const maxConcurrency =
    options?.maxConcurrency ?? DEFAULT_BLOCKS_REST_CONCURRENCY;

  return mapWithConcurrencyLimit(heights, maxConcurrency, (blockHeight) =>
    aptos.getBlockByHeight({
      blockHeight,
      options: {withTransactions: false},
    }),
  );
}

/**
 * Get account info using SDK v2
 */
export async function getAccountV2(
  requestParameters: {address: string},
  aptos: Aptos,
): Promise<Types.AccountData> {
  const {address} = requestParameters;
  const accountAddress = AccountAddress.from(address, {maxMissingChars: 63});
  if (!accountAddress) {
    throw new Error(`Invalid address: ${address}`);
  }
  const accountInfo = await withResponseError(
    aptos.getAccountInfo({accountAddress}),
  );
  // Convert to old format for compatibility
  return {
    sequence_number: accountInfo.sequence_number.toString(),
    authentication_key: accountInfo.authentication_key.toString(),
  } as Types.AccountData;
}

/**
 * Get account resources using SDK v2
 */
export async function getAccountResourcesV2(
  requestParameters: {address: string; ledgerVersion?: number},
  aptos: Aptos,
): Promise<Types.MoveResource[]> {
  const {address, ledgerVersion} = requestParameters;
  const accountAddress = AccountAddress.from(address, {maxMissingChars: 63});
  if (!accountAddress) {
    throw new Error(`Invalid address: ${address}`);
  }
  const resources = await withResponseError(
    aptos.getAccountResources({
      accountAddress,
      options: {
        ledgerVersion:
          ledgerVersion !== undefined ? BigInt(ledgerVersion) : undefined,
      },
    }),
  );
  // Convert to old format for compatibility
  return resources as unknown as Types.MoveResource[];
}

/**
 * Get account resource using SDK v2
 */
export async function getAccountResourceV2(
  requestParameters: {
    address: string;
    resourceType: string;
    ledgerVersion?: number;
  },
  aptos: Aptos,
): Promise<Types.MoveResource> {
  const {address, resourceType, ledgerVersion} = requestParameters;
  const accountAddress = AccountAddress.from(address, {maxMissingChars: 63});
  if (!accountAddress) {
    throw new Error(`Invalid address: ${address}`);
  }
  const resource = await withResponseError(
    aptos.getAccountResource({
      accountAddress,
      resourceType: resourceType as `0x${string}::${string}::${string}`,
      options: {
        ledgerVersion:
          ledgerVersion !== undefined ? BigInt(ledgerVersion) : undefined,
      },
    }),
  );
  // SDK returns the inner payload; restore the REST {type, data} envelope.
  return toMoveResource(resourceType, resource);
}

/**
 * Get transaction using SDK v2, with archive then indexer fallback for
 * pruned history.
 */
export async function getTransactionV2(
  requestParameters: {txnHashOrVersion: string | number},
  aptos: Aptos,
): Promise<Types.Transaction> {
  const {txnHashOrVersion} = requestParameters;
  return getTransaction(String(txnHashOrVersion), aptos);
}
