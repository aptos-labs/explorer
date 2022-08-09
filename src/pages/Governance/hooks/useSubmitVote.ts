import {BCS, TxnBuilderTypes} from "aptos";
import {useState} from "react";
import {signAndSubmitTransaction} from "../../../api/wallet";

export type VoteResponse = VoteResponseOnSuccess | VoteResponseOnFailure;

export type VoteResponseOnSuccess = {
  succeeded: boolean;
  transactionHash: string;
};

export type VoteResponseOnFailure = {
  succeeded: boolean;
  message: string;
};

// TODO: confirmation modal
const useSubmitVote = (proposalId: number) => {
  const [voteResponse, setVoteResponse] = useState<VoteResponse | null>(null);

  async function submitVote(shouldPass: boolean, ownerAccountAddr: string) {
    let serializer = new BCS.Serializer();
    serializer.serializeBool(shouldPass);
    const payload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
      TxnBuilderTypes.ScriptFunction.natural(
        "0x1::aptos_governance",
        "vote",
        [],
        [
          BCS.bcsToBytes(
            TxnBuilderTypes.AccountAddress.fromHex(ownerAccountAddr),
          ),
          BCS.bcsSerializeUint64(proposalId),
          serializer.getBytes(),
        ],
      ),
    );

    await signAndSubmitTransaction(payload).then(setVoteResponse);
  }

  function clearVoteResponse() {
    setVoteResponse(null);
  }

  return {submitVote, voteResponse, clearVoteResponse};
};

export default useSubmitVote;
