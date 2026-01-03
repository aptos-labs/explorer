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

      let response: {hash?: string; [key: string]: unknown} | undefined;
      try {
        response = (await signAndSubmitTransaction(transaction)) as {
          hash?: string;
          [key: string]: unknown;
        };

        // transaction submit succeed
        if (
          response &&
          "hash" in response &&
          typeof response.hash === "string"
        ) {
          await aptosClient.waitForTransaction(response.hash, {
            checkSuccess: true,
          });
          return {
            transactionSubmitted: true,
            transactionHash: response.hash,
            success: true,
          };
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
        return {...responseOnError, message: errorMessage};
      } catch (error) {
        if (error instanceof FailedTransactionError) {
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
          return {...responseOnError, message: error.message};
        }
      }
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
