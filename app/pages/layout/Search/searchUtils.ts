import type {Aptos} from "@aptos-labs/ts-sdk";
import type {QueryClient} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import type {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {
  getAccountResourcesV2,
  getAccountResourceV2,
  getAccountV2,
  getBlockByHeight,
  getBlockByVersion,
  getTransactionV2,
} from "../../../api/v2";
import {getEmojicoinMarketAddressAndTypeTags} from "../../../components/Table/VerifiedCell";
import {faMetadataResource, objectCoreResource} from "../../../constants";
import {getKnownAddresses} from "../../../data";
import type {NetworkName} from "../../../lib/constants";
import {getAssetSymbol, tryStandardizeAddress} from "../../../utils";
import {
  coinOrderIndex,
  is32ByteHex,
  isNumeric,
  isValidAccountAddress,
  isValidStruct,
  truncateAddress,
} from "../../utils";

export type SearchResult = {
  label: string;
  to: string | null;
  image?: string;
  /**
   * Seed for search-row identicons: standardized account address when applicable,
   * or any stable string (e.g. coin type) for blockies when there is no `image`.
   */
  identiconKey?: string;
  type?: string; // Asset type for grouping: 'account', 'coin', 'transaction', 'block', 'fungible-asset', 'object', 'address'
  isGroupHeader?: boolean; // True if this is a group header
};

export const NotFoundResult: SearchResult = {
  label: "No Results",
  to: null,
};

/**
 * Normalize search input for caching
 */
export function normalizeSearchInput(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Generate cache key for search results
 */
export function getSearchCacheKey(
  network: string,
  normalizedInput: string,
): string {
  return `search_${network}_${normalizedInput}`;
}

/**
 * Detect input type to optimize query strategy
 */
export function detectInputType(searchText: string): {
  isAnsName: boolean;
  isStruct: boolean;
  isValidBlockHeightOrVer: boolean;
  is32Hex: boolean;
  isValidAccountAddr: boolean;
  isEmoji: boolean;
  isGeneric: boolean;
} {
  let normalizedText = searchText;
  if (normalizedText.endsWith(".petra")) {
    normalizedText = `${normalizedText}.apt`;
  }

  return {
    isAnsName: normalizedText.endsWith(".apt"),
    isStruct: isValidStruct(normalizedText),
    isValidBlockHeightOrVer: isNumeric(normalizedText),
    is32Hex: is32ByteHex(normalizedText),
    isValidAccountAddr: isValidAccountAddress(normalizedText),
    isEmoji: Boolean(normalizedText.match(/^\p{Emoji}+$/gu)),
    isGeneric: normalizedText.length > 2,
  };
}

/**
 * Check if a result is definitive (exact match that doesn't need further queries)
 */
export function isDefinitiveResult(result: SearchResult | null): boolean {
  if (!result) return false;
  // Exact account matches are definitive
  if (result.label.startsWith("Account") && !result.label.includes("Address")) {
    return true;
  }
  // Exact transaction matches are definitive
  if (result.label.startsWith("Transaction")) {
    return true;
  }
  // Exact block matches are definitive
  if (result.label.startsWith("Block")) {
    return true;
  }
  return false;
}

/**
 * Prefix match helper for search
 */
export function prefixMatchLongerThan3(
  searchLowerCase: string,
  knownName: string | null | undefined,
): boolean {
  if (!knownName) {
    return false;
  }
  const knownLower = knownName.toLowerCase();
  return (
    (searchLowerCase.length >= 3 &&
      (knownLower.startsWith(searchLowerCase) ||
        knownLower.includes(searchLowerCase))) ||
    (searchLowerCase.length < 3 && knownLower === searchLowerCase)
  );
}

/**
 * Relevance tiers for ranking text matches. Higher is more relevant. These are
 * spaced apart so that a small per-field weight (see {@link scoreCoinRelevance})
 * can break ties without letting a weaker match tier overtake a stronger one.
 */
export const MATCH_RELEVANCE = {
  none: 0,
  substring: 25,
  wordPrefix: 50,
  prefix: 75,
  exact: 100,
} as const;

/**
 * Score how well a query matches a single candidate string. The score reflects
 * match quality (exact > prefix > word-boundary prefix > substring) rather than
 * just whether the strings overlap, so the most intentional matches rank first.
 */
export function scoreTextMatch(
  query: string,
  candidate: string | null | undefined,
): number {
  if (!candidate) {
    return MATCH_RELEVANCE.none;
  }
  const q = query.trim().toLowerCase();
  const c = candidate.trim().toLowerCase();
  if (!q || !c) {
    return MATCH_RELEVANCE.none;
  }
  if (c === q) {
    return MATCH_RELEVANCE.exact;
  }
  if (c.startsWith(q)) {
    return MATCH_RELEVANCE.prefix;
  }
  // A word inside the candidate starts with the query (e.g. "usd" in "Wrapped USD").
  if (c.split(/[\s\-_/.]+/).some((word) => word.startsWith(q))) {
    return MATCH_RELEVANCE.wordPrefix;
  }
  if (c.includes(q)) {
    return MATCH_RELEVANCE.substring;
  }
  return MATCH_RELEVANCE.none;
}

/**
 * Relevance score for an account label (known-address name) match. Used to rank
 * known-address results so the closest label match surfaces first.
 */
export function scoreLabelRelevance(
  searchText: string,
  label: string | null | undefined,
): number {
  return scoreTextMatch(searchText, label);
}

// An exact address match is the strongest possible signal: the user pasted the
// asset's own address, so it should outrank any name/symbol text match.
const ADDRESS_MATCH_RELEVANCE = 1000;
// Symbol matches edge out equally-tiered name matches because the ticker is the
// most intentional way to search for a token (e.g. "USDC" should prefer the coin
// whose symbol is USDC over a coin merely named "... USDC ...").
const SYMBOL_FIELD_BONUS = 1;

/**
 * Relevance score for a coin/fungible-asset list entry. Combines exact address
 * matches with the best text match across the coin's symbol, Panora symbol, and
 * name so that ranking reflects how well the entry matches the query.
 */
export function scoreCoinRelevance(
  searchText: string,
  coin: CoinDescription,
): number {
  const q = searchText.trim().toLowerCase();
  if (!q) {
    return MATCH_RELEVANCE.none;
  }

  const standardizedQuery = tryStandardizeAddress(searchText);
  const matchesAddress =
    (coin.faAddress != null &&
      standardizedQuery != null &&
      tryStandardizeAddress(coin.faAddress) === standardizedQuery) ||
    coin.tokenAddress === searchText;
  if (matchesAddress) {
    return ADDRESS_MATCH_RELEVANCE;
  }

  const symbolScore = Math.max(
    scoreTextMatch(q, coin.symbol),
    scoreTextMatch(q, coin.panoraSymbol),
  );
  const nameScore = scoreTextMatch(q, coin.name);
  const weightedSymbolScore =
    symbolScore > 0 ? symbolScore + SYMBOL_FIELD_BONUS : 0;

  return Math.max(weightedSymbolScore, nameScore);
}

/**
 * Handle ANS name lookup using React Query cache
 */
export async function handleAnsName(
  searchText: string,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<SearchResult | null> {
  if (signal?.aborted) return null;

  try {
    // ANS names must be lowercase for API compatibility
    const normalizedName = searchText.toLowerCase();
    const ansName = await sdkV2Client.getName({
      name: normalizedName,
    });
    const address = ansName?.registered_address ?? ansName?.owner_address;

    if (ansName && address) {
      const std = tryStandardizeAddress(address) ?? address;
      return {
        label: `Account ${truncateAddress(address)} ${searchText}`,
        to: `/account/${address}`,
        identiconKey: std,
        type: "account",
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Handle coin lookup by struct type
 */
export async function handleCoin(
  searchText: string,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<SearchResult | null> {
  if (signal?.aborted) return null;

  const address = searchText.split("::")[0];
  try {
    await getAccountResourceV2(
      {address, resourceType: `0x1::coin::CoinInfo<${searchText}>`},
      sdkV2Client,
    );
    const moduleAddr = searchText.split("::")[0];
    const stdMod = tryStandardizeAddress(moduleAddr);
    return {
      label: `Coin ${searchText}`,
      to: `/coin/${searchText}`,
      identiconKey: stdMod ?? searchText,
      type: "coin",
    };
  } catch {
    return null;
  }
}

/**
 * Combine the three numeric lookups (block-by-height, transaction-by-version,
 * block-by-version) into an ordered, de-duplicated result list.
 *
 * A bare number is ambiguous: it can be a block height, a transaction version,
 * or a version contained by some block. We surface every interpretation that
 * resolves, but drop the "block containing this version" entry when it points
 * to the same block as the height lookup, so we never render two identical
 * block rows for the same query.
 */
export function buildNumericSearchResults(
  blockByHeight: SearchResult | null,
  txnByVersion: SearchResult | null,
  blockByVersion: SearchResult | null,
): SearchResult[] {
  const results: SearchResult[] = [];
  if (blockByHeight) {
    results.push(blockByHeight);
  }
  if (txnByVersion) {
    results.push(txnByVersion);
  }
  if (blockByVersion && blockByVersion.to !== blockByHeight?.to) {
    results.push(blockByVersion);
  }
  return results;
}

/**
 * Handle block height or version lookup
 */
export async function handleBlockHeightOrVersion(
  searchText: string,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  if (signal?.aborted) return [];

  const num = parseInt(searchText, 10);

  // Try block by height, transaction by version, and block by version in parallel
  const [blockByHeight, txnByVersion, blockByVersion] = await Promise.all([
    getBlockByHeight({height: num, withTransactions: false}, sdkV2Client)
      .then(
        (): SearchResult => ({
          label: `Block ${num}`,
          to: `/block/${num}`,
          type: "block",
        }),
      )
      .catch(() => null),
    getTransactionV2({txnHashOrVersion: num}, sdkV2Client)
      .then(
        (): SearchResult => ({
          label: `Transaction Version ${num}`,
          to: `/txn/${num}`,
          type: "transaction",
        }),
      )
      .catch(() => null),
    getBlockByVersion({version: num, withTransactions: false}, sdkV2Client)
      .then(
        (block): SearchResult => ({
          label: `Block with Txn Version ${num}`,
          to: `/block/${block.block_height}`,
          type: "block",
        }),
      )
      .catch(() => null),
  ]);

  return buildNumericSearchResults(blockByHeight, txnByVersion, blockByVersion);
}

/**
 * Handle transaction lookup
 */
export async function handleTransaction(
  searchText: string,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<SearchResult | null> {
  if (signal?.aborted) return null;

  try {
    await getTransactionV2({txnHashOrVersion: searchText}, sdkV2Client);
    return {
      label: `Transaction ${searchText}`,
      to: `/txn/${searchText}`,
      type: "transaction",
    };
  } catch {
    return null;
  }
}

/**
 * Handle address lookup with optimized resource checks
 */
export async function handleAddress(
  searchText: string,
  sdkV2Client: Aptos,
  queryClient: QueryClient,
  networkValue: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  if (signal?.aborted) return [];

  const address = tryStandardizeAddress(searchText);
  if (!address) {
    return [];
  }

  const results: SearchResult[] = [];

  // Use React Query cache for account lookup
  const accountQueryKey = ["account", {address}, networkValue];
  const accountCached =
    queryClient.getQueryData<Types.AccountData>(accountQueryKey);

  // Try account first (fastest)
  const accountPromise = accountCached
    ? Promise.resolve(accountCached)
    : getAccountV2({address}, sdkV2Client);

  try {
    await accountPromise;
    results.push({
      label: `Account ${address}`,
      to: `/account/${address}`,
      identiconKey: address,
      type: "account",
    });
  } catch {
    // Account doesn't exist, continue checking other types
  }

  // Check resources in parallel
  const resourcePromises: Promise<SearchResult | null>[] = [
    getAccountResourceV2(
      {address, resourceType: faMetadataResource},
      sdkV2Client,
    )
      .then(
        (): SearchResult => ({
          label: `Fungible Asset ${address}`,
          to: `/fungible_asset/${address}`,
          identiconKey: address,
          type: "fungible-asset",
        }),
      )
      .catch(() => null),
    getAccountResourceV2(
      {address, resourceType: objectCoreResource},
      sdkV2Client,
    )
      .then(
        (): SearchResult => ({
          label: `Object ${address}`,
          to: `/object/${address}`,
          identiconKey: address,
          type: "object",
        }),
      )
      .catch(() => null),
    getAccountResourcesV2({address}, sdkV2Client)
      .then(
        (): SearchResult => ({
          label: `Address ${address}`,
          to: `/account/${address}`,
          identiconKey: address,
          type: "address",
        }),
      )
      .catch(() => null),
  ];

  const resourceResults = await Promise.all(resourcePromises);
  results.push(...resourceResults.filter((r): r is SearchResult => r !== null));

  return results;
}

/**
 * Handle slow owned objects query (only used as fallback)
 */
export async function anyOwnedObjects(
  searchText: string,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<SearchResult | null> {
  if (signal?.aborted) return null;

  const address = tryStandardizeAddress(searchText);
  if (!address) {
    return null;
  }

  try {
    const output = await sdkV2Client.getAccountOwnedObjects({
      accountAddress: address,
    });
    if (output.length > 0) {
      return {
        label: `Address ${address}`,
        to: `/account/${address}`,
        identiconKey: address,
        type: "address",
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Handle label lookup from known addresses
 * Uses network-specific known addresses based on current network
 */
export function handleLabelLookup(
  searchText: string,
  networkName: NetworkName,
): SearchResult[] {
  const searchLowerCase = searchText.toLowerCase();
  const knownAddresses = getKnownAddresses(networkName);
  const matches: {result: SearchResult; relevance: number}[] = [];
  Object.entries(knownAddresses).forEach(([address, knownName]) => {
    if (prefixMatchLongerThan3(searchLowerCase, knownName)) {
      matches.push({
        result: {
          label: `Account ${truncateAddress(address)} ${knownName}`,
          to: `/account/${address}`,
          identiconKey: address,
          type: "account",
        },
        relevance: scoreLabelRelevance(searchLowerCase, knownName),
      });
    }
  });
  // Surface the closest label match first (exact > prefix > substring).
  return matches
    .sort((a, b) => b.relevance - a.relevance)
    .map((match) => match.result);
}

/**
 * Handle coin lookup from coin list
 */
export function handleCoinLookup(
  searchText: string,
  coinList: CoinDescription[] | undefined,
): SearchResult[] {
  if (!coinList) return [];

  const searchLowerCase = searchText.toLowerCase();
  const coinData = coinList
    .filter(
      (coin: CoinDescription) =>
        !coin.isBanned &&
        !coin.panoraTags.includes("InternalFA") &&
        coin.panoraTags.length > 0 &&
        (prefixMatchLongerThan3(searchLowerCase, coin.name) ||
          prefixMatchLongerThan3(searchLowerCase, coin.symbol) ||
          prefixMatchLongerThan3(searchLowerCase, coin.panoraSymbol) ||
          (coin.faAddress &&
            tryStandardizeAddress(coin.faAddress) ===
              tryStandardizeAddress(searchText)) ||
          coin.tokenAddress === searchText),
    )
    .sort((coin: CoinDescription, coin2: CoinDescription) => {
      // Rank by how well each coin matches the query first, then fall back to
      // the static popularity index so equally-relevant coins keep their order.
      const relevanceDiff =
        scoreCoinRelevance(searchLowerCase, coin2) -
        scoreCoinRelevance(searchLowerCase, coin);
      if (relevanceDiff !== 0) {
        return relevanceDiff;
      }
      return coinOrderIndex(coin) - coinOrderIndex(coin2);
    })
    .map((coin: CoinDescription) => {
      if (coin.tokenAddress) {
        const key =
          tryStandardizeAddress(coin.tokenAddress) ?? coin.tokenAddress;
        return {
          label: `${coin.name} - ${getAssetSymbol(coin.panoraSymbol, coin.bridge, coin.symbol)}`,
          to: `/coin/${coin.tokenAddress}`,
          image: coin.logoUrl,
          identiconKey: key,
          type: "coin",
        };
      } else {
        const fa = coin.faAddress ?? "";
        const key = tryStandardizeAddress(fa) ?? fa;
        return {
          label: `${coin.name} - ${getAssetSymbol(coin.panoraSymbol, coin.bridge, coin.symbol)}`,
          to: `/fungible_asset/${coin.faAddress}`,
          image: coin.logoUrl,
          identiconKey: key,
          type: "fungible-asset",
        };
      }
    });

  return coinData;
}

/**
 * Fallback address result for valid account addresses with no on-chain data yet.
 */
export function createFallbackAddressResult(
  searchText: string,
): SearchResult | null {
  const address = tryStandardizeAddress(searchText);
  if (!address) {
    return null;
  }
  return {
    label: `Address ${address}`,
    to: `/account/${address}`,
    identiconKey: address,
    type: "address",
  };
}

/**
 * Handle emoji coin lookup
 */
export async function handleEmojiCoinLookup(
  searchText: string,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  if (signal?.aborted) return [];

  const emojicoinData = getEmojicoinMarketAddressAndTypeTags({
    symbol: searchText,
  });
  if (!emojicoinData) {
    return [];
  }
  const {marketAddress, coin, lp} = emojicoinData;
  try {
    await getAccountV2({address: marketAddress.toString()}, sdkV2Client);
    const coinIconKey = tryStandardizeAddress(coin.split("::")[0]) ?? coin;
    const lpIconKey = tryStandardizeAddress(lp.split("::")[0]) ?? lp;
    return [
      {
        label: `${searchText} emojicoin`,
        to: `/coin/${coin}`,
        identiconKey: coinIconKey,
        type: "coin",
      },
      {
        label: `${searchText} emojicoin LP`,
        to: `/coin/${lp}`,
        identiconKey: lpIconKey,
        type: "coin",
      },
    ];
  } catch {
    return [];
  }
}

/**
 * Extract asset type from result label
 */
function getResultType(result: SearchResult): string {
  // Map coin and fungible-asset to unified "asset" category
  if (result.type === "coin" || result.type === "fungible-asset") {
    return "asset";
  }
  if (result.type) {
    return result.type;
  }
  const label = result.label.toLowerCase();
  if (label.startsWith("account") && !label.includes("address")) {
    return "account";
  }
  if (label.startsWith("coin") || label.startsWith("fungible asset")) {
    return "asset"; // Combined coins and fungible assets
  }
  if (label.startsWith("transaction")) {
    return "transaction";
  }
  if (label.startsWith("block")) {
    return "block";
  }
  if (label.startsWith("object")) {
    return "object";
  }
  if (label.startsWith("address")) {
    return "address";
  }
  return "other";
}

/**
 * Get display name for asset type
 */
function getTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    account: "Accounts",
    asset: "Assets", // Combined coins and fungible assets
    transaction: "Transactions",
    block: "Blocks",
    object: "Objects",
    address: "Addresses",
    other: "Other",
  };
  return typeMap[type] || type;
}

/**
 * Filter and deduplicate search results
 */
export function filterSearchResults(
  resultsList: (SearchResult | null)[],
): SearchResult[] {
  const foundAccount = resultsList.find((r) => r?.label?.startsWith("Account"));
  const foundFa = resultsList.find((r) =>
    r?.label?.startsWith("Fungible Asset"),
  );
  const foundObject = resultsList.find((r) => r?.label?.startsWith("Object"));
  const foundPossibleAddress = resultsList.find((r) =>
    r?.label?.startsWith("Address"),
  );
  const foundCoinByList = resultsList.find(
    (r) => r?.label?.startsWith("Coin") && !r?.label?.startsWith("Coin 0x"),
  );
  const foundCoinByStruct = resultsList.find((r) =>
    r?.label?.startsWith("Coin 0x"),
  );

  let filteredResults: (SearchResult | null)[];

  switch (true) {
    case Boolean(foundCoinByList): {
      filteredResults = resultsList.filter((r) => r !== foundCoinByStruct);
      break;
    }
    case Boolean(foundFa): {
      filteredResults = resultsList.filter((r) => r !== foundPossibleAddress);
      break;
    }
    case Boolean(foundAccount): {
      filteredResults = resultsList.filter((r) => r !== foundPossibleAddress);
      break;
    }
    case Boolean(foundObject): {
      filteredResults = resultsList.filter((r) => r !== foundPossibleAddress);
      break;
    }
    default: {
      filteredResults = resultsList;
    }
  }

  return filteredResults
    .filter((result) => result !== null)
    .filter((result): result is SearchResult => !!result);
}

export type GroupSearchResultsOptions = {
  /**
   * Surface transaction results before everything else. Used for ambiguous
   * 64-character hex queries, where a fully-expanded hash is most commonly a
   * transaction hash rather than an account/object address — so a confirmed
   * transaction match should win the Enter-key / single-result auto-navigate
   * instead of being buried beneath asset/account matches.
   */
  prioritizeTransactions?: boolean;
};

// Default type ordering — assets (coins/fungible assets) first.
const DEFAULT_TYPE_ORDER = [
  "asset",
  "account",
  "transaction",
  "block",
  "object",
  "address",
  "other",
];

// Ordering for ambiguous hex queries — confirmed transactions first.
const TRANSACTION_FIRST_TYPE_ORDER = [
  "transaction",
  "asset",
  "account",
  "block",
  "object",
  "address",
  "other",
];

/**
 * Group search results by asset type
 */
export function groupSearchResults(
  results: SearchResult[],
  options?: GroupSearchResultsOptions,
): SearchResult[] {
  if (results.length === 0) {
    return results;
  }

  // Filter out any existing group headers to avoid duplicates
  const resultsWithoutHeaders = results.filter(
    (result) => !result.isGroupHeader,
  );

  // Group results by type
  const grouped = new Map<string, SearchResult[]>();
  for (const result of resultsWithoutHeaders) {
    const type = getResultType(result);
    if (!grouped.has(type)) {
      grouped.set(type, []);
    }
    const bucket = grouped.get(type);
    if (bucket) {
      bucket.push(result);
    }
  }

  const typeOrder = options?.prioritizeTransactions
    ? TRANSACTION_FIRST_TYPE_ORDER
    : DEFAULT_TYPE_ORDER;

  // Build grouped results array with headers
  const groupedResults: SearchResult[] = [];
  for (const type of typeOrder) {
    const typeResults = grouped.get(type);
    if (typeResults && typeResults.length > 0) {
      // Always add group header
      groupedResults.push({
        label: getTypeDisplayName(type),
        to: null,
        type,
        isGroupHeader: true,
      });
      groupedResults.push(...typeResults);
    }
  }

  return groupedResults;
}
