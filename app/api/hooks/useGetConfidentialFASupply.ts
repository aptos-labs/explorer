import {isValidAccountAddress} from "../../pages/utils";
import {parseConfidentialSupplyU64} from "./confidentialAssetViews";
import {useViewFunction} from "./useViewFunction";

/**
 * Circulating supply held in the confidential-asset pool for this FA metadata object
 * (`0x1::confidential_asset::get_total_confidential_supply`).
 */
export function useGetConfidentialFASupply(metadataAddress: string): {
  isLoading: boolean;
  isError: boolean;
  data: bigint | null;
} {
  const {data, isLoading, isError} = useViewFunction(
    "0x1::confidential_asset::get_total_confidential_supply",
    [],
    [metadataAddress],
    {
      enabled: isValidAccountAddress(metadataAddress),
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  );

  return {
    isLoading,
    isError,
    data: parseConfidentialSupplyU64(data),
  };
}
