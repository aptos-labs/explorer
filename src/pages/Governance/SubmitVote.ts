import {AptosClient, AptosAccount, HexString, Types} from "aptos";
import {useGlobalState} from "../../GlobalState";
import {doTransaction} from "../utils";

// TODO: replace the following hard code data with account info from the wallet connected
const TEST_ACCOUNT_ADDRESS =
  "c1bc62cb0e142a8fcfdcd01ce2a9f5b01355fba73290768f62069fa6902e1585";
const TEST_ACCOUNT_SECRET_KEY =
  "0x894e620e2e96748118f448388ac4877bb3799be5233426e869a97e2ffcd91381";

const useSubmitVote = (proposalId: string) => {
  const [state, _] = useGlobalState();

  function submitVote(shouldPass: boolean, ownerAccountAddr: string) {
    // TODO: submit vote with ownerAccountAddr

    const client = new AptosClient(state.network_value);
    const address = HexString.ensure(TEST_ACCOUNT_ADDRESS);
    const secretKey = HexString.ensure(TEST_ACCOUNT_SECRET_KEY);
    const account = new AptosAccount(secretKey.toUint8Array(), address);

    const payload: Types.TransactionPayload = {
      type: "script_function_payload",
      function: "0x1::aptos_governance::vote",
      type_arguments: [],
      arguments: [account.address().hex(), proposalId, shouldPass],
    };

    doTransaction(account, client, payload);
  }

  return [submitVote];
};

export default useSubmitVote;
