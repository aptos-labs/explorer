import {useViewFunction} from "./useViewFunction";

export function useGetFASupply(address: string): bigint | null {
  const {data} = useViewFunction(
    "0x1::fungible_asset::supply",
    ["0x1::object::ObjectCore"],
    [address],
  );

  if (data !== undefined) {
    const mappedData = data as [{vec: [string]}];
    const val = mappedData[0]?.vec[0];
    if (val !== undefined && val !== null) {
      return BigInt(val);
    }
  }

  return null;
}
