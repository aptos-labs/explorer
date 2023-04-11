import {Types} from "aptos";
import {useEffect, useState} from "react";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useGlobalState} from "../../GlobalState";

export type TransactionResponse =
  | TransactionResponseOnSubmission
  | TransactionResponseOnError;

// "submission" here means that the transaction is posted on chain and gas is paid.
// However, the status of the transaction might not be "success".
export type TransactionResponseOnSubmission = {
  transactionSubmitted: true;
  transactionHash: string;
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
    if (network?.name.toLocaleLowerCase() !== state.network_name) {
      setTransactionResponse({
        transactionSubmitted: false,
        message:
          "Wallet and Explorer should use the same network to submit a transaction",
      });
      return;
    }

    setTransactionInProcess(true);

    const useSignAndSubmitTransaction = async (
      transactionPayload: Types.TransactionPayload,
    ): Promise<TransactionResponse> => {
      const responseOnError: TransactionResponseOnError = {
        transactionSubmitted: false,
        message: "Unknown Error",
      };
      try {
        const response = await signAndSubmitTransaction(transactionPayload);
        // transaction succeed
        if ("hash" in response) {
          await state.aptos_client.waitForTransaction(response["hash"]);
          return {
            transactionSubmitted: true,
            transactionHash: response["hash"],
          };
        }
        // transaction failed
        return {...responseOnError, message: response.message};
      } catch (error: any) {
        responseOnError.message = error;
      }
      return responseOnError;
    };

    await useSignAndSubmitTransaction(payload).then(setTransactionResponse);
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
