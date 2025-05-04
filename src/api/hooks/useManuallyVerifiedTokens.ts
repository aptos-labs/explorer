import {useMemo} from "react";
import {useGetVerifiedTokens} from "./useGetVerifiedTokens";

export function useManuallyVerifiedTokens() {
  const {data: verifiedTokens} = useGetVerifiedTokens();

  return useMemo(() => {
    if (!verifiedTokens) {
      return {};
    }

    const manuallyVerifiedTokens: Record<string, string> = {};

    // Convert verified tokens to manually verified tokens format
    for (const [address, token] of Object.entries(verifiedTokens)) {
      manuallyVerifiedTokens[address] = token.symbol;
    }

    return manuallyVerifiedTokens;
  }, [verifiedTokens]);
}
  