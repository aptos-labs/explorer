import {QueryClient} from "@tanstack/react-query";
import {Types} from "aptos";
import {Aptos} from "@aptos-labs/ts-sdk";
import {
  faMetadataResource,
  knownAddresses,
  objectCoreResource,
} from "../../../constants";
import {
  isValidAccountAddress,
  isNumeric,
  truncateAddress,
  is32ByteHex,
  isValidStruct,
  coinOrderIndex,
} from "../../utils";
import {getAssetSymbol, tryStandardizeAddress} from "../../../utils";
import {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {getEmojicoinMarketAddressAndTypeTags} from "../../../components/Table/VerifiedCell";
import {
  getBlockByHeight,
  getBlockByVersion,
  getAccountV2,
  getAccountResourcesV2,
  getAccountResourceV2,
  getTransactionV2,
} from "../../../api/v2";

export type SearchResult = {
  label: string;
  to: string | null;
  image?: string;
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
    normalizedText = normalizedText.concat(".apt");
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
    (searchLowerCase.length < 3 && knownLower.toLowerCase() === searchLowerCase)
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
    const ansName = await sdkV2Client.getName({
      name: searchText,
    });
    const address = ansName?.registered_address ?? ansName?.owner_address;

    if (ansName && address) {
      return {
        label: `Account ${truncateAddress(address)} ${searchText}`,
        to: `/account/${address}`,
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
    return {
      label: `Coin ${searchText}`,
      to: `/coin/${searchText}`,
      type: "coin",
    };
  } catch {
    return null;
  }
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

  const num = parseInt(searchText);
  const results: SearchResult[] = [];

  // Try block by height, transaction by version, and block by version in parallel
  const promises = [
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
  ];

  const resolved = await Promise.all(promises);
  results.push(...resolved.filter((r): r is SearchResult => r !== null));

  return results;
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
          type: "object",
        }),
      )
      .catch(() => null),
    getAccountResourcesV2({address}, sdkV2Client)
      .then(
        (): SearchResult => ({
          label: `Address ${address}`,
          to: `/account/${address}`,
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
 */
export function handleLabelLookup(searchText: string): SearchResult[] {
  const searchResults: SearchResult[] = [];
  const searchLowerCase = searchText.toLowerCase();
  Object.entries(knownAddresses).forEach(([address, knownName]) => {
    if (prefixMatchLongerThan3(searchLowerCase, knownName)) {
      searchResults.push({
        label: `Account ${truncateAddress(address)} ${knownName}`,
        to: `/account/${address}`,
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
        return {
          label: `${coin.name} - ${getAssetSymbol(coin.panoraSymbol, coin.bridge, coin.symbol)}`,
          to: `/coin/${coin.tokenAddress}`,
          image: coin.logoUrl,
          type: "coin",
        };
      } else {
        return {
          label: `${coin.name} - ${getAssetSymbol(coin.panoraSymbol, coin.bridge, coin.symbol)}`,
          to: `/fungible_asset/${coin.faAddress}`,
          image: coin.logoUrl,
          type: "fungible-asset",
        };
      }
    });

  return coinData;
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
    return [
      {
        label: `${searchText} emojicoin`,
        to: `/coin/${coin}`,
        type: "coin",
      },
      {
        label: `${searchText} emojicoin LP`,
        to: `/coin/${lp}`,
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
  if (result.type) {
    return result.type;
  }
  const label = result.label.toLowerCase();
  if (label.startsWith("account") && !label.includes("address")) {
    return "account";
  }
  if (label.startsWith("coin")) {
    return "coin";
  }
  if (label.startsWith("transaction")) {
    return "transaction";
  }
  if (label.startsWith("block")) {
    return "block";
  }
  if (label.startsWith("fungible asset")) {
    return "fungible-asset";
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
    coin: "Coins",
    transaction: "Transactions",
    block: "Blocks",
    "fungible-asset": "Fungible Assets",
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
    grouped.get(type)!.push(result);
  }

  // Define priority order for types - coins and fungible assets first
  const typeOrder = [
    "coin",
    "fungible-asset",
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
