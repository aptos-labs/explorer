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
import {Types} from "aptos";

// ===== 兜底元数据常量 =====
const LBT_TYPE = "0x1::libra2_coin::Libra2Coin";
const DEFAULT_DECIMALS = 8;

type TokenStandard = "v1" | "v2";

type SimpleMeta = {
  name: string;
  symbol: string;
  decimals: number;
  token_standard: TokenStandard;
};

// 根据 asset_type 生成最小可用的元数据
function buildFallbackMeta(assetType: string): SimpleMeta {
  const isTypeTag = assetType.includes("::");
  // ✅ 显式标注类型，别对三元表达式用 `as const`
  const token_standard: TokenStandard = isTypeTag ? "v1" : "v2";

  let name = assetType;
  let symbol = isTypeTag ? (assetType.split("::").pop() ?? "UNKNOWN") : "UNKNOWN";

  // LBT 专用兜底
  if (assetType === LBT_TYPE) {
    name = "Libra2 Coin";
    symbol = "LBT";
  }

  return { name, symbol, decimals: DEFAULT_DECIMALS, token_standard };
}

type TokenTabsProps = {
  address: string;
  resourceData: Types.MoveResource[] | undefined;
};

export default function CoinsTab({address, resourceData}: TokenTabsProps) {
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
  if (!coins || coins.length <= 0) return [];

  return coins
    .map((coin): CoinDescriptionPlusAmount => {
      // 有 metadata 用它；没有就用兜底
      const md = coin.metadata ?? buildFallbackMeta(coin.asset_type);

      // 白名单/价格/Logo 等扩展信息
      const foundCoin = findCoinData(coinData?.data ?? [], coin.asset_type);

      if (!foundCoin) {
        // 最小信息也能渲染出来
        return {
          name: md.name || coin.asset_type,
          amount: coin.amount,
          decimals: md.decimals,
          symbol: md.symbol,
          assetType: coin.asset_type,
          assetVersion: md.token_standard,
          chainId: 0,
          tokenAddress: md.token_standard === "v1" ? coin.asset_type : null,
          faAddress: md.token_standard === "v2" ? coin.asset_type : null,
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
          tokenStandard: md.token_standard,
          usdPrice: null,
          panoraTags: [],
          panoraUI: false,
          native: coin.asset_type === LBT_TYPE,
          usdValue: 0,
        };
      } else {
        // 找到了更丰富的资料，合并并计算 USD 价值
        return {
          ...foundCoin,
          amount: coin.amount,
          tokenStandard: md.token_standard,
          assetType: coin.asset_type,
          assetVersion: md.token_standard,
          usdValue: foundCoin.usdPrice
            ? Math.round(
                100 *
                  (Number.EPSILON +
                    (parseFloat(foundCoin.usdPrice) * coin.amount) /
                      10 ** md.decimals),
              ) / 100
            : null,
        };
      }
    })
    // 先按你们的优先级排序
    .sort((a, b) => coinOrderIndex(a as CoinDescription) - coinOrderIndex(b as CoinDescription))
    // 再按 USD 价值降序
    .sort((a, b) => (b.usdValue ?? -1) - (a.usdValue ?? -1));
}

  return (
    <CoinsTable
      address={address}
      resourceData={resourceData}
      coins={parse_coins()}
    />
  );
}
