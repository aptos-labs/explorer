import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {standardizeAddress} from "../../utils";
import {InputViewFunctionData} from "@aptos-labs/ts-sdk";
import {useGetAccountResources} from "./useGetAccountResources";

const MOVE_FA_ADDRESS_SHORT = "0xa";
const MOVE_COIN_TYPE = "0x1::aptos_coin::AptosCoin";

// GraphQL query for FA balances (used for non-MOVE FA tokens)
const FA_BALANCES_QUERY = `
    query FungibleAssetBalances($owner_address: String) {
        current_fungible_asset_balances(
            where: {owner_address: {_eq: $owner_address}}
        ) {
            amount
            asset_type
            metadata {
                name
                decimals
                symbol
                token_standard
            }
        }
    }
`;

type FaBalance = {
  amount: number;
  asset_type: string;
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

interface CoinStoreResource {
  type: string;
  data: {
    coin: {
      value: string;
    };
    frozen: boolean;
  };
}

export function useGetAccountCoins(address: string) {
  const [state] = useGlobalState();
  const standardizedAddress = standardizeAddress(address);

  const {data: resources, isLoading, error} = useGetAccountResources(address);

  return useQuery<UnifiedCoinBalance[], ResponseError>({
    queryKey: ["coinQuery", address, resources],
    enabled: !isLoading && !error,
    queryFn: async (): Promise<UnifiedCoinBalance[]> => {
      const result: UnifiedCoinBalance[] = [];

      if (!resources) return result;

      // Step 1: Get v1 MOVE Coin from CoinStore resource (REST)
      const coinStoreResources = resources.filter((resource) =>
        resource.type.startsWith("0x1::coin::CoinStore<"),
      ) as CoinStoreResource[];

      for (const resource of coinStoreResources) {
        const match = resource.type.match(/0x1::coin::CoinStore<(.+)>/);
        if (!match) continue;

        const coinType = match[1];
        const balance = parseInt(resource.data.coin.value, 10);
        const isMoveCoin = coinType === MOVE_COIN_TYPE;

        if (balance > 0) {
          result.push({
            amount_v2: balance,
            asset_type_v2: coinType,
            metadata: {
              name: isMoveCoin ? "Move Coin" : coinType.split("::").pop() || "Unknown",
              decimals: 8,
              symbol: isMoveCoin ? "MOVE" : coinType.split("::").pop() || "Unknown",
              token_standard: "v1",
            },
            is_v1_coin: true,
          });
        }
      }

      // Step 2: Get v2 MOVE FA from view function (REST)
      let faMoveBal = 0;
      try {
        const payload: InputViewFunctionData = {
          function: "0x1::primary_fungible_store::balance",
          typeArguments: ["0x1::object::ObjectCore"],
          functionArguments: [standardizedAddress, MOVE_FA_ADDRESS_SHORT],
        };
        const result_fa = await state.sdk_v2_client.view<[string]>({payload});
        faMoveBal = parseInt(result_fa[0] || "0", 10);
      } catch {
        faMoveBal = 0;
      }

      if (faMoveBal > 0) {
        result.push({
          amount_v2: faMoveBal,
          asset_type_v2: MOVE_FA_ADDRESS_SHORT,
          metadata: {
            name: "Move Coin",
            decimals: 8,
            symbol: "MOVE",
            token_standard: "v2",
          },
          is_v1_coin: false,
        });
      }

      // Step 3: Get non-MOVE FA tokens from GraphQL indexer
      try {
        const response = await state.sdk_v2_client.queryIndexer<{
          current_fungible_asset_balances: FaBalance[];
        }>({
          query: {
            query: FA_BALANCES_QUERY,
            variables: {
              owner_address: standardizedAddress,
            },
          },
        });

        const faBalances = response.current_fungible_asset_balances || [];

        for (const fa of faBalances) {
          // Skip MOVE tokens - we already handle them above via REST
          const isMoveToken =
            fa.asset_type === MOVE_COIN_TYPE ||
            fa.asset_type === MOVE_FA_ADDRESS_SHORT ||
            fa.asset_type?.startsWith("0x000000000000000000000000000000000000000000000000000000000000000a");

          if (isMoveToken) continue;

          if (fa.amount > 0 && fa.asset_type && fa.metadata) {
            result.push({
              amount_v2: fa.amount,
              asset_type_v2: fa.asset_type,
              metadata: fa.metadata,
              is_v1_coin: false,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching FA balances from indexer:", error);
      }

      return result;
    },
  });
}
