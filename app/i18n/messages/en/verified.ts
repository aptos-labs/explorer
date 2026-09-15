export const verified = {
  level: {
    native: "Native",
    labs: "Verified",
    community: "Community Verified",
    recognized: "Recognized",
    unverified: "Unverified",
    labsBanned: "Banned",
    communityBanned: "Community Banned",
    disabled: "No Verification",
  },
  tooltip: {
    native: "This asset is verified as a native token of Aptos.",
    labs: "This asset is verified by the builders of the explorer.",
    labsReason:
      "This asset is verified by the builders of the explorer. Reason: ({reason})",
    community:
      "This asset is verified by the community on the Panora token list.",
    recognized:
      "This asset is recognized, but many not have been verified by the community.",
    unverified:
      "This asset is not verified, it may or may not be recognized by the community.  Please use with caution.",
    communityBanned:
      "This asset has been banned on the Panora token list, please avoid using this asset.",
    labsBanned:
      "This asset has been marked as a scam or dangerous, please avoid using this asset.",
    labsBannedReason:
      "This asset has been marked as a scam or dangerous, please avoid using this asset. Reason: ({reason})",
    disabled: "Verification disabled for non-Mainnet",
    disabledReason: "Verification disabled for non-Mainnet Reason: ({reason})",
  },
  banner: {
    nativeTitle: "Native Token",
    labsTitle: "Verified by Aptos Labs",
    communityTitle: "Community Verified",
    nativeBody: "This is a native token of the Aptos blockchain.",
    labsBody: "This asset has been verified by the Aptos Explorer team.",
    communityBody: "This asset is verified on the Panora community token list.",
    recognizedTitle: "This asset is recognized but not fully verified",
    unverifiedTitle: "This asset is not verified",
    recognizedBody:
      "This token appears in the Panora token list but has not been fully verified. Get verified to build trust with users.",
    unverifiedBody:
      "This token has not been verified by the community or Aptos Labs. Verify your token to build trust and visibility.",
    getVerified: "Get Verified",
  },
} as const;

export const staking = {
  zeroCommissionOne:
    "You have {count} staking pool with 0% commission. You will not earn rewards from this pool. Consider withdrawing your funds.",
  zeroCommissionMany:
    "You have {count} staking pools with 0% commission. You will not earn rewards from these pools. Consider withdrawing your funds.",
  rewardsAprTip:
    "Represents the Annual Percentage Rate (APR) that accrue on staked APT. Rewards are paid out by the network after each Epoch. APR is subject to change based on validator performance or in accordance with network specifications. There is no guarantee that the current APR will continue to apply in future periods.",
  aptStaked: "APT Staked",
  aprReward: "{rate}% APR Reward",
  stakeFeeTip:
    "Refundable stake fee, that will be deducted from the current staking amount, to be returned to delegator after the current epoch ends.",
  commission100:
    "The commission rate for this pool is 100%, you will not receive rewards.",
  stakeMinMax:
    "Minimum stake amount is {min} APT and maximum stake amount is {max} APT",
  researchFull:
    "Please do your own research. Aptos Labs is not responsible for the performance of the validator nodes displayed here, or the security of your funds",
  researchShort:
    "Please do your own research. Aptos Labs is not responsible for the security of your funds",
  stakeIntoPool: "Stake Into The Pool",
  unstakeFunds: "Unstake Funds",
  restakeFunds: "Restake Funds",
  withdrawFunds: "Withdraw Your Funds",
  deposit: "Deposit",
  min: "MIN",
  max: "MAX",
  suggestedMax: "SUGGESTED MAX",
  congratulations: "Congratulations!",
  txnAddress: "Transaction Address",
  viewTransaction: "View Transaction",
  unlockedAmount: "You've successfully unlocked **{amount}** APT",
  withdrawnAmount: "You've successfully withdrawn **{amount}** APT",
  txnInProgress: "Transaction is in progress.",
  soonDeposit:
    "Soon you will see your deposit of **{amount}** APT in the staking pool.",
  connectTitle: "Please connect your wallet",
  connectBody: "You need to connect your wallet to be able to stake",
  enterAmount: "Enter Amount",
  balancePlaceholder: "Your balance: {balance}",
  inProgress: "In Progress",
  amountUpper: "AMOUNT",
  statusUpper: "STATUS",
  rewardEarnedUpper: "REWARD EARNED",
  actionsUpper: "ACTIONS",
  myDeposits: "My Deposits",
  myDepositsAria: "My deposits",
  amountTip:
    "Estimated current total amount including principals and rewards earned",
  rewardEarnedTip: "Estimated rewards earned in the current staking status",
  depositStatus: "Deposit Status",
  delegatedStakeAmount: "Delegated Stake Amount",
  delegatedStakeTip: "The total amount of delegated stake in this stake pool",
  ofNetwork: "Of Network",
  rewardsEarnedSoFar: "Rewards Earned So Far",
  rewardsEarnedTip: "Amount of rewards earned by this stake pool to date",
  stake: "Stake",
  cannotStakeMin:
    "You can't stake because minimum 11 APT requirement is not met",
  opDisabled: "You can't {op} because minimum APT requirement is not met",
  minStake11: "Minimum stake amount is 11 APT.",
  unlockAll:
    "If you unlock {amount} APT, your total staked amount {staked} APT will be unlocked.",
  unlockMin: "If you unlock {amount} APT, {min} APT will be unlocked.",
  restakeAll:
    "If you restake {amount} APT, your total unlocked amount {unlocked} APT will be restaked.",
  restakeMin: "If you restake {amount} APT, {min} APT will be restaked.",
  operatorCountTip:
    "Number of owner accounts who have delegated stake to this stake pool + reward account(s)",
  commissionTip: "% of staking reward paid out to operator as commission",
  nextUnlockTip:
    "When tokens will be available for removal from the stake pool",
  invalidAddress: "Invalid validator address.",
  op: {
    stake: "STAKE",
    unstake: "UNSTAKE",
    restake: "RESTAKE",
    withdraw: "WITHDRAW",
  },
  status: {
    staked: "Staked",
    stakedTip:
      "You are getting rewards for the staked deposit, not able to withdraw it until the lock period ends. But you can initiate this process with an unstake option.",
    withdrawPending: "Withdraw pending",
    withdrawPendingTip:
      "If you decided to unstake your deposit, it will be locked till the end of the lock period. Your deposit is still earning rewards.",
    withdrawReady: "Withdraw ready",
    withdrawReadyTip:
      "After the end of the lock period you will be able to withdraw your funds to your wallet.",
    pendingActive: "Pending Active",
    active: "Active",
    pendingInactive: "Pending Inactive",
    inactive: "Inactive",
  },
  faq: {
    title: "Delegated Staking FAQ",
    learnMore: "Learn more about staking",
    staking: "Staking",
    rewards: "Rewards",
    validators: "Validators",
    whatIsQ: "What is delegated staking?",
    whatIsA1:
      "As an APT holder, you can 'delegate' your APT to a delegation pool. The total delegation pool is an aggregation of staked APT from various token owners, and collectively staked. Aptos is a proof-of-stake network, which means that tokens are staked to [validators](#validators-section) in order to keep the network healthy.",
    whatIsA2:
      "When you delegate stake, you own the tokens and earn [rewards](#rewards-section) on top of the staked amount. At no point does the validator have any access to your tokens as they remain securely in your control. The delegation smart contract has undergone security audit and thorough testing before launch.",
    anyoneQ: "Can anyone stake APT?",
    anyoneA: "Yes, anyone can stake APT.",
    minQ: "Is there a minimum stake?",
    minA: "11 APT is the required minimum amount to stake. A refundable stake fee is deducted from the stake amount and returned at the end of the epoch.",
    howQ: "How can I stake APT?",
    howA1:
      "You can stake APT directly by going to the [Explorer](/validators/delegation) page and connecting your wallet. If you are using the Petra wallet, you should see the following flow:",
    howSteps: [
      "Visit Explorer’s validators page and select the delegations node that you’d like to stake your APTs to.",
      "In the validator detail page, click “Stake” to starting staking APT with this validator.",
      "If you haven’t connected the wallet, you will be prompted to connect your Petra wallet first. Once you connect your wallet, you may start staking your APT through the stake dialog and approve transactions in your wallet.",
    ],
    howA2:
      "Congratulations! You have successfully staked APT on Explorer! You can also stake APT directly to a validator node through the [CLI](https://aptos.dev/en/network/nodes/validator-node/connect-nodes/delegation-pool-operations#perform-delegation-pool-operations).",
    unstakeQ: "Can I unstake my APT anytime?",
    unstakeA:
      "You can unstake your APT at any time, but the funds will not be available until the next validator unlock date. The validator unlock period is 14 days, but the timing follows from when the delegation pool is initiated. Depending on when in the cycle you choose to unstake your APT, it could be as little as a few hours, or up to 14 days from whence you can withdraw your tokens. I.e. if you unstake 10 days into the 14 day cycle, you have to wait 4 days. If you unstake 8 days into the 14 day cycle, you have to wait 6 days. If you unstaked your tokens, and the unlock date has passed, you will be able to withdraw the tokens.",
    withdrawQ: "When can I withdraw funds?",
    withdrawA1:
      "There are two actions that you need to take: unstake and withdraw.",
    withdrawA2:
      "You can withdraw unstaked APT at any time as long as it is unlocked. If you have staked APT, you will have to unstake first and wait for the funds to become unlocked. At that point in time, you can then withdraw it.",
    withdrawA3: "You can see the unlock date in the dashboard.",
    statusQ:
      "What do these statuses mean? (Staked, Withdraw Pending, Withdraw Ready)",
    statusA1:
      "Staked means the tokens are currently staked and locked up. These cannot be withdrawn until you have completed unstaking.",
    statusA2:
      "**Withdraw Pending** means you have initiated unstaking those tokens, but they are still locked up and you have to wait for the next unlock date. These funds cannot be withdrawn until then. You can check the unlock date for your node by clicking on the node’s detailed page.",
    statusA3:
      "**Withdraw Ready** means you can withdraw funds. When you unstake, all previously Withdraw Pending funds will be withdrawn.",
    feeQ: "What is the add stake fee?",
    feeA: "You may see that the amount you have staked is less than the total stake you added. This is because you don’t start earning rewards until the next epoch starts. This fee is returned at the end of the current epoch.",
    earnQ: "How can I earn rewards by staking APT?",
    earnA:
      "You can earn rewards based on the amount of APT you have staked. Your node operator takes a commission, so the rewards you accrue will be net of that.",
    commissionQ: "Can the operator change their commission rate?",
    commissionA:
      "Commission rates are now subject to change by the operator. The new rate takes effect at the end of the lockup cycle. This period allows stakers to assess the new commission rate. If stakers are not in favor of the upcoming change, they have the full 7.5-day window to unstake their assets before the new rate takes effect.",
    expectQ: "How much can I expect to earn?",
    expectA:
      "The rewards you earn are calculated based on the amount of APT you have staked multiplied by the current annual rewards rate and the validator rewards performance minus the operator’s commission rate.",
    startQ: "When do I start earning rewards?",
    startA:
      "You will start earning rewards at the beginning of the next epoch. Epochs are the rewards cycle, and are currently 2 hours.",
    seeQ: "How can I see how much rewards I’ve earned?",
    seeA: "You can view the amount of rewards earned by going to the individual validator page.",
    validatorQ: "What is a validator?",
    validatorA:
      "Validator nodes confirm transactions by proposing and executing blocks on the network. The stake that they hold helps to prove that they are trusted to vote on transactions. Learn more about [how the Aptos blockchain works](https://aptos.dev/en/network/blockchain/blockchain-deep-dive#consensus).",
    chooseQ: "How do I choose a validator to stake with?",
    chooseA1:
      "You can choose from the leaderboard on the explorer page which shows the details of the validator’s performance.",
    chooseA2:
      "Validators start earning rewards when the delegation pool has at least 1M APT. Only active validators will earn rewards.",
    chooseA3:
      "However, please do your own research, Aptos labs is not responsible for the veracity of the information displayed, nor responsible for the security of your funds, past or future performance of the validator node.",
    perfQ: "How is validator performance measured?",
    perfA: "Please see the definitions highlighted under the columns!",
  },
  commissionChange:
    "Commission rates are now subject to change by the operator",
  commissionUpdate:
    "The current commission rate is {current}%. The commission rate will be updated to {next}% at the current lockup period.",
} as const;

export const analytics = {
  deployedContracts: "Deployed Contracts",
  deployedContractsTip: "Daily count of move modules.",
  contractDeployers: "Contract Deployers",
  contractDeployersTip: "Daily distinct count of addresses with move modules.",
  medianBlockTime: "Median Block Time",
  medianBlockTimeTip:
    "P50 block time (gap between blocks) in milliseconds over 1 day. Changes based on network latency between validators and blockchain congestion (more txn per block vs faster blocks).",
  avgGasUnitPrice: "Average Gas Unit Price",
  avgGasUnitPriceTip: "Daily average gas unit price on user transactions.",
  dailyActiveAccounts: "Daily Active Accounts",
  dailyActiveAccountsTip:
    "Daily count of distinct addresses with signed transactions.",
  newAccounts: "New Accounts Created",
  newAccountsTip:
    "Daily instances of distinct addresses signing transactions for the first time or account resource created for first time.",
  gasConsumption: "Gas Consumption",
  gasConsumptionTip: "Daily gas on user transactions.",
  peakTpsTip:
    "Daily highest rate of transactions per second, averaged over 15 blocks.",
  monthlyActiveAccounts: "Monthly Active Accounts",
  monthlyActiveAccountsTip:
    "Daily count of distinct addresses with signed transactions over the last 30 days.",
  last7Days: "Last 7 Days",
  last30Days: "Last 30 Days",
  userTransactions: "User Transactions",
  userTransactionsTip: "Daily transaction count of user transactions.",
  realtime: "REAL-TIME",
  peakLast30Days: "PEAK LAST 30 DAYS",
  tpsTip: "Current rate of transactions per second on the network.",
  tps: "TPS",
  peakTps: "Peak TPS",
  realTimeHeading: "Real-Time",
  peakLast30DaysHeading: "Peak Last 30 Days",
  peakLast30DaysNetworkTip:
    "Highest rate of transactions per second over the past 30 days, averaged over 15 blocks.",
  totalSupply: "Total Supply",
  totalSupplyTip: "Amount of APT tokens flowing through the Aptos network.",
  validators: "Validators",
  fullnodes: "Fullnodes",
  activeNodes: "Active Nodes",
  activeValidators: "Active Validators",
  activeValidatorsTip:
    "Number of validators in the validator set in the current epoch.",
  activeFullnodes: "Active Fullnodes",
  activeFullnodesTip: "Approximate number of fullnodes.",
  activelyStaked: "Actively Staked",
  activelyStakedTip: "Amount of APT tokens currently held in staking pools.",
} as const;

export const searchExtra = {
  noResults: "No Results",
  group: {
    account: "Accounts",
    asset: "Assets",
    transaction: "Transactions",
    block: "Blocks",
    object: "Objects",
    address: "Addresses",
    other: "Other",
  },
  result: {
    accountQuery: "Account {address} {query}",
    account: "Account {address}",
    accountNamed: "Account {address} {name}",
    coin: "Coin {type}",
    block: "Block {height}",
    transactionVersion: "Transaction Version {version}",
    blockWithTxn: "Block with Txn Version {version}",
    transaction: "Transaction {id}",
    fungibleAsset: "Fungible Asset {address}",
    object: "Object {address}",
    address: "Address {address}",
    emojicoin: "{query} emojicoin",
    emojicoinLp: "{query} emojicoin LP",
  },
} as const;

export const filter = {
  contractAddress: "Contract Address",
  module: "Module",
  function: "Function",
  addressAria: "Filter by contract address",
  moduleAria: "Filter by module name",
  functionAria: "Filter by function name",
  moduleDisabled: "Set a contract address first",
  functionDisabled: "Set a module name first",
  clear: "Clear {name}",
  clearAll: "Clear all",
  entryFunction: "Filter by Entry Function",
} as const;

export const flags = {
  differences: "Differences",
  all: "All",
  enabledAnywhere: "Enabled (anywhere)",
  disabledEverywhere: "Disabled (everywhere)",
  enabled: "Enabled",
  disabled: "Disabled",
  unknownAria: "Unknown — network unreachable",
  networkError:
    "One or more networks could not be reached. Cells for those networks show as unknown.",
  tableAria: "Feature flags by network",
  id: "ID",
  heading: "Feature Flags by Network",
  intro:
    "On-chain feature flags decoded from `0x1::features::Features`. The **Differences** view highlights flags that are not in sync across networks.",
  upstreamHint:
    "Names for flags not yet in this explorer's static list are resolved from `aptos-core` when available.",
  allAgree: "All networks agree on every known feature flag.",
  noMatch: "No features match this filter.",
  loadingName: "Loading name",
} as const;

export const deployments = {
  up: "Up",
  down: "Down",
  unreachable: "Unable to reach fullnode",
  epoch: "Epoch",
  blockHeight: "Block Height",
  ledgerVersion: "Ledger Version",
  chainId: "Chain ID",
  frameworkRelease: "Framework Release",
  bytecodeFormat: "Bytecode Format (max)",
  nodeRelease: "Node Release",
  gasUnmapped: "gas {version} (unmapped)",
  gasMappedTip:
    "Gas schedule feature_version {version} (aptos-core gas_feature_versions in aptos-gas-schedule/src/ver.rs)",
  gasUnmappedTip:
    "Gas schedule feature_version {version} is not mapped to a known framework release in this explorer — update GAS_FEATURE_VERSION_TO_FRAMEWORK_RELEASE",
  nodeCommit: "Node Commit",
  validators: "Validators",
} as const;

export const aips = {
  noMatch: "No AIPs match the selected filter",
  openOnGithub: "Open on GitHub",
  openAipAria: "Open AIP-{number} on GitHub",
  sourceLinkAria: "Source link",
  author: "Author",
  rateLimited: "GitHub API rate limited — try again in a few minutes",
  loadFailed: "Failed to load AIPs",
  filter: {
    all: "All",
    draft: "Draft",
    lastCall: "Last Call",
    accepted: "Accepted",
    final: "Final",
    withdrawn: "Withdrawn",
    living: "Living",
  },
} as const;
