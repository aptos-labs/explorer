export type DecibelOrder = {
  orderType: "limit" | "market" | "cancel" | "bulk" | "twap";
  side: "buy" | "sell" | undefined;
  market: string;
  size: string | undefined;
  price: string | undefined;
  status: string | undefined;
  timeInForce: string | undefined;
  orderId: string | undefined;
  subaccount: string | undefined;
};

export type DecibelDeposit = {
  asset: string;
  amount: string;
  subaccount: string;
  functionName: string;
};

export type DecibelWithdraw = {
  asset: string;
  amount: string;
  subaccount: string;
  functionName: string;
};

export type DecibelTransactionSummary = {
  orders: DecibelOrder[];
  deposits: DecibelDeposit[];
  withdrawals: DecibelWithdraw[];
};
