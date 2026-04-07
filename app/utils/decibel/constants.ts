export const DECIBEL_CONTRACTS = [
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06", // mainnet
  "0xe7da2794b1d8af76532ed95f38bfdf1136abfd8ea3a240189971988a83101b7f", // testnet
] as const;

export const ORDER_TYPE_LABELS: Record<string, string> = {
  limit: "Limit Order",
  market: "Market Order",
  cancel: "Cancel Order",
  bulk: "Bulk Orders",
  twap: "TWAP Order",
};
