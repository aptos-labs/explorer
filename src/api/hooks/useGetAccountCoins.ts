import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {standardizeAddress} from "../../utils";
import {InputViewFunctionData} from "@aptos-labs/ts-sdk";
import {nativeTokens} from "../../constants";

// MOVE token identifiers for display
const APTOS_COIN_TYPE = "0x1::aptos_coin::AptosCoin";
const MOVE_FA_ADDRESS_SHORT = "0xa";

const FA_BALANCES_QUERY = `
    query FungibleAssetBalances($owner_address: String, $limit: Int, $offset: Int) {
        current_fungible_asset_balances(
            where: {owner_address: {_eq: $owner_address}}
            limit: $limit
            offset: $offset
        ) {
            amount_v1
            asset_type_v1
            amount_v2
            asset_type_v2
            metadata {
                name
                decimals
                symbol
                token_standard
            }
        }
    }
`;

const COIN_COUNT_QUERY = `
    query GetFungibleAssetCount($address: String) {
        current_fungible_asset_balances_aggregate(
            where: {owner_address: {_eq: $address}}
            order_by: {amount: desc}
        ) {
            aggregate {
                count
            }
        }
    }
`;

export function useGetAccountCoinCount(address: string) {
  const [state] = useGlobalState();
  const standardizedAddress = standardizeAddress(address);

  return useQuery<number, ResponseError>({
    queryKey: ["coinCount", address],
    // TODO type this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<any> => {
      const response = await state.sdk_v2_client?.queryIndexer<{
        current_fungible_asset_balances_aggregate: {aggregate: {count: number}};
      }>({
        query: {
          query: COIN_COUNT_QUERY,
          variables: {
            address: standardizedAddress,
          },
        },
      });

      return response?.current_fungible_asset_balances_aggregate.aggregate.count;
    },
  });
}

type FaBalance = {
  amount_v1?: number;
  asset_type_v1?: string;
  amount_v2?: number;
  asset_type_v2?: string;
  metadata: {
    name: string;
    decimals: number;
    symbol: string;
    token_standard: string;
  };
};

export type UnifiedCoinBalance = {
  amount_v2: number;
  asset_type_v2: string;
  metadata: {
    name: string;
    decimals: number;
    symbol: string;
    token_standard: string;
  };
  is_v1_coin?: boolean;
};

export function useGetAccountCoins(address: string) {
  const [state] = useGlobalState();
  const standardizedAddress = standardizeAddress(address);

  // Get count first
  const count = useGetAccountCoinCount(address);

  // Now retrieve all the coins
  const PAGE_SIZE = 100;

  return useQuery<UnifiedCoinBalance[], ResponseError>({
    queryKey: ["coinQuery", address, count.data],
    enabled: count.data !== undefined, // Wait for count query to complete
    queryFn: async (): Promise<UnifiedCoinBalance[]> => {
      let faBalances: FaBalance[] = [];

      // Step 1: Fetch balances from GraphQL (current_fungible_asset_balances)
      // This table has amount_v1 for v1 Coin balances, but v2 FA balances are NOT reliably indexed
      if (count.data && count.data > 0) {
        const promises = [];
        for (let i = 0; i < count.data; i += PAGE_SIZE) {
          promises.push(
            state.sdk_v2_client.queryIndexer<{
              current_fungible_asset_balances: FaBalance[];
            }>({
              query: {
                query: FA_BALANCES_QUERY,
                variables: {
                  owner_address: standardizedAddress,
                  limit: PAGE_SIZE,
                  offset: i,
                },
              },
            }),
          );
        }

        const responses = await Promise.all(promises);
        faBalances = responses.flatMap(
          (r) => r.current_fungible_asset_balances,
        );
      }

      // Step 2: Get v2 FA MOVE balance from view function
      // The indexer doesn't reliably return v2 FA balances, so we fetch directly from chain
      let faMoveBal = 0;
      try {
        const payload: InputViewFunctionData = {
          function: "0x1::primary_fungible_store::balance",
          typeArguments: ["0x1::object::ObjectCore"],
          functionArguments: [standardizedAddress, MOVE_FA_ADDRESS_SHORT],
        };
        const result = await state.sdk_v2_client.view<[string]>({payload});
        faMoveBal = parseInt(result[0] || "0", 10);
      } catch {
        // User may not have FA MOVE, that's okay
        faMoveBal = 0;
      }

      return processCoinsData(faBalances, faMoveBal);
    },
  });
}

function processCoinsData(
  faBalances: FaBalance[],
  faMoveBalance: number,
): UnifiedCoinBalance[] {
  const result: UnifiedCoinBalance[] = [];

  // Process GraphQL balance records
  // The GraphQL table (current_fungible_asset_balances) returns:
  // - amount_v1: v1 Coin balance (stored in CoinStore) - this is reliable
  // - amount_v2: v2 FA balance (stored in FungibleStore) - NOT reliable, often missing
  //
  // So we only use amount_v1 from GraphQL for the v1 Coin balances,
  // and use the view function result for v2 FA balances.

  for (const fa of faBalances) {
    // Check if this is MOVE (native token) using the nativeTokens lookup
    const isV1Move = fa.asset_type_v1 && fa.asset_type_v1 in nativeTokens;
    const isV2Move = fa.asset_type_v2 && fa.asset_type_v2 in nativeTokens;
    const isMoveAsset = isV1Move || isV2Move;

    if (isMoveAsset) {
      // For MOVE: only add the v1 Coin balance from GraphQL (amount_v1)
      // The v2 FA balance will be added separately from the view function
      // We skip any v2 data from GraphQL since it's not reliable
      if (fa.amount_v1 != null && fa.amount_v1 > 0) {
        result.push({
          amount_v2: fa.amount_v1,
          asset_type_v2: APTOS_COIN_TYPE, // Coin uses 0x1::aptos_coin::AptosCoin
          metadata: fa.metadata || {
            name: "Move Coin",
            decimals: 8,
            symbol: "MOVE",
            token_standard: "v1",
          },
          is_v1_coin: true, // This is v1 Coin (CoinStore)
        });
      }
      // Note: We intentionally skip amount_v2 from GraphQL for MOVE
      // because it's not reliable - we get it from view function instead
    } else {
      // For non-MOVE assets, use the data as-is from GraphQL
      // Prefer v2 format if available, otherwise use v1
      if (fa.amount_v2 != null && fa.amount_v2 > 0 && fa.asset_type_v2 != null) {
        result.push({
          amount_v2: fa.amount_v2,
          asset_type_v2: fa.asset_type_v2,
          metadata: fa.metadata,
          is_v1_coin: false,
        });
      } else if (fa.amount_v1 != null && fa.amount_v1 > 0 && fa.asset_type_v1 != null) {
        result.push({
          amount_v2: fa.amount_v1,
          asset_type_v2: fa.asset_type_v1,
          metadata: fa.metadata,
          is_v1_coin: true,
        });
      }
    }
  }

  // Add v2 FA MOVE balance from view function (if any)
  if (faMoveBalance > 0) {
    result.push({
      amount_v2: faMoveBalance,
      asset_type_v2: MOVE_FA_ADDRESS_SHORT, // Use "0xa" for FA display
      metadata: {
        name: "Move Coin",
        decimals: 8,
        symbol: "MOVE",
        token_standard: "v2",
      },
      is_v1_coin: false, // This is v2 FA (FungibleStore)
    });
  }

  return result;
}
