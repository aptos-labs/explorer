export const tabs = {
  transaction: {
    overview: "Overview",
    decibelDetail: "Decibel",
    payments: "Payments",
    balanceChange: "Balance Change",
    events: "Events",
    payload: "Payload",
    modules: "Modules",
    changes: "Changes",
    trace: "Trace",
  },
  account: {
    transactions: "Transactions",
    coins: "Assets",
    tokens: "NFTs",
    multisig: "Multisig",
    resources: "Resources",
    modules: "Modules",
    info: "Info",
  },
  block: {
    overview: "Overview",
    transactions: "Transactions",
  },
  coin: {
    info: "Info",
    transactions: "Beta - Transactions",
    holders: "Beta - Holders",
    transactionsShort: "Transactions",
    holdersShort: "Holders",
  },
  fa: {
    info: "Info",
    holders: "Beta - Holders",
    transactions: "Beta - Transactions",
    holdersShort: "Holders",
    transactionsShort: "Transactions",
  },
  token: {
    overview: "Overview",
    activities: "Activities",
  },
  validators: {
    all: "All Nodes",
    delegation: "Delegation Nodes",
  },
  releases: {
    networks: "Networks",
    aips: "AIPs",
    sdks: "SDKs & Tools",
  },
  modules: {
    packages: "Packages",
    code: "Code",
    run: "Run",
    view: "View",
    historicalUnavailable:
      "Run and View are not available for historical versions",
  },
} as const;
