import {CoinData} from "../../pages/Coin/Components/CoinData";
import {useGetAccountResource} from "./useGetAccountResource";

export function useGetCoinMetadata(coinType: string): {
  isLoading: boolean;
  data: CoinData | null;
} {
  const {data, isLoading} = useGetAccountResource(
    coinType,
    `0x1::coin::CoinInfo<${coinType}>`,
  );

  if (data) {
    const val = data as CoinData;
    if (val !== undefined && val !== null) {
      return {isLoading, data: val};
    }
  }

  return {isLoading, data: null};
}
