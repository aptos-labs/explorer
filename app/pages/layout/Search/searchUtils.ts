import type {Aptos} from "@aptos-labs/ts-sdk";
import type {QueryClient} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {
  fetchBlockFromArchival,
  headersFromAptosClient,
  networkNameFromAptosClient,
  transactionHashExists,
} from "../../../api/archivalNode";
import type {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {getBlockHeightForVersion} from "../../../api/indexerTransaction";
import {getAccountResourceV2, getAccountV2} from "../../../api/v2";
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

export type SearchLedgerBounds = {
  ledger_version: string;
  block_height: string;
  oldest_ledger_version?: string;
  oldest_block_height?: string;
};

/**
 * Parse a search box integer (block height or txn version). Rejects
 * negatives; strips leading zeros so `BigInt` does not throw.
 */
export function parseNumericSearch(text: string): bigint | null {
  if (!/^\d+$/.test(text)) return null;
  const stripped = text.replace(/^0+(?=\d)/, "");
  return BigInt(stripped);
}

/**
 * Build Block / Transaction search hits from ledger bounds.
 *
 * Aptos versions and block heights are contiguous from 0. Anything at or
 * below the current ledger/height exists even when the serving fullnode has
 * pruned it, so search must not wait on a full REST body (or a slow archival
 * retry) just to decide whether to show a result.
 */
export function buildNumericSearchResults(
  searchText: string,
  ledger: SearchLedgerBounds,
): SearchResult[] {
  const version = parseNumericSearch(searchText);
  if (version === null) return [];

  const results: SearchResult[] = [];
  const labelNumber = version.toString();

  if (version <= BigInt(ledger.block_height)) {
    results.push({
      label: `Block ${labelNumber}`,
      to: `/block/${labelNumber}`,
      type: "block",
    });
  }
  if (version <= BigInt(ledger.ledger_version)) {
    results.push({
      label: `Transaction Version ${labelNumber}`,
      to: `/txn/${labelNumber}`,
      type: "transaction",
    });
  }
  return results;
}

export function buildContainingBlockSearchResult(
  searchText: string,
  blockHeight: bigint,
): SearchResult {
  const version = parseNumericSearch(searchText);
  const labelNumber = version !== null ? version.toString() : searchText;
  return {
    label: `Block with Txn Version ${labelNumber}`,
    to: `/block/${blockHeight.toString()}`,
    type: "block",
  };
}

async function lookupContainingBlockHeight(
  version: bigint,
  ledger: SearchLedgerBounds,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<bigint | null> {
  if (signal?.aborted) return null;

  const oldest = ledger.oldest_ledger_version
    ? BigInt(ledger.oldest_ledger_version)
    : 0n;
  const inNodeWindow = version >= oldest;

  if (inNodeWindow) {
    try {
      const block = await sdkV2Client.getBlockByVersion({
        ledgerVersion: version,
        options: {withTransactions: false},
      });
      return BigInt(block.block_height);
    } catch {
      // Fall through to the archive node for pruned or failed REST.
    }
  }

  const fullnode = sdkV2Client.config?.fullnode;
  if (fullnode) {
    try {
      const archived = await fetchBlockFromArchival(
        fullnode,
        {version, withTransactions: false},
        headersFromAptosClient(sdkV2Client),
        signal,
        networkNameFromAptosClient(sdkV2Client),
      );
      if (
        archived &&
        typeof archived === "object" &&
        "block_height" in archived &&
        (archived as {block_height?: unknown}).block_height != null
      ) {
        return BigInt(
          String((archived as {block_height: string | number}).block_height),
        );
      }
    } catch {
      // Archive miss: try the indexer.
    }
  }

  try {
    const height = await getBlockHeightForVersion(
      sdkV2Client,
      version.toString(),
    );
    if (height !== null) return BigInt(height);
  } catch {
    return null;
  }
  return null;
}

/**
 * Handle block height or version lookup.
 *
 * Uses ledger info (tiny JSON) instead of fetching full transaction/block
 * payloads, so pruned versions still appear and search stays fast.
 */
export async function handleBlockHeightOrVersion(
  searchText: string,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  if (signal?.aborted) return [];

  const version = parseNumericSearch(searchText);
  if (version === null) return [];

  let ledger: SearchLedgerBounds;
  try {
    ledger = await sdkV2Client.getLedgerInfo();
  } catch {
    return [];
  }
  if (signal?.aborted) return [];

  const results = buildNumericSearchResults(searchText, ledger);

  if (version <= BigInt(ledger.ledger_version)) {
    const blockHeight = await lookupContainingBlockHeight(
      version,
      ledger,
      sdkV2Client,
      signal,
    );
    if (signal?.aborted) return results;
    if (blockHeight !== null) {
      results.push(buildContainingBlockSearchResult(searchText, blockHeight));
    }
  }

  return results;
}

/**
 * Handle transaction lookup by hash.
 *
 * Confirms existence with a status check (body cancelled) against the
 * fullnode, then the archive node without API credentials so pruned hashes
 * still match. Avoids downloading the full REST payload. The indexer has no
 * hash column.
 */
export async function handleTransaction(
  searchText: string,
  sdkV2Client: Aptos,
  signal?: AbortSignal,
): Promise<SearchResult | null> {
  if (signal?.aborted) return null;

  const fullnode = sdkV2Client.config.fullnode;
  if (!fullnode) return null;

  const exists = await transactionHashExists(
    fullnode,
    searchText,
    headersFromAptosClient(sdkV2Client),
    signal,
    networkNameFromAptosClient(sdkV2Client),
  );
  if (!exists || signal?.aborted) return null;

  return {
    label: `Transaction ${searchText}`,
    to: `/txn/${searchText}`,
    type: "transaction",
  };
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

  // Check FA metadata and ObjectCore in parallel. Do not fetch the full
  // resource list: `/accounts/{addr}/resources` can be megabytes (e.g. 0x1)
  // and the Address fallback already covers "no typed hit".
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
  ];

  const resourceResults = await Promise.all(resourcePromises);
  results.push(...resourceResults.filter((r): r is SearchResult => r !== null));

  return results;
}

/**
 * Handle label lookup from known addresses
 * Uses network-specific known addresses based on current network
 */
export function handleLabelLookup(
  searchText: string,
  networkName: NetworkName,
): SearchResult[] {
  const searchResults: SearchResult[] = [];
  const searchLowerCase = searchText.toLowerCase();
  const knownAddresses = getKnownAddresses(networkName);
  Object.entries(knownAddresses).forEach(([address, knownName]) => {
    if (prefixMatchLongerThan3(searchLowerCase, knownName)) {
      searchResults.push({
        label: `Account ${truncateAddress(address)} ${knownName}`,
        to: `/account/${address}`,
        identiconKey: address,
        type: "account",
      });
    }
  });
  return searchResults;
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

/**
 * Group search results by asset type
 */
export function groupSearchResults(results: SearchResult[]): SearchResult[] {
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

  // Define priority order for types - assets (coins/fungible assets) first
  const typeOrder = [
    "asset",
    "account",
    "transaction",
    "block",
    "object",
    "address",
    "other",
  ];

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
