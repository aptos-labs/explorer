import {useViewFunction} from "./useViewFunction";

export function useGetFASupply(address: string): bigint | null {
  const {data} = useViewFunction<{vec: [string]}>(
    "0x1::fungible_asset::supply",
    ["0x1::object::ObjectCore"],
    [address],
  );

  if (data !== undefined) {
    const val = data[0]?.vec[0];
    if (val !== undefined && val !== null) {
      return BigInt(val);
    }
  }

  return null;
}
