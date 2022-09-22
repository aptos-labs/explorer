import {Types} from "aptos";
import useSubmitTransaction from "./useSubmitTransaction";

const useSubmitChangeOperatorStake = () => {
  const {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitTransaction();

  async function changeOperatorStake(voterAddr: string) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: "0x1::stake::set_operator",
      type_arguments: [],
      arguments: [voterAddr],
    };

    await submitTransaction(payload);
  }

  return {
    changeOperatorStake,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useSubmitChangeOperatorStake;
