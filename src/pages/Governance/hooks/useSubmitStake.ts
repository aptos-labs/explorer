import {Types} from "aptos";
import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";

const useSubmitStake = () => {
  const {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitTransaction();

  async function submitStake(
    stakingAmount: string,
    operatorAddr: string,
    voterAddr: string,
  ) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: "0x1::stake::initialize_stake_owner",
      type_arguments: [],
      arguments: [stakingAmount, operatorAddr, voterAddr],
    };

    await submitTransaction(payload);
  }

  return {
    submitStake,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useSubmitStake;
