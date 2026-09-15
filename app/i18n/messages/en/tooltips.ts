export const tooltips = {
  accumulatorRootHash:
    "An accumulator root hash is the root hash of a Merkle accumulator.",
  authenticationKey:
    "The authentication key is a hash of the public key for an account",
  keyType:
    "Authentication scheme inferred from the latest transaction submitted by this account. For MultiKey accounts the constituent sub-key types are listed in order.",
  blockHeight: "The block height is the number block in the blockchain.",
  epoch:
    "The period of time between validator set changes and other administrative actions.",
  eventRootHash:
    "Hash of the merkle tree root of the events emitted in the block.",
  expirationTimestampSecs:
    "A transaction ceases to be valid after its expiration time.",
  feePayer:
    "Account that paid for the gas fee of the transaction, separate of the sender.",
  function: "Move function executed in the transaction.",
  encryptedPayload:
    "This transaction was submitted with an encrypted mempool payload (AIP-144). The explorer shows the decrypted entry function only when the fullnode has already decrypted it; ciphertext is never decrypted in the browser.",
  arguments:
    "Type and function arguments passed to the entry function. Includes a copyable CLI command.",
  gasFee: "The gas fee is the network's cost to run the transaction.",
  gasUnitPrice:
    "Gas unit price is the amount the user is willing to pay for the transaction per gas unit.",
  gasUsed: "The total number of gas units used in the transaction.",
  maxGasAmount:
    "The Maximum Gas Amount of a transaction is the maximum amount of gas units the sender is willing to pay for the transaction.",
  round:
    "A round consists of achieving consensus on a block of transactions and their execution results.",
  sender: "Sender is the address of the originator account for a transaction.",
  sequenceNumber:
    "The sequence number for an account indicates the number of transactions that have been submitted and committed on chain from that account.",
  replayProtectionNonce:
    "The replay protection nonce is a number that prevents replay attacks by ensuring that a transaction can only be executed once in a 60 second period.",
  timestamp:
    "Timestamp is the machine timestamp of when leader creates and proposes a block for consensus.",
  version: "A version is also called “height” in blockchain literature.",
  vmStatus: "Learn more about VM",
  coinVerificationIntro:
    "The explorer uses the [Panora token list](https://github.com/PanoraExchange/Aptos-Tokens) to verify authenticity of known assets on-chain. It does not guarantee anything else about the asset and is not financial advice. The following levels of verification are below:",
  transferRef:
    "A TransferRef allows the holder to transfer the object even when ungated transfer is disabled. Can only be created during object construction.",
  deleteRef:
    "A DeleteRef allows the holder to delete the object. Can only be created during object construction.",
  extendRef:
    "An ExtendRef allows the holder to generate a signer for the object, enabling adding new resources. Can only be created during object construction.",
  creationTransaction:
    "The transaction in which this object was first created.",
  owner: "The current owner of the object.",
  allowUngatedTransfer:
    "Whether the object can be transferred by anyone without requiring a TransferRef.",
  transactionTypes: "Transaction Types",
  depositStatus: "Deposit Status",
  lastEpochPerformance: "Last Epoch Performance",
  rewardsPerformance: "Rewards Performance",
  smartContract: "Smart Contract",
  receiver: "Receiver",
  functionFilter:
    "Filter transactions by entry function fields (press Enter or Tab to apply each field)",
  bytecodeFormat:
    "Highest Move module bytecode format enabled via VM Binary Format feature flags on chain",
  networkUnreachable: "Network unreachable — value unknown",
  openOnGithub: "Open on GitHub",
  rewardsPerformanceBody1:
    "The Rewards Performance column shows the rewards percent of a validator based upon proposal success.",
  rewardsPerformanceBody2:
    "It is calculated as a % of reward earned by the validator out of the maximum reward earning opportunity:",
  rewardsPerformanceFormula:
    "(rewards earned across the epochs) / (maximum reward opportunity across the epochs)",
  rewardsPerformanceBody3:
    "This is a cumulative metric across all epochs. Validators can improve their performance by improving their proposal success rate.",
  lastEpochPerformanceBody1:
    "The Last Epoch Performance column shows the performance of a validator in the most recent epoch.",
  lastEpochPerformanceBody2: "It is calculated as:",
  lastEpochPerformanceFormula:
    "(number of successful proposals) / (number of total proposal opportunities)",
  lastEpochPerformanceBody3:
    "This metric gives you an early indicator if performance is degrading.",
} as const;
