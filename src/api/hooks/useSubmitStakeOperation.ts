import useSubmitTransaction from "./useSubmitTransaction";
import {InputTransactionData} from "@aptos-labs/wallet-adapter-core";

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
    const payload: InputTransactionData = {
      data: {
        function: `0x1::delegation_pool::${stakeOperation}`,
        typeArguments: [],
        functionArguments: [owner_address, amount], // staking operation uses OCTA as amount basis
      },
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
