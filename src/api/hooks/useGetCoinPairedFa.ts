import {useViewFunction} from "./useViewFunction";

export function useGetCoinPairedFa(coinType: string): {
  isLoading: boolean;
  data: string | null;
} {
  const {isLoading, data} = useViewFunction(
    "0x1::coin::paired_metadata",
    [coinType],
    [],
  );

  if (data !== undefined) {
    const mappedData = data as [{vec: [{inner: string}]}];
    const val = mappedData[0]?.vec[0];
    if (val !== undefined && val !== null) {
      return {isLoading, data: val.inner};
    }
  }

  return {isLoading, data: null};
}
