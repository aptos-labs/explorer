import {Types} from "aptos";
import {useState} from "react";

export type VoteResponse = VoteResponseOnSuccess | VoteResponseOnFailure;

export type VoteResponseOnSuccess = {
  succeeded: boolean;
  transactionHash: string;
};

export type VoteResponseOnFailure = {
  succeeded: boolean;
  message: string;
};

// TODO:
// 1. put this in a wallet api file
// 2. use BCS transaction
const processTransaction = async (
  transactionPayload: Types.TransactionPayload,
): Promise<VoteResponse> => {
  const responseOnFailure = {
    succeeded: false,
    message: "Unknown Error",
  };

  try {
    const response = await window.aptos.signAndSubmitTransaction(
      transactionPayload,
    );
    if ("hash" in response) {
      return {
        succeeded: true,
        transactionHash: response["hash"],
      };
    }
  } catch (error: any) {
    if (typeof error == "object" && "message" in error) {
      responseOnFailure.message = error.message;
    }
  }
  return responseOnFailure;
};

// TODO: confirmation modal
const useSubmitVote = (proposalId: string) => {
  const [voteResponse, setVoteResponse] = useState<VoteResponse | null>(null);

  async function submitVote(shouldPass: boolean, ownerAccountAddr: string) {
    const payload: Types.TransactionPayload = {
      type: "script_function_payload",
      function: "0x1::aptos_governance::vote",
      type_arguments: [],
      arguments: [ownerAccountAddr, proposalId, shouldPass],
    };

    await processTransaction(payload).then(setVoteResponse);
  }

  function clearVoteResponse() {
    setVoteResponse(null);
  }

  return {submitVote, voteResponse, clearVoteResponse};
};

export default useSubmitVote;
