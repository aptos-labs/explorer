import {useMemo} from "react";
import type {Types} from "~/types/aptos";
import {useAccountHasConfidentialStores} from "../../../api/hooks/useAccountHasConfidentialStores";
import {useGetAllAccountCoins} from "../../../api/hooks/useGetAccountCoins";
import {
  type CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {findCoinData} from "../../Transaction/utils";
import {coinOrderIndex} from "../../utils";
import {
  type CoinDescriptionPlusAmount,
  CoinsTable,
} from "../Components/CoinsTable";

type TokenTabsProps = {
  address: string;
  resourceData?: Types.MoveResource[] | undefined;
};

export default function CoinsTab({address}: TokenTabsProps) {
  const {data: coinData, isLoading: coinDataLoading} = useGetCoinList();

  const {isLoading, error, data} = useGetAllAccountCoins(address);

  const coins = data ?? [];

  const parsedCoins = useMemo((): CoinDescriptionPlusAmount[] => {
    if (!coins.length) {
      return [];
    }
    return coins
      .filter((coin) => Boolean(coin.metadata))
      .map((coin): CoinDescriptionPlusAmount => {
        const foundCoin = findCoinData(coinData?.data ?? [], coin.asset_type);
        const isV2 = coin.metadata.token_standard === "v2";
        const confidentialMetadataKey = isV2
          ? coin.asset_type
          : (foundCoin?.faAddress ?? null);

        if (!foundCoin) {
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
            confidentialMetadataKey,
          };
        }
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
          confidentialMetadataKey,
        };
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
  }, [coins, coinData?.data]);

  const faKeysForConfidential = useMemo(
    () =>
      parsedCoins
        .map((c) => c.confidentialMetadataKey)
        .filter((k): k is string => Boolean(k)),
    [parsedCoins],
  );

  const {getConfidentialStore} = useAccountHasConfidentialStores(
    address,
    faKeysForConfidential,
  );

  if (isLoading) {
    return null;
  }

  if (error) {
    console.error(error);
    return null;
  }

  if (coins.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CoinsTable
      coins={parsedCoins}
      getConfidentialStore={getConfidentialStore}
      coinDataLoading={coinDataLoading}
    />
  );
}
