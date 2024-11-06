import React from "react";
import {gql, useQuery} from "@apollo/client";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {CoinDescriptionPlusAmount, CoinsTable} from "../Components/CoinsTable";
import {standardizeAddress} from "../../../utils";
import {useGetCoinList} from "../../../api/hooks/useGetCoinList";
import {findCoinData} from "../../Transaction/Tabs/BalanceChangeTab";
import {AccountData, MoveResource} from "@aptos-labs/ts-sdk";

const COINS_QUERY = gql`
  query CoinsData($owner_address: String, $limit: Int, $offset: Int) {
    current_fungible_asset_balances(
      where: {owner_address: {_eq: $owner_address}}
      limit: $limit
      offset: $offset
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

type TokenTabsProps = {
  address: string;
  accountData: AccountData | MoveResource[] | undefined;
};

export default function CoinsTab({address}: TokenTabsProps) {
  const addr64Hash = standardizeAddress(address);
  const {data: coinData} = useGetCoinList();

  const {loading, error, data} = useQuery<{
    current_fungible_asset_balances: {
      amount: number;
      asset_type: string;
      metadata: {
        name: string;
        decimals: number;
        symbol: string;
        token_standard: string;
      };
    }[];
  }>(COINS_QUERY, {
    variables: {
      owner_address: addr64Hash,
    },
  });

  if (loading) {
    return null;
  }

  if (error) {
    console.error(error);
    return null;
  }

  const coins = data?.current_fungible_asset_balances ?? [];

  if (coins.length === 0) {
    return <EmptyTabContent />;
  }

  function parse_coins(): CoinDescriptionPlusAmount[] {
    if (!coins || coins.length <= 0) {
      return [];
    }
    return coins
      .filter((coin) => Boolean(coin.metadata))
      .map((coin) => {
        const foundCoin = findCoinData(coinData?.data ?? [], coin.asset_type);

        if (!foundCoin) {
          // Minimally, return the information we do know
          return {
            name: coin.metadata.name,
            amount: coin.amount,
            decimals: coin.metadata.decimals,
            symbol: coin.metadata.symbol,
            assetType: coin.asset_type,
            assetVersion: coin.metadata.token_standard,
            chainId: 0,
            tokenAddress:
              coin.metadata.token_standard === "v1" ? coin.asset_type : null,
            faAddress:
              coin.metadata.token_standard === "v2" ? coin.asset_type : null,
            bridge: null,
            panoraSymbol: null,
            logoUrl: "",
            websiteUrl: null,
            category: "N/A",
            isInPanoraTokenList: false,
            isBanned: false,
            panoraOrderIndex: 20000000,
            coinGeckoId: null,
            coinMarketCapId: null,
            tokenStandard: coin.metadata.token_standard,
          };
        } else {
          // Otherwise, use the stuff found in the lookup
          return {
            ...foundCoin,
            amount: coin.amount,
            tokenStandard: coin.metadata.token_standard,
          };
        }
      });
  }

  return <CoinsTable coins={parse_coins()} />;
}
