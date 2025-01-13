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
      .filter((coin) => Boolean(coin.metadata))
      .map((coin): CoinDescriptionPlusAmount => {
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
            usdPrice: null,
            panoraTags: [],
            panoraUI: false,
            native: false,
            usdValue: 0,
          };
        } else {
          // Otherwise, use the stuff found in the lookup
          return {
            ...foundCoin,
            amount: coin.amount,
            tokenStandard: coin.metadata.token_standard,
            usdValue: foundCoin.usdPrice
              ? Math.round(
                  100 *
                    (Number.EPSILON +
                      (parseFloat(foundCoin.usdPrice) * coin.amount) /
                        10 ** coin.metadata.decimals),
                ) / 100
              : null,
            assetType: coin.asset_type,
            assetVersion: coin.metadata.token_standard,
          };
        }
      })
      .sort((a, b) => {
        return (
          coinOrderIndex(a as CoinDescription) -
          coinOrderIndex(b as CoinDescription)
        );
      })
      .sort((a, b) => {
        return (b.usdValue ?? -1) - (a.usdValue ?? -1);
      });
  }

  return <CoinsTable coins={parse_coins()} />;
}
