import {TxnBuilderTypes} from "aptos";
import {useState} from "react";
import {walleExplorertNetworkMap} from "../../constants";
import {useWalletContext} from "../../context/wallet/context";
import {useGlobalState} from "../../GlobalState";
import {signAndSubmitTransaction} from "../wallet";

export type TransactionResponse =
  | TransactionResponseOnSuccess
  | TransactionResponseOnFailure;

export type TransactionResponseOnSuccess = {
  succeeded: true;
  transactionHash: string;
};

export type TransactionResponseOnFailure = {
  succeeded: false;
  message: string;
};

const useSubmitTransaction = () => {
  const [transactionResponse, setTransactionResponse] =
    useState<TransactionResponse | null>(null);
  const [state, _] = useGlobalState();
  const {walletNetwork} = useWalletContext();

  async function submitTransaction(
    payload: TxnBuilderTypes.TransactionPayloadScriptFunction,
  ) {
    // if dApp network !== wallet network => return error
    if (walleExplorertNetworkMap(walletNetwork) !== state.network_name) {
      setTransactionResponse({
        succeeded: false,
        message:
          "Wallet and Explorer should use the same network to submit a transaction",
      });
      return;
    }
    await signAndSubmitTransaction(payload).then(setTransactionResponse);
  }

  function clearTransactionResponse() {
    setTransactionResponse(null);
  }

  return {submitTransaction, transactionResponse, clearTransactionResponse};
};

export default useSubmitTransaction;
