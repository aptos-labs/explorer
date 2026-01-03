import {useViewFunction} from "./useViewFunction";
import {supplyLimitOverrides} from "../../constants";

// Override table for coins that have burnt their mint and burn, but did not properly track on-chain supply
// This will not override an existing supply, but will set a supply if it is not already set

export enum SupplyType {
  ON_CHAIN = "On-Chain",
  VERIFIED_OFF_CHAIN = "Verified Off-Chain",
  NO_SUPPLY_TRACKED = "No supply tracked",
}

export function useGetCoinSupplyLimit(coinType: string): {
  isLoading: boolean;
  data: [bigint | null, SupplyType | null];
} {
  const {isLoading, data} = useViewFunction(
    "0x1::coin::supply",
    [coinType],
    [],
  );
  const override = supplyLimitOverrides[coinType];

  // Calculate supply data during render instead of using useEffect
  let totalSupply: bigint | null = null;
  let supplyType: SupplyType | null = null;

  if (data !== undefined) {
    // Parse supply
    const mappedData = data as [{vec: [string]}];
    const val = mappedData[0]?.vec[0];

    if (val !== undefined && val !== null) {
      totalSupply = BigInt(val);
      supplyType = SupplyType.ON_CHAIN;
    } else if (override) {
      // If supply is not set, but there is an override, set the supply
      totalSupply = override;
      supplyType = SupplyType.VERIFIED_OFF_CHAIN;
    } else {
      totalSupply = null;
      supplyType = SupplyType.NO_SUPPLY_TRACKED;
    }
  }

  return {isLoading, data: [totalSupply, supplyType]};
}
