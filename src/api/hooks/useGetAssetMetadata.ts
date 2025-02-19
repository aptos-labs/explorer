import {useGetFaMetadata} from "./useGetFaMetadata";
import {useGetCoinMetadata} from "./useGetCoinMetadata";

export type AssetMetadata = {
  name: string;
  symbol: string;
  decimals: number;
};

export function useGetAssetMetadata(address: string): {
  isLoading: boolean;
  data: AssetMetadata | null;
} {
  const isCoin = address.includes("::");
  const {data: coinData, isLoading: coinLoading} = useGetCoinMetadata(
    isCoin ? address : "",
  );
  const {data: faData, isLoading: faLoading} = useGetFaMetadata(
    !isCoin ? address : "",
  );

  if (isCoin && coinData) {
    return {
      isLoading: coinLoading,
      data: {
        name: coinData.data.name,
        symbol: coinData.data.symbol,
        decimals: coinData.data.decimals,
      },
    };
  }

  if (!isCoin && faData) {
    return {
      isLoading: faLoading,
      data: {
        name: faData.name,
        symbol: faData.symbol,
        decimals: faData.decimals,
      },
    };
  }

  return {
    isLoading: isCoin ? coinLoading : faLoading,
    data: null,
  };
}
