import {TxnBuilderTypes, Types} from "aptos";
import {VoteResponse} from "../pages/Governance/hooks/useSubmitVote";

export const getAptosWallet = (): boolean => {
  return "aptos" in window;
};

export const isWalletConnected = async (): Promise<boolean> => {
  try {
    if (window.aptos && (await window.aptos.isConnected())) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const connectToWallet = async (): Promise<boolean> => {
  try {
    const result = await window.aptos.connect();
    if ("address" in result) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const getAccountAddress: () => Promise<string | null> = async () => {
  try {
    const data = await window.aptos.account();
    if ("address" in data) return data.address;
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const isUpdatedVersion = (): boolean =>
  window.aptos?.on instanceof Function;

export const signAndSubmitTransaction = async (
  transactionPayload: TxnBuilderTypes.TransactionPayloadScriptFunction,
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
