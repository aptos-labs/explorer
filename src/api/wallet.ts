import {TxnBuilderTypes} from "aptos";
import {WalletNetworks} from "../context/wallet/context";

import {
  TransactionResponse,
  TransactionResponseOnFailure,
} from "./hooks/useSubmitTransaction";

export const getAptosWallet = (): boolean => {
  return "aptos" in window;
};

export const isWalletConnected = async (): Promise<boolean> => {
  try {
    if (await window.aptos?.isConnected?.()) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const isAccountCreated = async (): Promise<boolean> => {
  try {
    const res = await window.aptos?.isConnected?.();
    // if there is an account we are getting a true/false response else we are getting an object type response
    return typeof res === "boolean";
  } catch (error: any) {
    console.log(error);
  }
  return false;
};

export const connectToWallet = async (): Promise<boolean> => {
  try {
    const result = await window.aptos?.connect?.();
    if ("address" in result) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
};

export const getAccountAddress: () => Promise<string | null> = async () => {
  try {
    const data = await window.aptos?.account?.();
    if ("address" in data) return data.address;
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const getWalletNetwork: () => Promise<WalletNetworks> = async () => {
  try {
    return await window.aptos?.network?.();
  } catch (error) {
    console.log(error);
  }
  return "Devnet"; // default wallet network
};

export const isUpdatedVersion = (): boolean =>
  window.aptos?.on instanceof Function;

export const signAndSubmitTransaction = async (
  transactionPayload: TxnBuilderTypes.TransactionPayloadScriptFunction,
): Promise<TransactionResponse> => {
  const responseOnFailure: TransactionResponseOnFailure = {
    succeeded: false,
    message: "Unknown Error",
  };

  try {
    const response = await window.aptos?.signAndSubmitTransaction?.(
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
