import type {Types} from "~/types/aptos";
import {useGetAllAccountCoins} from "../../../api/hooks/useGetAccountCoins";
import {useGetAccountAPTBalance} from "../../../api/hooks/useGetAccountAPTBalance";
import {
  type CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import {
  type FaBalanceRow,
  mergeOnChainAptIntoIndexerRows,
} from "../accountCoinsMerge";
import {findCoinData} from "../../Transaction/utils";
import {coinOrderIndex} from "../../utils";
import {
  type CoinDescriptionPlusAmount,
  CoinsTable,
} from "../Components/CoinsTable";

type TokenTabsProps = {
  address: string;
  resourceData: Types.MoveResource[] | undefined;
};

export default function CoinsTab({address}: TokenTabsProps) {
  const {data: coinData} = useGetCoinList();

  const {isLoading: coinsLoading, error, data} = useGetAllAccountCoins(address);
  const {data: aptBalance, isLoading: aptLoading} =
    useGetAccountAPTBalance(address);

  if (coinsLoading || aptLoading) {
    return null;
  }

  if (error) {
    console.error(error);
    return null;
  }

  const rawCoins = mergeOnChainAptIntoIndexerRows(data ?? [], aptBalance);

  function parse_coins(): CoinDescriptionPlusAmount[] {
    if (!rawCoins || rawCoins.length <= 0) {
      return [];
    }
    return rawCoins
      .filter(
        (
          coin,
        ): coin is FaBalanceRow & {
          metadata: NonNullable<FaBalanceRow["metadata"]>;
        } => coin.metadata != null,
      )
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

  const indexerHadNoRows = (data ?? []).length === 0;
  let onChainAptOctas = 0n;
  if (aptBalance !== undefined) {
    try {
      onChainAptOctas = BigInt(aptBalance);
    } catch {
      onChainAptOctas = 0n;
    }
  }

  return (
    <CoinsTable
      coins={parse_coins()}
      indexerReturnedNoRows={indexerHadNoRows && onChainAptOctas === 0n}
    />
  );
}
