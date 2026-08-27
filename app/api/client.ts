import type {Aptos} from "@aptos-labs/ts-sdk";
import type {Types} from "~/types/aptos";
import {emitRateLimit} from "../context/rate-limit/rateLimitEvents";
import {
  fetchTransactionFromArchival,
  headersFromAptosClient,
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

function shouldTryHistoricalFallback(error: unknown): boolean {
  // 401 happens when the SDK retries 410 against a same-site archive and
  // forwards the explorer API key; archive hosts reject that key.
  return isPrunedOrNotFoundError(error) || isUnauthorizedApiError(error);
}

/**
 * Fetch transaction by hash or version.
 *
 * Confirmed txns come from the fullnode REST API (the SDK retries `410 Gone`
 * against the node's advertised archival endpoint, forwarding credentials when
 * the archive is same-site). Hash lookups that 404 (pruned hashes are
 * indistinguishable from unknown ones) never get that retry. In both cases we
 * then fetch `{archival_endpoint}/transactions/by_{hash|version}/…`
 * **without** API credentials. When REST still fails, reconstruct from indexer
 * GraphQL (version only — the indexer has no hash column).
 */
export async function getTransaction(
  txnHashOrVersion: string,
  client: Aptos,
): Promise<Types.Transaction> {
  try {
    return await fetchTransactionFromFullnode(txnHashOrVersion, client);
  } catch (error) {
    if (shouldTryHistoricalFallback(error)) {
      const fullnode = client.config?.fullnode;
      if (fullnode) {
        try {
          const archived = await fetchTransactionFromArchival(
            fullnode,
            txnHashOrVersion,
            headersFromAptosClient(client),
          );
          if (archived) {
            return archived as Types.Transaction;
          }
        } catch {
          // Archival misses should fall through to indexer / NOT_FOUND.
        }
      }
      try {
        const indexed = await getTransactionFromIndexer(
          client,
          txnHashOrVersion,
        );
        if (indexed) return indexed;
      } catch {
        // Indexer failures should not hide the original REST error.
      }
    }
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
