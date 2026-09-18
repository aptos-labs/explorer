export const pages = {
  home: {
    metaTitle: "Home",
    metaDescription:
      "Explore transactions, accounts, blocks, validators, and activity on the Aptos blockchain. The official block explorer for the Aptos network.",
    websiteSchema:
      "Explore transactions, accounts, blocks, and activity on the Aptos blockchain.",
    searchSchemaName: "Aptos Explorer search",
    subtitle:
      "Search the chain, then jump straight to transactions, blocks, validators, or analytics.",
    browseTransactions: "Browse Transactions",
    viewLatestBlocks: "View Latest Blocks",
    openAnalytics: "Open Analytics",
    documentTitle: "Aptos Explorer - Blockchain Explorer",
    searchDocumentTitle: "Search · {query}",
    searchMetaDescription:
      "Aptos Explorer search for “{query}”. Results load inline on this page; use the search bar to refine or follow detected links.",
  },
  transactions: {
    title: "Transactions",
    all: "All Transactions",
    user: "User Transactions",
    viewUser: "View User Transactions",
    viewAll: "View All Transactions",
    metaDescription:
      "Browse recent transactions on the Aptos blockchain. View transaction details, type, gas fees, sender and receiver addresses, events, and status. Real-time transaction monitoring.",
  },
  blocks: {
    title: "Latest Blocks",
    entity: "Block",
    metaTitle: "{tab} | Block {height}",
    metaDescription: "View {tab} for block {height} on the Aptos blockchain.",
    listDescription:
      "View the latest blocks produced on the Aptos blockchain. Monitor block height, epoch, round, timestamps, proposers, and included transactions. Real-time block explorer.",
  },
  coins: {
    title: "Coins & Fungible Assets",
    entity: "Coin",
    listDescription:
      "Browse the top coins and fungible assets on the Aptos blockchain. View token details, supply, price, market cap, and verification status.",
    loadError: "Error loading coin list. Please try again later.",
    searchPlaceholder: "Search by name, symbol, or address...",
    metaTitle: "{tab} | Coin {struct}",
    metaTitleSymbol: "{symbol} - Aptos Coin",
    metaTitleShort: "Coin {struct}",
    metaDescription: "View {tab} for coin {struct} on the Aptos blockchain.",
    metaDescriptionFallback:
      "View {symbol} on Aptos. See token supply, holders, price, transactions, and market information.",
    supplyOnChain: "Supply tracked on-chain, may change over time",
    supplyOffChain: "Supply verified off-chain to have a fixed supply",
    supplyNone: "No supply is tracked for this coin on-chain or off-chain",
    confidentialSupplyTip:
      "Tokens held in the on-chain confidential-asset pool for the paired fungible asset (public aggregate). Individual balances stay private.",
  },
  fa: {
    entity: "Fungible Asset",
    supplyOnChain: "Supply tracked on-chain, may change over time",
    named: "{symbol} - Fungible Asset",
    metaTitle: "{tab} | Fungible Asset {id}",
    metaTitleShort: "Fungible Asset {id}",
    metaDescription:
      "View {tab} for fungible asset {address} on the Aptos blockchain.",
    metaDescriptionFallback:
      "View {symbol} on Aptos. See token supply, decimals, holders, metadata, and transaction history.",
    confidentialSupplyTip:
      "Tokens held in the on-chain confidential-asset pool for this metadata object (public aggregate). Individual balances stay private.",
    dispatchable: "Dispatchable",
    dispatchableTip:
      "Custom dispatch functions are registered for transfers (withdraw/deposit/balance/supply)",
    hookWithdraw: "Withdraw",
    hookDeposit: "Deposit",
    hookDerivedBalance: "Derived balance",
    hookDerivedSupply: "Derived supply",
    viewModuleSource: "click to view module source",
    hookTooltip: "{hook}: {path} — {action}",
    nativeGasTokenInfo:
      "This is the official native gas token on Aptos.  This is the fungible asset version of APT.  It is fully compatible with the coin version when using 0x1::coin functions.  See 0x1::aptos_coin::AptosCoin for the coin version.",
    nativeUsdtInfo: "This is the official native USD₮ on Aptos.",
  },
  tokens: {
    entity: "Token",
    metaTitle: "{tab} | Token {id}",
    metaDescription: "View {tab} for NFT token {id} on the Aptos blockchain.",
  },
  validator: {
    entity: "Validator",
    metaTitle: "Validator {id}",
    metaDescription:
      "View Aptos validator {id}. Status: {status}. See delegation pool, commission rates, stake amounts, voting power, rewards, and performance metrics.",
  },
  account: {
    entity: "Account",
    named: "{name} - Account",
    multisig: "Multisig Account",
    object: "Object",
    namedObject: "{name} - Object",
    deletedObject: "Deleted Object",
    tokenObject: "Token Object",
    deletedTokenObject: "Deleted Token Object",
    daa: "Derivable Aptos Account",
    description:
      "View details for Aptos account {address}. See transactions, resources, modules, coins, and NFTs owned by this account.",
    multisigDescription:
      "View details for Aptos multisig account {address}. See pending transactions, owners, and multisig configuration.",
    objectDescription:
      "View object {address} on the Aptos blockchain. See object resources, ownership, and associated data.",
    deletedObjectDescription:
      "This object {address} has been deleted from the Aptos blockchain.",
    tokenDescription:
      "View token object {address} on the Aptos blockchain. See token metadata, ownership, and transfer history.",
    deletedTokenDescription:
      "This token object {address} has been deleted from the Aptos blockchain.",
    daaDescription:
      "View derivable Aptos account {address}. Cross-chain account derived from another blockchain address.",
    daaHeading: "This is a Derivable Aptos Account",
    daaLearnMore: "Learn more about",
    daaLearnMoreLink: "Derivable Aptos Accounts",
    daaDashboardIntro:
      "To get more insights on your derivable aptos accounts, please visit the",
    daaDashboard: "Derivable Aptos Account Dashboard",
    tabMetaDescription:
      "View {tab} for {kind} {address} on the Aptos blockchain.",
    kindAccount: "account",
    kindObject: "object",
  },
  validators: {
    title: "Validators",
    metaTitle: "{tab} | Validators",
    metaDescription:
      "View all validators on the Aptos blockchain network. Monitor validator performance, stake amounts, commission rates, voting power, and delegation status. Stake your APT with trusted validators.",
  },
  releases: {
    title: "Releases",
    metaTitle: "{tab} | Releases",
    networksDescription:
      "Live on-chain status for Aptos mainnet, testnet, and devnet — epoch, block height, framework release (from gas schedule), max bytecode format, node release, and feature-flag comparison.",
    aipsDescription:
      "Track all Aptos Improvement Proposals (AIPs) — status, authors, and links to source.",
    sdksDescription:
      "Latest release versions for the Aptos CLI, node software, and all official SDKs — TypeScript, Python, Rust, and Go.",
  },
  analytics: {
    title: "Network Analytics",
    metaDescription:
      "View Aptos network analytics including daily active users, transaction volumes, TPS, gas fees, staking stats, and blockchain metrics. Interactive charts and real-time data.",
    mainnetOnly: "Analytics are available for Mainnet only.",
  },
  script: {
    title: "Run a Move Script",
    metaDescription:
      "Advanced tool to build, simulate, and execute a raw Move script transaction on Aptos by pasting compiled script bytecode and supplying typed arguments.",
  },
  accountHistory: {
    limitedTitle: "Transaction History Limited",
    limitedBody:
      "This account has a large transaction history. Due to performance constraints, only the latest **{count}** transactions are displayed. Older transactions are not shown but can still be accessed directly by their version number.",
    functionFilterHint:
      "Function filter searches transactions sent by this account only, not all transactions involving it.",
  },
  collection: {
    transactions: "Transactions",
    latestBlocks: "Latest Blocks",
    coins: "Coins & Fungible Assets",
    analytics: "Network Analytics",
    validators: "Validators",
  },
} as const;

export const notFound = {
  accountTitle: "Account Not Found",
  accountBody:
    "Account not found. Please take a look at the Coins and Token tabs. The account has never submitted a transaction, but it may still hold assets.",
  accountLoad: "Error Loading Account",
  accountLoadBody:
    "Unknown error ({type}) fetching an Account with address {address}:",
  validatorTitle: "Validator Not Found",
  validatorBody: "This address does not have a 0x1::stake::StakePool resource.",
  transactionTitle: "Transaction Not Found",
  transactionBody: "Could not find a transaction with version or hash {id}",
  transactionLoad: "Error Loading Transaction",
  transactionLoadBody:
    "Unknown error fetching transaction with version or hash {id}:",
  blockTitle: "Block Not Found",
  blockBody: "Could not find a block with height {height}",
  blockLoad: "Error Loading Block",
  blockLoadBody: "Unknown error fetching block with height {height}:",
  coinTitle: "Coin Not Found",
  coinBody: "Coin not found: {struct}.",
  coinLoad: "Error Loading Coin",
  coinLoadBody: "Unknown error ({type}) fetching a Coin {struct}:",
  tokenTitle: "Token Not Found",
  tokenBody: "Token not found.",
  tokenIdSuffix: " Token ID: {id}",
  tokenInvalid: "Invalid Token ID",
  tokenInvalidBody: "Invalid token ID ({type}): {message}",
  tokenLoad: "Error Loading Token",
  tokenLoadBody: "Unable to load token information.",
  faTitle: "Fungible Asset Not Found",
  faBody: "Fungible asset not found: {address}.",
  faLoad: "Error Loading Fungible Asset",
  faLoadBody: "Unknown error ({type}) fetching a fungible asset {address}:",
  transactionsTitle: "Transactions Not Found",
  transactionsBody: "Transactions not found.",
  transactionsLoad: "Error Loading Transactions",
  transactionsLoadBody: "Unable to load transactions.",
  modulesTitle: "No modules found",
  modulesBody:
    "No Move modules were returned for this address on this network (HTTP 404 from the modules API). If you expected modules here, confirm the address and network, or try again later.",
} as const;

export const verificationPage = {
  metaTitle: "Token & Address Verification",
  metaDescription:
    "Learn how to verify tokens and addresses on Aptos Explorer. Get your project verified through the Panora token list. Protect users from scams with official verification.",
  heading: "Token & Address Verification Instructions",
  overviewTitle: "Verification Overview",
  overviewBody:
    "The Aptos Explorer supports multiple verification levels to help users identify legitimate tokens and addresses. This page explains how to get your tokens and addresses verified through the official channels.",
  tokenTitle: "Token Verification",
  importantTitle: "Important Notice",
  importantBody:
    "Token verification requests are handled through the [Panora token list](https://github.com/PanoraExchange/Aptos-Tokens) repository, not through this explorer directly.",
  tokenIntro:
    "To get your token verified on Aptos Explorer, you must be added to the community-maintained Panora token list.",
  communityTitle: "1. Community Verification (Panora Token List)",
  communityBody: "Submit your token to the Panora community token list:",
  labsTitle: "2. Labs Verification (Manual Process)",
  labsBody:
    "For special cases, tokens can be manually verified by the Aptos Labs team. This process is reserved for:",
  labsBullets: [
    "Native tokens (like APT)",
    "Major stablecoins and established tokens",
    "Verified Emojicoins (automatically verified)",
    "Tokens with special significance to the Aptos ecosystem",
  ],
  levelsTitle: "3. Verification Levels",
  levelsBullets: [
    "**Native Token:** Blue verified badge - Native Aptos tokens",
    "**Labs Verified:** Blue verified badge - Manually verified by Aptos Labs",
    "**Community Verified:** Blue outlined badge - Verified by Panora community",
    "**Recognized:** Yellow warning badge - In Panora list but not verified",
    "**Unverified:** Orange warning badge - Not in any verification list",
  ],
  addressTitle: "Address Verification",
  addressIntro:
    "Address verification helps users identify legitimate project addresses and avoid scams. Address verification requests are handled directly through the explorer's GitHub repository.",
  submitTitle: "1. Submission Process",
  submitBody: "Create a verification request using the GitHub issue template:",
  submitLink: "Submit Address Verification Request",
  requiredTitle: "2. Required Information",
  requiredBullets: [
    "Full address to be verified (e.g., 0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b)",
    "Name to display (under 64 characters, may be truncated over 20 characters)",
    "Verification documentation (source code, official documentation, etc.)",
  ],
  eligibleTitle: "3. Eligible Addresses",
  eligibleBullets: [
    "Official project treasury addresses",
    "Verified smart contract addresses",
    "Known validator addresses",
    "Official bridge or protocol addresses",
    "Major exchange addresses",
    "DeFi protocol addresses",
  ],
  docsTitle: "4. Verification Documentation",
  docsBody: "Provide comprehensive documentation to verify the address:",
  docsBullets: [
    "Official documentation linking to the address",
    "Verified social media announcements",
    "Smart contract source code (if applicable)",
    "Audit reports (highly recommended)",
    "Any other proof of legitimacy",
  ],
  securityTitle: "Important Security Information",
  securityWarningTitle: "Security Warning",
  securityWarningBody:
    "Never share private keys, seed phrases, or pay fees during the verification process. All verification processes are free and handled through official GitHub repositories.",
  networkTitle: "Network Availability",
  networkBody:
    'Verification badges are only displayed on Mainnet. Other networks (testnet, devnet) show "No Verification" status.',
  bannedTitle: "Banned Assets",
  bannedBody:
    "Assets can be marked as banned if they are identified as scams or dangerous. Banned assets display red warning badges.",
  processingTitle: "Processing Time",
  processingBody:
    "Address verification requests are typically reviewed within 1-2 weeks. Token verification through Panora follows their community review process.",
  supportTitle: "Support",
  supportBody: "For questions about verification:",
  supportAddress:
    "**Address Verification:** [Explorer GitHub Issues](https://github.com/aptos-labs/explorer/issues)",
  supportToken:
    "**Token Verification:** [Panora Token List](https://github.com/PanoraExchange/Aptos-Tokens)",
  supportGeneral:
    "**General Support:** [Aptos Discord](https://discord.gg/aptoslabs)",
} as const;
