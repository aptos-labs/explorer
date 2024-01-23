import {FailedTransactionError, Types} from "aptos";
import {useEffect, useState} from "react";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useGlobalState} from "../../global-config/GlobalConfig";

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
  const [transactionInProcess, setTransactionInProcess] =
    useState<boolean>(false);
  const [state] = useGlobalState();
  const {signAndSubmitTransaction, network} = useWallet();

  useEffect(() => {
    if (transactionResponse !== null) {
      setTransactionInProcess(false);
    }
  }, [transactionResponse]);

  async function submitTransaction(payload: Types.TransactionPayload) {
    // TODO: remove "name !== custom", when wallet integration is finished
    if (
      network?.name.toLocaleLowerCase() !== "custom" &&
      network?.name.toLocaleLowerCase() !== state.network_name
    ) {
      setTransactionResponse({
        transactionSubmitted: false,
        message:
          "Wallet and Explorer should use the same network to submit a transaction",
      });
      return;
    }

    setTransactionInProcess(true);

    const signAndSubmitTransactionCall = async (
      transactionPayload: Types.TransactionPayload,
    ): Promise<TransactionResponse> => {
      const responseOnError: TransactionResponseOnError = {
        transactionSubmitted: false,
        message: "Unknown Error",
      };

      let response;
      try {
        response = await signAndSubmitTransaction(transactionPayload);

        // transaction submit succeed
        if ("hash" in response) {
          await state.aptos_client.waitForTransaction(response["hash"], {
            checkSuccess: true,
          });
          return {
            transactionSubmitted: true,
            transactionHash: response["hash"],
            success: true,
          };
        }
        // transaction failed
        return {...responseOnError, message: response.message};
      } catch (error) {
        if (error instanceof FailedTransactionError) {
          return {
            transactionSubmitted: true,
            transactionHash: response ? response.hash : "",
            message: error.message,
            success: false,
          };
        } else if (error instanceof Error) {
          return {...responseOnError, message: error.message};
        }
      }
      return responseOnError;
    };

    await signAndSubmitTransactionCall(payload).then(setTransactionResponse);
  }

  function clearTransactionResponse() {
    setTransactionResponse(null);
  }

  return {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useSubmitTransaction;
