import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";

interface CoinInfo {
  decimals: number;
  name: string;
  supply: {
    vec: [
      {
        aggregator: {
          vec: [
            {
              handle: string;
              key: string;
              limit: string;
            },
          ];
        };
        integer: {
          vec: [];
        };
      },
    ];
  };
  symbol: string;
}

export function useGetCoinSupplyLimit(): string | null {
  const accountResourcesResult = useGetAccountResources("0x1");

  if (!accountResourcesResult.data) return null;

  const coinInfo = accountResourcesResult.data.find(
    (resource) =>
      resource.type === "0x1::coin::CoinInfo<0x1::aptos_coin::AptosCoin>",
  );

  if (!coinInfo || !coinInfo.data) return null;

  const coinInfoData: CoinInfo = coinInfo.data as CoinInfo;
  const supplyLimit = coinInfoData?.supply?.vec[0]?.aggregator?.vec[0]?.limit;

  return supplyLimit;
}
