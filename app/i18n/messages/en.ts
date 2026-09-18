import type {MessageTree} from "../translate";
import {
  common,
  copyHints,
  errors,
  feature,
  interval,
  network,
  rateLimit,
  share,
  wallet,
} from "./en/common";
import {fields} from "./en/fields";
import {contract, script} from "./en/contract";
import {
  activity,
  hexBytes,
  payload,
  payments,
  snackbar,
  txnModules,
} from "./en/payments";
import {
  aips,
  analytics,
  deployments,
  filter,
  flags,
  searchExtra,
  staking,
  verified,
} from "./en/verified";
import {
  accountUi,
  confidential,
  modules,
  releasesUi,
  signature,
  trace,
} from "./en/modules";
import {decibel, multisig} from "./en/decibel";
import {pages, notFound, verificationPage} from "./en/pages";
import {table} from "./en/table";
import {tabs} from "./en/tabs";
import {tooltips} from "./en/tooltips";
import {txn} from "./en/txn";

/**
 * English is the source catalog. Add another file (e.g. `es.ts`) and register
 * it in `app/i18n/messages/index.ts` plus `SUPPORTED_LOCALES`. Update the
 * shipped-locales table in `AGENTS.md` in the same change.
 */
export const en = {
  chrome: {
    skipToContent: "Skip to main content",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Main navigation",
    overflowMenuAriaLabel: "Navigation menu",
    openSettings: "Open settings",
    openGuide: "Open user guide",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    nav: {
      transactions: "Transactions",
      transactionsTitle: "View All Transactions",
      analytics: "Analytics",
      analyticsTitle: "View Network Analytics",
      validators: "Validators",
      validatorsTitle: "View All Validators",
      blocks: "Blocks",
      blocksTitle: "View Latest Blocks",
      coins: "Coins",
      coinsTitle: "View Coins & Fungible Assets",
      releases: "Releases",
      releasesTitle: "View Network Deployments, AIPs, and SDK & Tool Releases",
      runScript: "Run Script",
      runScriptTitle: "Build, Simulate, and Execute a Move Script (Advanced)",
      settings: "Settings",
      guide: "User Guide",
    },
  },
  footer: {
    privacy: "Privacy",
    terms: "Terms",
    verification: "Token & Address Verification",
    guide: "User Guide",
    clearCache: "Clear Cache",
    cacheCleared: "✓ Cleared",
    clearCacheTitle: "Clear search cache",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Search by address, txn, block, coin, or ANS name",
    helper:
      "Account address or name · Txn hash or version · Block height · Coin type · ANS name",
    ariaLabel: "search",
    type: {
      account: "Account",
      address: "Address",
      transaction: "Transaction",
      block: "Block",
      coin: "Coin",
      fungibleAsset: "Fungible Asset",
      object: "Object",
      result: "Result",
    },
    noResults: searchExtra.noResults,
    emptyTitle: searchExtra.emptyTitle,
    emptyHint: searchExtra.emptyHint,
    group: searchExtra.group,
    resultLabel: searchExtra.result,
  },
  settings: {
    title: "Settings",
    description:
      "Manage your explorer preferences. Settings are stored locally in your browser.",
    language: {
      title: "Language",
      description:
        "Choose how the explorer displays chrome, settings, and the user guide. Browser default follows your device language when a translation exists, and otherwise uses English. Additional languages can be added as catalogs without changing page URLs.",
      label: "Display language",
      auto: "Browser default",
    },
    decompilation: {
      title: "Move Bytecode Decompilation",
      description:
        "Enable client-side decompilation of on-chain Move bytecode into human-readable source. Runs entirely in your browser via WebAssembly.",
      ariaLabel: "Enable Move bytecode decompilation",
      disclaimerTitle: "Disclaimer — Please read before enabling",
      disclaimerIntro:
        "Decompiled output is generated mechanically from on-chain bytecode and **may not match** the original source code. Variable names, comments, and some structural details are lost during compilation and cannot be recovered. By enabling this feature you acknowledge that:",
      bullets: [
        "The decompiled output is provided **as-is for informational purposes only**.",
        "You accept responsibility for how you use the decompiled output.",
        "The output should not be treated as the definitive or authoritative source code for any on-chain module.",
      ],
    },
    apiKeys: {
      title: "API Key Overrides",
      whyAriaLabel: "Why use your own API key?",
      popover:
        "The explorer uses a shared geomi.dev API key by default. Adding your own key gives you a dedicated rate limit, which helps if you browse heavily or hit HTTP 429 responses.",
      popoverManage:
        "Create and manage keys at [geomi.dev](https://geomi.dev).",
      description:
        "Optional geomi.dev API keys per network. Used only in your browser. Leave a network empty to use the default key from the build (if any). By default, overrides are stored for the current browser session and cleared when the session ends.",
      fieldLabel: "{network} API key",
      fieldPlaceholder: "Paste key for {network} (optional)",
      showKeys: "Show API keys",
      hideKeys: "Hide API keys",
      getKey: "Don't have a key? [Get one at geomi.dev](https://geomi.dev)",
      remember: "Remember API keys on this device",
      rememberWarning:
        "Remembering keys stores them in this browser's local storage. Avoid enabling this on shared or untrusted devices.",
      notStored:
        "Keys are not stored by the explorer application server. Your browser uses them only for client-side API requests. For best security, use client keys with only the origin `https://explorer.aptoslabs.com` enabled and enforced.",
      refreshNote:
        "Existing data will refresh after save so new requests use the updated keys immediately.",
    },
    actions: {
      reset: "Reset",
      restoreDefaults: "Restore Defaults",
      save: "Save",
    },
    metaDescription:
      "Configure Aptos Explorer settings including language, API keys, decompilation preferences, and other options.",
  },
  guide: {
    meta: {
      title: "User Guide",
      description:
        "How to use Aptos Explorer: search, networks, transactions, accounts, modules, settings, and how to read what you see.",
      tocLabel: "On this page",
      intro:
        "This guide explains how to **use** Aptos Explorer, how to **read** the pages it shows, and how to **configure** it in your browser. It is written for people looking up on-chain data — not for operating a node or writing Move.",
    },
    overview: {
      title: "What this explorer is",
      paragraphs: [
        "Aptos Explorer is the official **block explorer** for the Aptos blockchain. You use it to look up transactions, accounts, blocks, validators, coins, NFTs, and network status. It reads public chain data; it does not take custody of funds and it is not a wallet.",
        "Every page is scoped to a **network** (mainnet by default). A transaction or account on testnet is a different object from the same identifier on mainnet. The network is stored in the URL as `?network=…` so links you copy keep the same chain.",
        "The explorer is a website. Connecting a wallet is optional and only needed for actions such as staking, running a module function, or submitting a Move script.",
      ],
    },
    chrome: {
      title: "Finding your way around",
      paragraphs: [
        "The **header** is on every page: logo (home), main navigation, network selector, language selector, optional share button, [user guide](/guide), [settings](/settings), light/dark theme, and wallet connect. Network and language stay in the header on every screen size, including the installed PWA. On smaller screens, navigation, settings, theme, and wallet live in the menu button.",
        "Under the header, most detail pages show a **back** control (when you have in-app history) and a **search** field. The home page (`/`) is a larger search surface with the same matching rules.",
        "The **footer** has Privacy, Terms, [token verification instructions](/verification), this guide, and **Clear Cache** (clears the browser search result cache, not the blockchain).",
      ],
      bullets: [
        "**Transactions** — recent user transactions, with filters.",
        "**Analytics** — mainnet-only charts (TPS, active users, gas, and more).",
        "**Validators** — the validator set and delegation pools.",
        "**Blocks** — latest blocks by height.",
        "**Coins** — listed coins and fungible assets.",
        "**Releases** — live network versions, AIPs, and SDK/CLI releases.",
        "**Run Script** — advanced tool to simulate and submit a raw Move script.",
      ],
    },
    search: {
      title: "Search",
      paragraphs: [
        "Type in the search box on the [home page](/) or in the header. You do not have to pick an entity type first — the explorer detects what you entered.",
        "You can also share a search with `/?search={query}` (for example `/?search=0x1`). If the URL search has exactly one clear result, the header search may take you there immediately.",
      ],
      bullets: [
        "**Account address** (including short forms like `0x1`) — account, and possibly a coin, fungible-asset metadata, or Move object.",
        "**ANS name** ending in `.apt` (or `.petra`) — resolves to an account.",
        "**Transaction version** (a number) or **transaction hash** (`0x` plus 64 hex characters).",
        "**Block height** (a number in range of the chain).",
        "**Move coin type** such as `0x1::aptos_coin::AptosCoin`.",
        "**Token name or symbol** — matches the listed coin set.",
        "**Emoji-only text** — looks up emojicoin markets when applicable.",
      ],
    },
    networks: {
      title: "Networks",
      paragraphs: [
        "Use the network dropdown in the header — it stays visible on desktop, phones, and the installed PWA. In-app links keep your current network so you do not silently jump back to mainnet.",
        "**Mainnet** is production. **Testnet** and **devnet** are for development (devnet is reset often). **Local** talks to a node on your machine (typically `http://127.0.0.1:8080/v1`). Hidden or preview networks may appear when the explorer is built with a feature flag.",
        "If you select Local and the node is not running, a modal explains how to start `aptos node run-local-testnet` and offers a switch back to Mainnet.",
        "Some features are mainnet-only (analytics, some price estimates, Sentio traces). GraphQL/indexer tabs may be missing on networks that do not publish an indexer.",
      ],
    },
    transactions: {
      title: "Reading a transaction",
      paragraphs: [
        "Open a transaction at `/txn/{version}` or `/txn/{hash}`. **Version** is the ledger sequence number (an integer from 0). **Hash** is the 32-byte transaction hash. Version is the stable identifier if you have it.",
        "The [transactions list](/transactions) shows recent activity. **User vs All** chooses user-submitted transactions versus the full stream (including block metadata). You can filter user transactions by entry function (`fn_addr`, `fn_module`, `fn_name` in the URL).",
        "On the detail page, tabs depend on the transaction type:",
      ],
      bullets: [
        "**Overview** — status, sender, gas, function, and parsed **Actions** (swaps, transfers, and similar).",
        "**Payments** — shown only when the explorer identifies a payment (peer-to-peer, partner-controlled hops, confidential transfers, wraps/unwraps, or exchange legs). Confidential amounts stay hidden.",
        "**Balance Change** — coin and fungible-asset balance diffs, including gas.",
        "**Events** — logs emitted during execution.",
        "**Payload** — the submitted payload (entry function, script, multisig, and so on).",
        "**Changes** — write-set resource changes.",
        "**Modules** — when the transaction publishes or upgrades Move packages.",
        "**Trace** — experimental Sentio Move call trace on mainnet user transactions.",
      ],
      more: [
        "A failed transaction still exists on-chain; the overview shows the error. Pending transactions have not yet been ordered into a block.",
        "If the serving fullnode has **pruned** old history, the explorer retries an **archive** node, then reconstructs from the **indexer** if needed. Indexer-only pages may omit payload arguments, events, or hashes, and they show an info banner.",
      ],
    },
    accounts: {
      title: "Accounts, names, and objects",
      paragraphs: [
        "An **account** is a 32-byte address. Open it at `/account/{address}`. Short hex (`0x1`) is accepted. [Aptos Names](https://aptosnames.com) (`.apt`) resolve to addresses in search and in the account header.",
        "A **Move object** is a first-class on-chain entity that can own resources. If you open an object address as an account, the explorer redirects to `/object/{address}` with a similar tab set.",
        "Account tabs typically include:",
      ],
      bullets: [
        "**Transactions** — history for this address, with pagination and optional function filter.",
        "**Coins** — coin balances (and related FA views where applicable).",
        "**Tokens** — NFTs and digital assets.",
        "**Resources** — Move resources stored under the account, as JSON.",
        "**Modules** — published packages and source (see [Modules](#modules)).",
        "**Multisig** — when the account is a multisig (Petra Vault onboarding may be offered).",
        "**Info** — sequence number, authentication key, and related metadata.",
      ],
      more: [
        "Known addresses can show a **label and icon** (exchanges, framework accounts, and so on). Some labeled projects show a **defunct** or winding-down banner — treat that as a warning, not investment advice.",
        "The **balance card** shows APT. On mainnet it may include a USD estimate from a public price feed.",
      ],
    },
    modules: {
      title: "Move modules and code",
      paragraphs: [
        "The Modules tab lists packages published by an account or object. You can open **packages**, **code** for a module, **Run** (entry functions, wallet required), and **View** (read-only view functions).",
        "Code views include **Published Source** (if the publisher stored it), **ABI**, and — when you opt in under [Settings](/settings) — **Decompiled** bytecode and **Disassembly**. Decompilation runs in your browser (WebAssembly). It is a reconstruction, not the original comments and names.",
        "A **version selector** lets you inspect a package at an earlier publish transaction. Diff view compares two versions. Cross-module links jump to other modules in the same package when names resolve.",
      ],
    },
    blocks: {
      title: "Blocks",
      paragraphs: [
        "Aptos groups transactions into **blocks** ordered by **height**. The [blocks list](/blocks) shows recent heights. A block page (`/block/{height}`) has **Overview** (timestamp, proposer, transaction count, hashes) and **Transactions** in that block.",
        "Pruned blocks follow the same archive-node fallback as old transactions. The recent-blocks table stays on the serving fullnode window.",
      ],
    },
    validators: {
      title: "Validators and staking",
      paragraphs: [
        "The [validators](/validators) page has **All Nodes** (the current validator set, voting power, location when known) and **Delegation** (pools you can stake to). An epoch indicator shows the current epoch.",
        "Open a pool at `/validator/{address}` for commission, stake, performance, and — if you connect a wallet that has deposits — **My Deposits** with stake / unstake / restake / withdraw. On a phone, those actions are on each deposit card, not only in the desktop table.",
        "Delegation is a protocol action: it spends gas and uses your wallet. Read amounts and the lockup before confirming.",
      ],
    },
    assets: {
      title: "Coins, fungible assets, and NFTs",
      paragraphs: [
        "**Coins** are the original Move `0x1::coin` types (`address::module::Struct`). **Fungible assets (FA)** are the newer object-based standard. APT exists in both views; many newer tokens are FA-only. The [coins list](/coins) mixes listed coins and FAs.",
        "A coin page is `/coin/{type}` (URL-encoded type). An FA page is `/fungible_asset/{metadataAddress}`. Tabs commonly include **Info**, **Transactions**, and **Holders** (holders need indexer support).",
        "NFTs and digital assets use `/token/{tokenId}` with **Overview** and **Activities**. Banned or scam collections may be hidden or flagged.",
        "Verification badges (native, Labs verified, community/Panora, recognized, unverified, banned) are explained on the [verification](/verification) page. A badge is not a guarantee of value or safety.",
      ],
    },
    analytics: {
      title: "Analytics",
      paragraphs: [
        "[Analytics](/analytics) is **mainnet only**. Other networks show a short message instead of charts. Charts cover daily user transactions, peak TPS, active users, new accounts, deployments, gas, and block gap. You can switch 7-day vs 30-day ranges.",
        "The strip at the top summarizes supply, stake, TPS, and node counts. Data comes from published chain-stats files plus live chain queries — it can lag slightly.",
      ],
    },
    releases: {
      title: "Releases, AIPs, and tools",
      paragraphs: [
        "The [releases hub](/releases) has three tabs: **Networks** (epoch, height, framework/node versions, feature flags across mainnet, testnet, and devnet), **AIPs** (Aptos Improvement Proposals from the public AIP repository), and **SDKs** (CLI, `aptos-node`, and official SDK releases).",
        "Older URLs `/deployments` and `/aips` redirect here.",
      ],
    },
    runScript: {
      title: "Run Script (advanced)",
      paragraphs: [
        "[Run Script](/run-script) builds, **simulates**, and **executes** a compiled Move **script** transaction from a connected wallet. Scripts have no on-chain ABI, so you must declare argument types yourself. There is no in-browser Move compiler — paste bytecode (hex) from a compiler you trust.",
        "Treat this as irreversible once executed. Always read the simulation (status, gas, events, resource changes) before Execute. Prefer the account Modules **Run** tab for published entry functions.",
      ],
    },
    configure: {
      title: "Configuration",
      paragraphs: [
        "Open [Settings](/settings). Preferences are stored **in this browser**, not on Aptos Labs servers.",
      ],
      bullets: [
        "**Language** — Header globe control (it shows a short code for the current language) or Settings. Browser default or an explicit language. This controls translated chrome, settings copy, and this guide. On-chain data (addresses, function names, events) stays as the chain stores it.",
        "**Move bytecode decompilation** — off by default. Read the disclaimer before enabling. When off, Decompiled and Disassembly views are hidden.",
        "**API key overrides** — optional per-network [geomi.dev](https://geomi.dev) keys so your browser is not stuck on the shared anonymous rate limit. Keys are sent as `Authorization: Bearer`. Geomi `AG-*` client keys must allow this site’s Origin. Check **Remember on this device** only on a machine you trust; otherwise keys last for the tab session.",
        "**Theme** — light or dark from the header sun/moon control. Stored in a cookie (`color_scheme`) and follows the system if you have not chosen.",
        "**Network** — header dropdown (visible on phones and in the installed PWA); encoded in `?network=` rather than settings.",
      ],
      more: [
        "Save applies API keys and decompilation (and language) together: cached clients are dropped and queries refresh. **Restore Defaults** clears these explorer preferences in this browser.",
        "If you see HTTP **429**, the rate-limit drawer can send you to Settings. A Geomi body of *Per anonymous IP rate limit exceeded* means no key was accepted; *Per application per IP rate limit exceeded* means your key’s quota was hit.",
      ],
    },
    wallet: {
      title: "Wallet",
      paragraphs: [
        "Connecting a wallet is optional. Use it to open your account quickly, stake, run entry functions, or submit a script. Petra is listed first among installable wallets.",
        "The wallet’s network must match the explorer network (with a small exception for some local/custom RPC setups). Mismatched networks block submission so you do not sign for the wrong chain.",
      ],
    },
    verification: {
      title: "Token and address verification",
      paragraphs: [
        "The explorer can show verification badges on tokens and some addresses. Community listing goes through the [Panora token list](https://github.com/PanoraExchange/Aptos-Tokens). Labs verification is reserved for native assets and selected established tokens.",
        "Step-by-step instructions for project teams are on the [Token & Address Verification](/verification) page. Users should still check the type/metadata address, not only a name or icon.",
      ],
    },
    urls: {
      title: "URLs, sharing, and agents",
      paragraphs: [
        "Prefer **path-based tabs**, for example `/account/0x1/modules` rather than a `?tab=` query. Copy the address bar to share a view; keep `?network=` if you are not on mainnet.",
        "Canonical templates are documented for humans here and for software in [`/llms.txt`](/llms.txt). In-browser agents may use read-only WebMCP tools (search, open transaction/account/block/coin/releases/guide) when the browser supports them.",
        "When the explorer is installed as a PWA or embedded (for example Petra Vault), a **Share** control may appear in the header.",
      ],
    },
    glossary: {
      title: "Glossary",
      bullets: [
        "**Address** — 32-byte account or object identifier, hex with `0x`. `0x1` is the Aptos Framework.",
        "**ANS** — Aptos Name Service. A name like `alice.apt` maps to an address.",
        "**Block height** — index of a block, starting at 0.",
        "**Event** — structured log emitted while a transaction runs.",
        "**Fungible asset (FA)** — object-based fungible token standard (metadata object address).",
        "**Gas** — fee for execution and storage, paid in APT (octas under the hood).",
        "**Indexer** — Aptos Labs GraphQL API used for history, holders, and some tabs. Not every network has one.",
        "**Module** — published Move code. A **package** groups modules.",
        "**Object** — on-chain entity with its own address that can hold resources.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100,000,000 octas.",
        "**Resource** — typed Move data stored under an account or object.",
        "**Sequence number** — per-account counter that orders that account’s transactions.",
        "**Transaction version** — global ledger version (integer) assigned when a transaction is ordered.",
        "**Write-set / changes** — state the transaction wrote.",
      ],
    },
    troubleshooting: {
      title: "Troubleshooting",
      bullets: [
        "**Empty or spinning pages** — check the network selector and whether you are on Local without a node. Try another network or wait out a 429.",
        "**Transaction not found** — confirm version/hash and network. Very old versions may load from archive/indexer with fewer fields.",
        "**Search missed a pruned hash** — hash lookup uses the fullnode then archive (without the explorer API key). Indexer cannot search by hash.",
        "**Decompiled / Disassembly missing** — enable decompilation in [Settings](/settings) and accept the disclaimer.",
        "**Wrong chain** — look at `?network=` and the header dropdown.",
        "**Stale search hits** — footer **Clear Cache**.",
        "**Analytics missing** — switch to mainnet.",
        "**Wallet will not submit** — match wallet network to the explorer; reconnect after switching.",
      ],
    },
  },
  common,
  network,
  errors,
  wallet,
  share,
  rateLimit,
  feature,
  copyHints,
  interval,
  tabs,
  fields,
  table,
  txn,
  pages,
  notFound,
  verificationPage,
  tooltips,
  verified,
  staking,
  analytics,
  filter,
  flags,
  deployments,
  aips,
  contract,
  script,
  payments,
  payload,
  txnModules,
  activity,
  snackbar,
  hexBytes,
  modules,
  accountUi,
  confidential,
  releasesUi,
  signature,
  trace,
  decibel,
  multisig,
} as const satisfies MessageTree;

type DeepStringLeaves<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? {[I in keyof T]: DeepStringLeaves<T[I]>}
    : T extends object
      ? {[K in keyof T]: DeepStringLeaves<T[K]>}
      : T;

export type EnglishMessages = DeepStringLeaves<typeof en>;
