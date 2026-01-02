import {useViewFunction} from "./useViewFunction";

export function useGetFASupply(address: string): {
  isLoading: boolean;
  data: bigint | null;
} {
  const {data, isLoading} = useViewFunction(
    "0x1::fungible_asset::supply",
    ["0x1::object::ObjectCore"],
    [address],
  );

  if (data !== undefined) {
    const mappedData = data as [{vec: [string]}];
    const val = mappedData[0]?.vec[0];
    if (val !== undefined && val !== null) {
      return {isLoading, data: BigInt(val)};
    }
  }

  return {isLoading, data: null};
}
