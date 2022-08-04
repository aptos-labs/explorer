import {Types} from "aptos";
import {useWalletContext} from "../../context/wallet/context";

// TODO: refresh page / show new result after voting
const useSubmitVote = (proposalId: string) => {
  const {processTransaction} = useWalletContext();

  function submitVote(shouldPass: boolean, ownerAccountAddr: string) {
    const payload: Types.TransactionPayload = {
      type: "script_function_payload",
      function: "0x1::aptos_governance::vote",
      type_arguments: [],
      arguments: [ownerAccountAddr, proposalId, shouldPass],
    };

    processTransaction(payload);
  }

  return [submitVote];
};

export default useSubmitVote;
