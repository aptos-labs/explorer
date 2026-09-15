export const payments = {
  kind: {
    p2p: "Peer-to-peer",
    p2pTransfer: "Peer-to-peer transfer",
    controlled: "Controlled (partner)",
    controlledTransfer: "Controlled transfer through a partner",
    confidential: "Confidential",
    confidentialToPublic: "Confidential → public",
    publicToConfidential: "Public → confidential",
    exchange: "Exchange",
    feesOnly: "Fees only",
    none: "No payment",
  },
  partner: {
    default: "Partner",
    transferRef: "TransferRef / dispatchable partner",
    module: "partner module",
    intermediary: "intermediary",
  },
  amountEncrypted: "Amount encrypted",
  ciphertextNote: "{amount} — ciphertext is not decrypted in the explorer.",
  partnerFee: "Partner / protocol fee: {amount}",
  identifiedFromBody:
    "Identified from this transaction body (events, payload, write-set). No extra API calls.",
  step: "Step {n}",
  from: "From",
  to: "To",
  amount: "Amount",
  exchangeInput: "Exchange input",
  exchangeOutput: "Exchange output",
  fees: "Fees",
  feesAria: "Payment fees",
  feesIntro:
    "Every user transaction pays network fees in APT. Storage refunds reduce the net cost. Partner or protocol skims (if any) are listed separately from gas.",
  netNetworkFee: "Net network fee",
  paidBy: "Paid by",
  feeBreakdown: "Fee breakdown",
  userOnly: "Payments are identified for user transactions.",
  involvesWallet: "Involves your connected wallet",
  walletNotParty: "Your wallet is not a party",
  connectToHighlight: "Connect a wallet to highlight your payments",
  txnFailed: "Transaction failed",
  noneAlert:
    "Nothing here looks like a payment. Check Events and Balance Change for raw activity.",
  howTitle: "How payments are identified",
  howBody:
    "This tab reads the transaction payload, events, write-set, and the indexer fungible-asset activities already used by Balance Change. It does not walk nested Move calls, so it does not issue extra REST or view requests.",
  howFuture:
    "A future client-side call-graph tracker could reconstruct deeper hops in the browser. That path is disabled ({reason}).",
  confidentialNote:
    "Confidential transfer amounts stay encrypted unless they were deposited or withdrawn as plaintext. Connecting a wallet highlights whether you are a party; it does not decrypt ciphertexts.",
  flowTitle: "Payment flow",
  flowIntro:
    "Each arrow is one step in this transaction. Copy the Mermaid source if you want the same diagram in docs or another renderer.",
  flowAria: "Payment flow diagram",
  mermaidSource: "Mermaid source",
  copyMermaid: "Copy Mermaid",
  copyMermaidAria: "Copy Mermaid source",
  mermaidAria: "Mermaid source",
  fee: {
    execution: "Execution (compute)",
    executionTip:
      "Gas charged for Move execution. Shown in octas at this transaction's gas unit price.",
    io: "I/O (storage access)",
    ioTip:
      "Gas charged for reading and writing on-chain state during execution.",
    storage: "Storage fee",
    storageTip:
      "Charged for net new state created by this transaction, priced in octas (not gas units).",
    storageRefund: "Storage fee refund",
    storageRefundTip:
      "Credited when this transaction released state. Subtracted from the net fee; not part of gas_used.",
    net: "Net network fee",
    gas: "Gas fee",
    gasTip:
      "gas_used × gas_unit_price. No FeeStatement event was present to split execution, I/O, and storage.",
    partner: "Partner / protocol fee ({symbol})",
    partnerTip:
      "Difference between the amount withdrawn and the amount deposited for this asset — typically a transfer hook, DEX protocol fee, or partner skim.",
  },
} as const;

export const payload = {
  encryptedTxn: "Encrypted transaction",
  encryptionEpoch: "Encryption epoch: {epoch}",
  claimedEntry: "Claimed entry function: {fn}",
  failureReason: "Failure reason: {reason}",
  decryptedPayload: "Decrypted payload",
  encryptedPayload: "Encrypted payload",
  decrypted: "Decrypted",
  decryptionFailed: "Decryption failed",
  encrypted: "Encrypted",
  epochChip: "Epoch {epoch}",
  cliCommand: "CLI Command",
  name: "Name",
  constraint: "Constraint",
  value: "Value",
  functionArguments: "Function Arguments",
} as const;

export const txnModules = {
  packagePublish: "Package publish",
  codeAddress: "Code address",
  kind: "Kind",
  upgrade: "Upgrade",
  newPublish: "New publish",
  bytecodeChanges: "Module bytecode changes",
  change: "Change",
  address: "Address",
  module: "Module",
  explorer: "Explorer",
  write: "Write",
  delete: "Delete",
} as const;

export const activity = {
  type: "Activity Type",
  all: "All",
  deposit: "Deposit",
  withdraw: "Withdraw",
  mint: "Mint",
  burn: "Burn",
  gasFee: "Gas Fee",
  freeze: "Freeze",
  transfer: "Transfer",
} as const;

export const snackbar = {
  closeAria: "close",
  transaction: "Transaction",
  failed: "failed",
  failedWith: 'with "{status}"',
  failedPeriod: ".",
  failedWithMessage: 'Failed with error message "{message}". Please try again.',
} as const;

export const hexBytes = {
  copied: "Copied!",
  copyFull: "Copy full value",
  copyAria: "Copy hex bytes",
} as const;
