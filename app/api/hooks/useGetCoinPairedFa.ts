import {pairedFaMetadataAddress} from "@aptos-labs/ts-sdk";

export function useGetCoinPairedFa(coinType: string): {
  isLoading: boolean;
  data: string | null;
} {
  if (!coinType) {
    return {isLoading: false, data: null};
  }

  try {
    const address = pairedFaMetadataAddress(
      coinType as `0x${string}::${string}::${string}`,
    );
    return {isLoading: false, data: address.toStringLong()};
  } catch {
    return {isLoading: false, data: null};
  }
}
