import {BCS, TxnBuilderTypes} from "aptos";
import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";

const useSubmitVote = () => {
  const {submitTransaction, transactionResponse, clearTransactionResponse} =
    useSubmitTransaction();

  async function submitVote(
    proposalId: number,
    shouldPass: boolean,
    ownerAccountAddr: string,
  ) {
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

    await submitTransaction(payload);
  }

  return {submitVote, transactionResponse, clearTransactionResponse};
};

export default useSubmitVote;
