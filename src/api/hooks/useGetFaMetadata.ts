import {useViewFunction} from "./useViewFunction";

export type FaMetadata = {
  name: string;
  symbol: string;
  decimals: number;
  icon_uri: string;
  project_uri: string;
};

export function useGetFaMetadata(address: string): {
  isLoading: boolean;
  data: FaMetadata | null;
} {
  const {data, isLoading} = useViewFunction(
    "0x1::fungible_asset::metadata",
    ["0x1::object::ObjectCore"],
    [address],
  );

  if (data) {
    const [val] = data as [FaMetadata];
    if (val !== undefined && val !== null) {
      return {isLoading, data: val};
    }
  }

  return {isLoading, data: null};
}
