import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {CoinDescriptionPlusAmount, CoinsTable} from "../Components/CoinsTable";
import {
  CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import {findCoinData} from "../../Transaction/Tabs/BalanceChangeTab";
import {useGetAccountCoins} from "../../../api/hooks/useGetAccountCoins";
import {coinOrderIndex} from "../../utils";

type TokenTabsProps = {
  address: string;
};

export default function CoinsTab({address}: TokenTabsProps) {
  const {data: coinData} = useGetCoinList();

  const {isLoading, error, data} = useGetAccountCoins(address);

  if (isLoading) {
    return null;
  }

  if (error) {
    console.error(error);
    return null;
  }

  const coins = data ?? [];

  if (coins.length === 0) {
    return <EmptyTabContent />;
  }

  function parse_coins(): CoinDescriptionPlusAmount[] {
    if (!coins || coins.length <= 0) {
      return [];
    }
    return coins
      .filter((coin) => Boolean(coin.metadata) && Boolean(coin.asset_type_v2))
      .map((coin): CoinDescriptionPlusAmount => {
        const foundCoin = findCoinData(coinData?.data ?? [], coin.asset_type_v2);

        // Determine token standard based on source:
        // - is_v1_coin = true means from coin_balances table → "v1" (Coin)
        // - is_v1_coin = false means from FA table → "v2" (Fungible Asset)
        const inferredTokenStandard = coin.is_v1_coin ? "v1" : "v2";
        const isV1Format = coin.asset_type_v2.includes("::");

        if (!foundCoin) {
          // Coin not found in list - just display as-is
          return {
            name: coin.metadata.name,
            amount: coin.amount_v2,
            decimals: coin.metadata.decimals,
            symbol: coin.metadata.symbol,
            assetType: coin.asset_type_v2,
            assetVersion: inferredTokenStandard,
            chainId: 0,
            tokenAddress: isV1Format ? coin.asset_type_v2 : null,
            faAddress: !isV1Format ? coin.asset_type_v2 : null,
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
            tokenStandard: inferredTokenStandard,
            usdPrice: null,
            panoraTags: [],
            panoraUI: false,
            native: false,
            usdValue: 0,
          };
        } else {
          // Otherwise, use the stuff found in the lookup
          // For FA (v2), use faAddress; for Coin (v1), use tokenAddress
          const isFA = !coin.is_v1_coin;

          return {
            ...foundCoin,
            amount: coin.amount_v2,
            tokenStandard: inferredTokenStandard,
            usdValue: foundCoin.usdPrice
              ? Math.round(
                  100 *
                    (Number.EPSILON +
                      (parseFloat(foundCoin.usdPrice) * coin.amount_v2) /
                        10 ** coin.metadata.decimals),
                ) / 100
              : null,
            assetType: coin.asset_type_v2,
            assetVersion: inferredTokenStandard,
            // For FA, clear tokenAddress so faAddress is used; for Coin, keep tokenAddress
            tokenAddress: isFA ? null : foundCoin.tokenAddress,
            faAddress: isFA ? (foundCoin.faAddress ?? coin.asset_type_v2) : foundCoin.faAddress,
          };
        }
      })
      .sort((a: CoinDescriptionPlusAmount, b: CoinDescriptionPlusAmount) => {
        return (
          coinOrderIndex(a as CoinDescription) -
          coinOrderIndex(b as CoinDescription)
        );
      })
      .sort((a: CoinDescriptionPlusAmount, b: CoinDescriptionPlusAmount) => {
        return (b.usdValue ?? -1) - (a.usdValue ?? -1);
      });
  }

  return <CoinsTable coins={parse_coins()} />;
}
