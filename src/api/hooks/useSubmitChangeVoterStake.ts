import {Types} from "aptos";
import useSubmitTransaction from "./useSubmitTransaction";

const useSubmitChangeVoterStake = () => {
  const {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitTransaction();

  async function changeVoterStake(voterAddr: string) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: "0x1::stake::set_delegated_voter",
      type_arguments: [],
      arguments: [voterAddr],
    };

    await submitTransaction(payload);
  }

  return {
    changeVoterStake,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useSubmitChangeVoterStake;
