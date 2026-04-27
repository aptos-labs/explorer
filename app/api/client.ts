import type {Aptos} from "@aptos-labs/ts-sdk";
import {emitRateLimit} from "~/context/rate-limit/rateLimitEvents";

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
      if (response.status === 404) {
        throw {type: ResponseErrorType.NOT_FOUND};
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
  return !!(
    error &&
    typeof error === "object" &&
    "type" in error &&
    (error as ResponseError).type === ResponseErrorType.TOO_MANY_REQUESTS
  );
}

/**
 * Fetch transaction by hash or version
 */
export async function getTransaction(txnHashOrVersion: string, client: Aptos) {
  // Check if it's a version (all digits) or hash
  if (/^\d+$/.test(txnHashOrVersion)) {
    return withResponseError(
      client.getTransactionByVersion({ledgerVersion: BigInt(txnHashOrVersion)}),
    );
  }
  return withResponseError(
    client.getTransactionByHash({transactionHash: txnHashOrVersion}),
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
