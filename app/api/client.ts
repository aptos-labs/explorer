import type {Aptos} from "@aptos-labs/ts-sdk";
import type {Types} from "~/types/aptos";
import {emitRateLimit} from "../context/rate-limit/rateLimitEvents";
import {
  fetchTransactionFromArchival,
  headersFromAptosClient,
  networkNameFromAptosClient,
} from "./archivalNode";
import {getTransactionFromIndexer} from "./indexerTransaction";
import {isPrunedOrNotFoundError} from "./prunedTransaction";

export enum ResponseErrorType {
  NOT_FOUND = "Not Found",
  INVALID_INPUT = "Invalid Input",
  UNHANDLED = "Unhandled",
  TOO_MANY_REQUESTS = "Too Many Requests",
}

export type ResponseError = {type: ResponseErrorType; message?: string};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as {message: unknown}).message === "string"
  ) {
    return (error as {message: string}).message;
  }
  return "";
}

/**
 * True for typed `NOT_FOUND` errors and HTTP/API 404-shaped failures.
 * Layout probes for missing Move resources (ObjectCore, Token, Multisig)
 * 404 in the common case and must not be treated as page-level failures.
 */
export function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if (
    "type" in error &&
    (error as ResponseError).type === ResponseErrorType.NOT_FOUND
  ) {
    return true;
  }
  if ("status" in error && (error as {status: unknown}).status === 404) {
    return true;
  }
  const message = errorMessage(error).toLowerCase();
  if (!message) return false;
  return message.includes("not found") || /\b404\b/.test(message);
}

/** Normalize unknown query/API failures into the explorer `ResponseError` shape. */
export function toResponseError(error: unknown): ResponseError {
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    Object.values(ResponseErrorType).includes(
      (error as ResponseError).type as ResponseErrorType,
    )
  ) {
    return {
      type: (error as ResponseError).type,
      message: (error as ResponseError).message,
    };
  }
  if (isNotFoundError(error)) {
    return {
      type: ResponseErrorType.NOT_FOUND,
      message: errorMessage(error) || undefined,
    };
  }
  return {
    type: ResponseErrorType.UNHANDLED,
    message: errorMessage(error) || String(error),
  };
}

/**
 * Wraps a promise with error handling and rate limit detection.
 *
 * @param promise - The promise to wrap
 * @returns Promise that resolves with the result or throws a ResponseError
 */
export async function withResponseError<T>(promise: Promise<T>): Promise<T> {
  return await promise.catch((error: unknown) => {
    // Log error for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", error);
    }

    // Handle Response objects (fetch API errors)
    if (typeof error === "object" && error !== null && "status" in error) {
      const response = error as Response;
      if (response.status === 404 || response.status === 410) {
        throw {
          type: ResponseErrorType.NOT_FOUND,
          message:
            response.status === 410
              ? "Transaction has been pruned from the fullnode."
              : undefined,
        };
      }
      if (response.status === 429) {
        emitRateLimit();
        throw {type: ResponseErrorType.TOO_MANY_REQUESTS};
      }
      if (response.status === 400) {
        throw {
          type: ResponseErrorType.INVALID_INPUT,
          message: `Invalid request: ${response.statusText}`,
        };
      }
    }

    // Handle Error objects
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes(ResponseErrorType.TOO_MANY_REQUESTS.toLowerCase())
      ) {
        emitRateLimit();
        throw {
          type: ResponseErrorType.TOO_MANY_REQUESTS,
        };
      }
      throw {
        type: ResponseErrorType.UNHANDLED,
        message: error.message,
      };
    }

    // Handle unknown error types
    throw {
      type: ResponseErrorType.UNHANDLED,
      message: error instanceof Error ? error.message : String(error),
    };
  });
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (
    error &&
    typeof error === "object" &&
    "type" in error &&
    (error as ResponseError).type === ResponseErrorType.TOO_MANY_REQUESTS
  ) {
    return true;
  }
  return false;
}

async function fetchTransactionFromFullnode(
  txnHashOrVersion: string,
  client: Aptos,
): Promise<Types.Transaction> {
  if (/^\d+$/.test(txnHashOrVersion)) {
    const txn = await client.getTransactionByVersion({
      ledgerVersion: BigInt(txnHashOrVersion),
    });
    return txn as unknown as Types.Transaction;
  }
  const txn = await client.getTransactionByHash({
    transactionHash: txnHashOrVersion,
  });
  return txn as unknown as Types.Transaction;
}

function isUnauthorizedApiError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as {status: unknown}).status === 401
  );
}

/**
 * True when the serving fullnode (including the SDK's credentialed archival
 * retry) could not return history: prune/404, or 401 from a same-site archive
 * that rejects the explorer API key.
 */
export function shouldTryHistoricalFallback(error: unknown): boolean {
  return isPrunedOrNotFoundError(error) || isUnauthorizedApiError(error);
}

/**
 * After the serving fullnode misses, try the archive node without credentials,
 * then reconstruct from the indexer (when it can answer). Archive REST keeps
 * the full transaction/block body; indexer GraphQL omits payload arguments,
 * events, hashes, and write-set resources.
 */
export async function recoverHistoricalData<T>(
  error: unknown,
  tryArchival?: () => Promise<T | null>,
  tryIndexer?: () => Promise<T | null>,
): Promise<T | undefined> {
  if (!shouldTryHistoricalFallback(error)) return undefined;

  if (tryArchival) {
    try {
      const archived = await tryArchival();
      if (archived) return archived;
    } catch {
      // Archival misses should fall through to the indexer or original REST error.
    }
  }

  if (tryIndexer) {
    try {
      const indexed = await tryIndexer();
      if (indexed) return indexed;
    } catch {
      // Indexer failures should not hide the original REST error.
    }
  }

  return undefined;
}

function fetchTransactionFromArchiveNode(
  txnHashOrVersion: string,
  client: Aptos,
): Promise<Types.Transaction | null> {
  const fullnode = client.config?.fullnode;
  if (!fullnode) return Promise.resolve(null);
  return fetchTransactionFromArchival(
    fullnode,
    txnHashOrVersion,
    headersFromAptosClient(client),
    undefined,
    networkNameFromAptosClient(client),
  ).then((archived) => (archived ? (archived as Types.Transaction) : null));
}

/**
 * Fetch transaction by hash or version.
 *
 * 1. Serving public fullnode REST (the SDK retries `410 Gone` against the
 *    advertised archival endpoint, forwarding credentials when the archive is
 *    same-site).
 * 2. Archive node REST **without** credentials (pruned hashes/versions, or a
 *    401 from the SDK archive retry).
 * 3. Indexer GraphQL reconstruction for numeric versions only (no hash column)
 *    when the archive also misses. The indexer omits payload arguments, events,
 *    hashes, and write-set resources.
 */
export async function getTransaction(
  txnHashOrVersion: string,
  client: Aptos,
): Promise<Types.Transaction> {
  try {
    return await fetchTransactionFromFullnode(txnHashOrVersion, client);
  } catch (error) {
    const recovered = await recoverHistoricalData(
      error,
      () => fetchTransactionFromArchiveNode(txnHashOrVersion, client),
      () => getTransactionFromIndexer(client, txnHashOrVersion),
    );
    if (recovered) return recovered;
    return withResponseError(Promise.reject(error));
  }
}

/**
 * Fetch account info
 */
export async function getAccount(address: string, client: Aptos) {
  return withResponseError(client.getAccountInfo({accountAddress: address}));
}

/**
 * Fetch account resources
 */
export async function getAccountResources(address: string, client: Aptos) {
  return withResponseError(
    client.getAccountResources({accountAddress: address}),
  );
}

/**
 * Fetch account modules
 */
export async function getAccountModules(address: string, client: Aptos) {
  return withResponseError(client.getAccountModules({accountAddress: address}));
}

/**
 * Fetch block by height
 */
export async function getBlockByHeight(height: number, client: Aptos) {
  return withResponseError(
    client.getBlockByHeight({
      blockHeight: height,
      options: {withTransactions: true},
    }),
  );
}

/**
 * Fetch latest block
 */
export async function getLedgerInfo(client: Aptos) {
  return withResponseError(client.getLedgerInfo());
}

/**
 * Fetch validators
 */
export async function getValidators(client: Aptos) {
  return withResponseError(
    client.getAccountResource({
      accountAddress: "0x1",
      resourceType: "0x1::stake::ValidatorSet",
    }),
  );
}

/**
 * View function call
 */
export async function viewFunction<T extends unknown[]>(
  client: Aptos,
  payload: {
    function: `${string}::${string}::${string}`;
    typeArguments?: string[];
    functionArguments?: unknown[];
  },
): Promise<T> {
  return withResponseError(
    client.view<T>({
      payload: {
        function: payload.function,
        typeArguments: payload.typeArguments || [],
        functionArguments:
          (payload.functionArguments as Parameters<
            typeof client.view
          >[0]["payload"]["functionArguments"]) || [],
      },
    }),
  );
}
