import {AptosClient, AptosAccount, HexString, Types} from "aptos";
import {useGlobalState} from "../../GlobalState";
import {useWalletContext} from "../../context/wallet/context";

// TODO: replace the following hard code data with account info from the wallet connected
// const TEST_ACCOUNT_ADDRESS =
//   "36e40636e4a15f268330759cd393b6e3dff8fa83c9352440feae27a1c88ff9ac";
// const TEST_ACCOUNT_SECRET_KEY =
//   "0x653a79408af9e7b5786fca669bd6a7af2ff8cc4fd866afd10f3669d8ad667e77";

  // export async function doTransactionnnn(
  //   account: AptosAccount,
  //   client: AptosClient,
  //   payload: any,
  // ) {
  //   const txnRequest = await client.generateTransaction(
  //     account.address(),
  //     payload,
  //   );
  //   const signedTxn = await client.signTransaction(account, txnRequest);
  //   const transactionRes = await client.submitTransaction(signedTxn);
  //   await client.waitForTransaction(transactionRes.hash);
  //   return transactionRes;
  // }

const useSubmitVote = (proposalId: string) => {
  const [state, _] = useGlobalState();
  const {
    isConnected, 
    accountAddress, 
    processTransaction
  } = useWalletContext();

  function submitVote(shouldPass: boolean, ownerAccountAddr: string) {
    // TODO: submit vote with ownerAccountAddr

    // const client = new AptosClient(state.network_value);
    // const address = HexString.ensure(TEST_ACCOUNT_ADDRESS);
    // const secretKey = HexString.ensure(TEST_ACCOUNT_SECRET_KEY);
    // const account = new AptosAccount(secretKey.toUint8Array(), address);

    // console.log(account.address().hex());
    // console.log(accountAddress);

    const payload: Types.TransactionPayload = {
      type: "script_function_payload",
      function: "0x1::aptos_governance::vote",
      type_arguments: [],
      arguments: [        
        accountAddress, // ownerAccountAddr,
        proposalId, 
        shouldPass
      ],
    };

    processTransaction(payload);

    // doTransactionnnn(account, client, payload);
  }

  return [submitVote];
};

export default useSubmitVote;
