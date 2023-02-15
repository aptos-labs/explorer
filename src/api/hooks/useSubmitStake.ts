import {Types} from "aptos";
import {DELEGATION_POOL_ADDRESS, OCTA} from "../../constants";
import useSubmitTransaction from "./useSubmitTransaction";

const useSubmitStake = () => {
  const {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitTransaction();

  async function submitStake(owner_address: string, stakedAmount: number) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${DELEGATION_POOL_ADDRESS}::delegation_pool::add_stake`,
      type_arguments: [],
      arguments: [owner_address, stakedAmount * OCTA],
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
