import {Types} from "aptos";
import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";

const useSubmitVote = () => {
  const {
    submitTransaction,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  } = useSubmitTransaction();

  async function submitVote(
    proposalId: string,
    shouldPass: boolean,
    ownerAccountAddr: string,
  ) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: "0x1::aptos_governance::vote",
      type_arguments: [],
      arguments: [ownerAccountAddr, proposalId, shouldPass],
    };

    await submitTransaction(payload);
  }

  return {
    submitVote,
    transactionInProcess,
    transactionResponse,
    clearTransactionResponse,
  };
};

export default useSubmitVote;
