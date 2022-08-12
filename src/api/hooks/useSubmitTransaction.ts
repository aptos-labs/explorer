import {TxnBuilderTypes, AptosClient} from "aptos";
import {useState} from "react";

import {
  useWalletContext,
  walletExplorerNetworkMap,
} from "../../context/wallet/context";
import {signAndSubmitTransaction} from "../wallet";
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
  const [state, _] = useGlobalState();
  const {walletNetwork} = useWalletContext();
  const client = new AptosClient(state.network_value);

  async function submitTransaction(
    payload: TxnBuilderTypes.TransactionPayloadScriptFunction,
  ) {
    // if dApp network !== wallet network => return error
    if (walletExplorerNetworkMap(walletNetwork) !== state.network_name) {
      setTransactionResponse({
        transactionSubmitted: false,
        message:
          "Wallet and Explorer should use the same network to submit a transaction",
      });
      return;
    }
    await signAndSubmitTransaction(payload, client).then(
      setTransactionResponse,
    );
  }

  function clearTransactionResponse() {
    setTransactionResponse(null);
  }

  return {submitTransaction, transactionResponse, clearTransactionResponse};
};

export default useSubmitTransaction;
