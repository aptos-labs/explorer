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

export type BulkOrderLeg = {
  price: string;
  size: string;
};

export type DecibelBulkOrderDetail = {
  market: string;
  subaccount: string | undefined;
  sequenceNumber: string | undefined;
  bids: BulkOrderLeg[];
  asks: BulkOrderLeg[];
  builderAddress: string | undefined;
  builderFees: string | undefined;
};

export type DecibelBulkOrderPlacedEvent = {
  market: string;
  orderId: string;
  user: string;
  sequenceNumber: string;
  previousSeqNum: string | undefined;
  bids: BulkOrderLeg[];
  asks: BulkOrderLeg[];
  cancelledBids: BulkOrderLeg[];
  cancelledAsks: BulkOrderLeg[];
};

export type DecibelBulkOrderFilledEvent = {
  market: string;
  orderId: string;
  user: string;
  fillId: string;
  side: "buy" | "sell";
  price: string;
  origPrice: string | undefined;
  filledSize: string;
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
  bulkOrderDetail: DecibelBulkOrderDetail | undefined;
  bulkOrderPlacedEvents: DecibelBulkOrderPlacedEvent[];
  bulkOrderFilledEvents: DecibelBulkOrderFilledEvent[];
};
