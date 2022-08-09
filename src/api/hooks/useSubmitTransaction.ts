import {TxnBuilderTypes} from "aptos";
import {useState} from "react";
import {signAndSubmitTransaction} from "../wallet";

export type TransactionResponse = TransactionResponseOnSuccess | TransactionResponseOnFailure;

export type TransactionResponseOnSuccess = {
  succeeded: boolean;
  transactionHash: string;
};

export type TransactionResponseOnFailure = {
  succeeded: boolean;
  message: string;
};

const useSubmitTransaction = () => {
  const [transactionResponse, setTransactionResponse] = useState<TransactionResponse | null>(
    null,
  );

  async function submitTransaction(
    payload: TxnBuilderTypes.TransactionPayloadScriptFunction
  ) {
    await signAndSubmitTransaction(payload).then(setTransactionResponse);
  }

  function clearTransactionResponse() {
    setTransactionResponse(null);
  }

  return {submitTransaction, transactionResponse, clearTransactionResponse};
};

export default useSubmitTransaction;
