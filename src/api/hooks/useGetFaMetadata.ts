import {useViewFunction} from "./useViewFunction";

type FaMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  icon_uri: string;
  project_uri: string;
};

export function useGetFaMetadata(address: string): FaMetadata | null {
  const {data} = useViewFunction<FaMetadata>(
    "0x1::fungible_asset::metadata",
    ["0x1::object::ObjectCore"],
    [address],
  );

  if (data) {
    const [val] = data;
    if (val !== undefined && val !== null) {
      return val;
    }
  }

  return null;
}
