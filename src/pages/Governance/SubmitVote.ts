import {Types} from "aptos";
import {useState} from "react";
import {useWalletContext} from "../../context/wallet/context";

// TODO: confirmation modal
const useSubmitVote = (proposalId: string) => {
  const [voteSucceeded, setVoteSucceeded] = useState<boolean | null>(null);
  const {processTransaction} = useWalletContext();

  async function submitVote(shouldPass: boolean, ownerAccountAddr: string) {
    const payload: Types.TransactionPayload = {
      type: "script_function_payload",
      function: "0x1::aptos_governance::vote",
      type_arguments: [],
      arguments: [ownerAccountAddr, proposalId, shouldPass],
    };

    await processTransaction(payload).then(setVoteSucceeded);
  }

  function resetVoteSucceeded() {
    setVoteSucceeded(null);
  }

  return {submitVote, voteSucceeded, resetVoteSucceeded};
};

export default useSubmitVote;
