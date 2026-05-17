import {Network} from "@aptos-labs/ts-sdk";

export const DECIBEL_MAINNET_CONTRACT =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

export const DECIBEL_TESTNET_CONTRACT =
  "0xe7da2794b1d8af76532ed95f38bfdf1136abfd8ea3a240189971988a83101b7f";

export const DECIBEL_CONTRACTS = [
  DECIBEL_MAINNET_CONTRACT,
  DECIBEL_TESTNET_CONTRACT,
] as const;

/**
 * Returns the deployed Decibel contract address for the given network, or
 * `undefined` when Decibel is not deployed there. Used by features that target
 * a specific deployment (such as the account Portfolio tab) instead of trying
 * each contract in turn.
 */
export function getDecibelContractForNetwork(
  networkName: string,
): string | undefined {
  if (networkName === Network.MAINNET) return DECIBEL_MAINNET_CONTRACT;
  if (networkName === Network.TESTNET) return DECIBEL_TESTNET_CONTRACT;
  return undefined;
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  limit: "Limit Order",
  market: "Market Order",
  cancel: "Cancel Order",
  bulk: "Bulk Orders",
  twap: "TWAP Order",
};
