import {Types} from "aptos";
import {DELEGATION_POOL_ADDRESS} from "../../constants";
import useSubmitTransaction from "./useSubmitTransaction";

// enum name => delegation pool smart contract view function name
export enum StakeOperation {
  STAKE = "add_stake",
  UNLOCK = "unlock",
  REACTIVATE = "reactivate_stake",
  WITHDRAW = "withdraw",
}

const useSubmitStakeOperation = () => {
  const {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitTransaction();

  async function submitStakeOperation(
    owner_address: string,
    amount: number,
    stakeOperation: StakeOperation,
  ) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${DELEGATION_POOL_ADDRESS}::delegation_pool::${stakeOperation}`,
      type_arguments: [],
      arguments: [owner_address, amount], // staking operation uses OCTA as amount basis
    };

    await submitTransaction(payload);
  }

  return {
    submitStakeOperation,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useSubmitStakeOperation;
