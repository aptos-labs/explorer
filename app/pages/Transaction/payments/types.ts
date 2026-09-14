/**
 * Payment identification for the transaction Payments tab (FEAT-TXN-016).
 *
 * Default analysis uses the REST transaction body (payload, events, write-set)
 * plus indexer FA activities already fetched for Balance Change — no extra
 * fullnode round-trips. A future `client_trace` source can walk nested Move
 * calls in the browser; that is intentionally disabled because it would
 * multiply REST/view traffic per transaction.
 */

export type PaymentFlowSource = "transaction_body" | "client_trace";

export type PaymentKind =
  | "p2p"
  | "controlled"
  | "confidential"
  | "confidential_to_public"
  | "public_to_confidential"
  | "exchange";

export type PaymentAmountVisibility = "public" | "encrypted";

export type PaymentAmount = {
  visibility: PaymentAmountVisibility;
  assetId: string;
  symbol: string;
  decimals: number;
  /** Present only when `visibility` is `public`. */
  raw?: string;
  /**
   * True when the connected wallet is sender or recipient of an encrypted
   * confidential amount. Ciphertexts are still not decrypted.
   */
  involvesConnectedWallet?: boolean;
};

export type PaymentStep = {
  id: string;
  kind: PaymentKind;
  title: string;
  explanation: string;
  from?: string;
  to?: string;
  /** Intermediary: auditor, dispatchable/TransferRef module, or hop address. */
  partner?: string;
  partnerLabel?: string;
  amount?: PaymentAmount;
  amountOut?: PaymentAmount;
  /** Same-asset skim when withdraw amount exceeds deposit (partner/protocol fee). */
  partnerFee?: PaymentAmount;
};

export type PaymentFeeKind =
  | "gas"
  | "execution"
  | "io"
  | "storage"
  | "storage_refund"
  | "partner"
  | "net";

export type PaymentFeeLine = {
  id: string;
  kind: PaymentFeeKind;
  label: string;
  explanation: string;
  amountOctas: string;
  payer?: string;
};

export type PaymentFlowNodeRole =
  | "account"
  | "partner"
  | "confidential_store"
  | "exchange"
  | "network";

export type PaymentFlowNode = {
  id: string;
  label: string;
  role: PaymentFlowNodeRole;
  address?: string;
};

export type PaymentFlowEdge = {
  from: string;
  to: string;
  label: string;
  kind: PaymentKind | "fee";
};

export type PaymentFlowGraph = {
  nodes: PaymentFlowNode[];
  edges: PaymentFlowEdge[];
};

export type PaymentPrimaryKind = PaymentKind | "fees_only" | "none";

export type PaymentIdentification = {
  source: PaymentFlowSource;
  /**
   * Always false today. Reserved so a client-side call-graph tracker can
   * advertise itself without changing the Payments tab contract.
   */
  clientTraceAvailable: boolean;
  success: boolean;
  headline: string;
  explanation: string;
  primaryKind: PaymentPrimaryKind;
  involvesConnectedWallet: boolean;
  steps: PaymentStep[];
  fees: PaymentFeeLine[];
  flow: PaymentFlowGraph;
};

export type IdentifyPaymentsInput = {
  transaction: import("~/types/aptos").Types.Transaction;
  connectedWallet?: string | null;
  indexerActivities?: import("../utils").FungibleAssetActivity[];
  coinData?: import("../../../api/hooks/useGetCoinList").CoinDescription[];
  source?: PaymentFlowSource;
};
