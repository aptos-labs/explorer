import {Types} from "aptos";
import useSubmitTransaction from "./useSubmitTransaction";

const useSubmitIncreaseLock = () => {
  const {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitTransaction();

  async function submitIncreaseLockup() {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: "0x1::stake::increase_lockup",
      type_arguments: [],
      arguments: [],
    };

    await submitTransaction(payload);
  }

  return {
    submitIncreaseLockup,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useSubmitIncreaseLock;
