import {AptosClient, Types} from "aptos";
import {useEffect, useState} from "react";

import {useWalletContext} from "../../context/wallet/context";
import {signAndSubmitTransaction} from "../wallet";
import {useGlobalState} from "../../GlobalState";
import {networks} from "../../constants";

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
  const [state, _] = useGlobalState();
  const {walletNetwork} = useWalletContext();
  const client = new AptosClient(state.network_value);

  useEffect(() => {
    if (transactionResponse !== null) {
      setTransactionInProcess(false);
    }
  }, [transactionResponse]);

  async function submitTransaction(payload: Types.TransactionPayload) {
    // if wallet network in dApp networks && dApp network !== wallet network => return error
    if (walletNetwork in networks && walletNetwork !== state.network_name) {
      setTransactionResponse({
        transactionSubmitted: false,
        message:
          "Wallet and Explorer should use the same network to submit a transaction",
      });
      return;
    }

    setTransactionInProcess(true);
    await signAndSubmitTransaction(payload, client).then(
      setTransactionResponse,
    );
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
