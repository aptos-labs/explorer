import {useViewFunction} from "./useViewFunction";

export type FaMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  icon_uri: string;
  project_uri: string;
};

export function useGetFaMetadata(address: string): FaMetadata | null {
  const {data} = useViewFunction(
    "0x1::fungible_asset::metadata",
    ["0x1::object::ObjectCore"],
    [address],
  );

  if (data) {
    const [val] = data as [FaMetadata];
    if (val !== undefined && val !== null) {
      return val;
    }
  }

  return null;
}
