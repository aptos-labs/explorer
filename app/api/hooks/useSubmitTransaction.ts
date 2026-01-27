import {FailedTransactionError} from "aptos";
import {useState} from "react";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import {useNetworkName, useAptosClient} from "../../global-config";

export type TransactionResponse =
  | TransactionResponseOnSubmission
  | TransactionResponseOnError;

// "submission" here means that the transaction is posted on chain and gas is paid.
// However, the status of the transaction might not be "success".
export type TransactionResponseOnSubmission = {
  transactionSubmitted: true;
  transactionHash: string;
  success: boolean; // indicates if the transaction submitted but failed or not
  message?: string; // error message if the transaction failed
};

export type TransactionResponseOnError = {
  transactionSubmitted: false;
  message: string;
};

/**
 * Extracts a user-friendly error message from various error types.
 * Handles Error instances, FailedTransactionError, strings, objects with message property, etc.
 */
function extractErrorMessage(error: unknown): string {
  // Handle Error instances (including FailedTransactionError)
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors (e.g., "User has rejected the request")
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with a message property
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  // Handle objects with an error property (nested error)
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string"
  ) {
    return error.error;
  }

  // Handle null or undefined
  if (error === null || error === undefined) {
    return "Transaction was cancelled or failed";
  }

  // Fallback: try to convert to string
  try {
    const errorString = String(error);
    // If it's not just "[object Object]", use it
    if (errorString !== "[object Object]") {
      return errorString;
    }
  } catch {
    // Ignore conversion errors
  }

  // Last resort: generic message
  return "Transaction failed. Please try again.";
}

const useSubmitTransaction = () => {
  const [transactionResponse, setTransactionResponse] =
    useState<TransactionResponse | null>(null);
  const [transactionInProcess, setTransactionInProcess] = useState(false);
  const networkName = useNetworkName();
  const aptosClient = useAptosClient();
  const {signAndSubmitTransaction, wallet, network} = useWallet();

  async function submitTransaction(transaction: InputTransactionData) {
    if (
      network?.name.toLocaleLowerCase() !== networkName &&
      // TODO: This is a hack to get around network being cached
      wallet?.name !== "Google (AptosConnect)"
    ) {
      setTransactionResponse({
        transactionSubmitted: false,
        message:
          "Wallet and Explorer should use the same network to submit a transaction",
      });
      return;
    }

    // Set in process state
    setTransactionInProcess(true);
    setTransactionResponse(null);

    const signAndSubmitTransactionCall = async (
      transaction: InputTransactionData,
    ): Promise<TransactionResponse> => {
      const responseOnError: TransactionResponseOnError = {
        transactionSubmitted: false,
        message: "Unknown Error",
      };

      // Debug: Log transaction start
      console.log("[useSubmitTransaction] Starting transaction submission", {
        transactionData: transaction.data,
        wallet: wallet?.name,
        network: network?.name,
        networkName,
      });

      let response: {hash?: string; [key: string]: unknown} | undefined;
      try {
        // Debug: Log before signAndSubmitTransaction
        console.log(
          "[useSubmitTransaction] Calling signAndSubmitTransaction...",
        );

        response = (await signAndSubmitTransaction(transaction)) as {
          hash?: string;
          [key: string]: unknown;
        };

        // Debug: Log response from signAndSubmitTransaction
        console.log(
          "[useSubmitTransaction] signAndSubmitTransaction response:",
          {
            response,
            hasHash: response && "hash" in response,
            hashType:
              response && "hash" in response ? typeof response.hash : "N/A",
            responseKeys:
              response && typeof response === "object"
                ? Object.keys(response)
                : [],
          },
        );

        // transaction submit succeed
        if (
          response &&
          "hash" in response &&
          typeof response.hash === "string"
        ) {
          console.log(
            "[useSubmitTransaction] Transaction submitted, waiting for confirmation...",
            {hash: response.hash},
          );

          try {
            await aptosClient.waitForTransaction(response.hash, {
              checkSuccess: true,
            });
            console.log(
              "[useSubmitTransaction] Transaction confirmed successfully",
              {hash: response.hash},
            );
            return {
              transactionSubmitted: true,
              transactionHash: response.hash,
              success: true,
            };
          } catch (waitError) {
            console.error(
              "[useSubmitTransaction] Error in waitForTransaction:",
              {
                error: waitError,
                errorType: typeof waitError,
                errorConstructor: waitError?.constructor?.name,
                isError: waitError instanceof Error,
                isFailedTransactionError:
                  waitError instanceof FailedTransactionError,
                errorString: String(waitError),
                hash: response.hash,
              },
            );
            // Re-throw to be caught by outer catch
            throw waitError;
          }
        }
        // transaction failed
        // Note this is for backwards compatibility
        // Response can be an object with a message property or other error shape
        const errorMessage =
          response &&
          typeof response === "object" &&
          "message" in response &&
          typeof response.message === "string"
            ? response.message
            : "Transaction submission failed";

        console.warn(
          "[useSubmitTransaction] Transaction submission failed (no hash in response):",
          {
            response,
            errorMessage,
            responseType: typeof response,
            responseIsObject: response && typeof response === "object",
            responseKeys:
              response && typeof response === "object"
                ? Object.keys(response)
                : [],
          },
        );

        return {...responseOnError, message: errorMessage};
      } catch (error) {
        // Debug: Comprehensive error logging
        console.error("[useSubmitTransaction] Caught error:", {
          error,
          errorType: typeof error,
          errorConstructor: error?.constructor?.name,
          isError: error instanceof Error,
          isFailedTransactionError: error instanceof FailedTransactionError,
          errorString: String(error),
          errorMessage: error instanceof Error ? error.message : undefined,
          errorStack: error instanceof Error ? error.stack : undefined,
          // Additional error properties
          errorKeys:
            error && typeof error === "object" ? Object.keys(error) : [],
          // Response state at time of error
          responseAtError: response,
          responseHasHash:
            response && "hash" in response && typeof response.hash === "string",
        });

        // Extract error message using the helper function
        const errorMessage = extractErrorMessage(error);

        if (error instanceof FailedTransactionError) {
          console.log(
            "[useSubmitTransaction] Handling FailedTransactionError",
            {
              message: error.message,
              hash:
                response &&
                "hash" in response &&
                typeof response.hash === "string"
                  ? response.hash
                  : "",
            },
          );
          return {
            transactionSubmitted: true,
            transactionHash:
              response &&
              "hash" in response &&
              typeof response.hash === "string"
                ? response.hash
                : "",
            message: error.message,
            success: false,
          };
        } else if (error instanceof Error) {
          console.log("[useSubmitTransaction] Handling standard Error", {
            message: error.message,
          });
          return {...responseOnError, message: error.message};
        } else {
          // Handle non-Error types (strings, objects, etc.)
          console.log("[useSubmitTransaction] Handling non-Error type", {
            error,
            errorType: typeof error,
            extractedMessage: errorMessage,
          });
          return {...responseOnError, message: errorMessage};
        }
      }
      // This should not be reached, but kept as safety net
      console.error(
        "[useSubmitTransaction] ⚠️ Unexpected: reached end of function without return",
        {responseOnError},
      );
      return responseOnError;
    };

    await signAndSubmitTransactionCall(transaction).then((response) => {
      setTransactionResponse(response);
      setTransactionInProcess(false);
    });
  }

  function clearTransactionResponse() {
    setTransactionResponse(null);
    setTransactionInProcess(false);
  }

  return {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useSubmitTransaction;
