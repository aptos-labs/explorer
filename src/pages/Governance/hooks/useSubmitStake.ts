import {BCS, TxnBuilderTypes} from "aptos";
import {useState} from "react";
import {signAndSubmitTransaction} from "../../../api/wallet";

export type StakeResponse = StakeResponseOnSuccess | StakeResponseOnFailure;

export type StakeResponseOnSuccess = {
  succeeded: boolean;
  transactionHash: string;
};

export type StakeResponseOnFailure = {
  succeeded: boolean;
  message: string;
};

const useSubmitStake = () => {
  const [stakeResponse, setStakeResponse] = useState<StakeResponse | null>(
    null,
  );

  async function submitStake(
    stakingAmount: number,
    operatorAddr: string,
    voterAddr: string,
  ) {
    const payload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
      TxnBuilderTypes.ScriptFunction.natural(
        "0x1::stake",
        "initialize_owner_only",
        [],
        [
          BCS.bcsSerializeUint64(stakingAmount),
          BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(operatorAddr)),
          BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(voterAddr)),
        ],
      ),
    );

    await signAndSubmitTransaction(payload).then(setStakeResponse);
  }

  function clearStakeResponse() {
    setStakeResponse(null);
  }

  return {submitStake, stakeResponse, clearStakeResponse};
};

export default useSubmitStake;
