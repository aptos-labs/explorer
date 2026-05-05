import {useQueries} from "@tanstack/react-query";
import {useCallback, useMemo} from "react";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {isValidAccountAddress} from "../../pages/utils";
import {tryStandardizeAddress} from "../../utils";
import {view} from "../index";
import {parseConfidentialStoreBool} from "./confidentialAssetViews";

export type ConfidentialStoreQueryState = {
  pending: boolean;
  hasStore: boolean | undefined;
};

/**
 * Whether each FA metadata address has a `ConfidentialStore` for `userAddress`
 * (`0x1::confidential_asset::has_confidential_store`).
 */
export function useAccountHasConfidentialStores(
  userAddress: string,
  faMetadataAddresses: string[],
): {
  getConfidentialStore: (
    metadataAddress: string | null | undefined,
  ) => ConfidentialStoreQueryState;
} {
  const aptosClient = useAptosClient();
  const networkValue = useNetworkValue();
  const standardizedUser = tryStandardizeAddress(userAddress);

  const dedupedFa = useMemo(
    () =>
      [...new Set(faMetadataAddresses)].filter((a) => isValidAccountAddress(a)),
    [faMetadataAddresses],
  );

  const queryResults = useQueries({
    queries: dedupedFa.map((fa) => {
      const standardizedFa = tryStandardizeAddress(fa) ?? fa;
      const request: Types.ViewRequest = {
        function: "0x1::confidential_asset::has_confidential_store",
        type_arguments: [],
        arguments: [standardizedUser ?? userAddress, standardizedFa],
      };
      return {
        queryKey: [
          "hasConfidentialStore",
          standardizedUser ?? userAddress,
          standardizedFa,
          networkValue,
        ],
        queryFn: () => view(request, aptosClient),
        enabled: Boolean(standardizedUser) && isValidAccountAddress(fa),
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        select: (data: Types.MoveValue[]) => parseConfidentialStoreBool(data),
      };
    }),
  });

  const storeStateByFaKey = useMemo(() => {
    const m = new Map<string, ConfidentialStoreQueryState>();
    dedupedFa.forEach((fa, i) => {
      const q = queryResults[i];
      const key = tryStandardizeAddress(fa) ?? fa;
      m.set(key, {
        pending: q.isPending || q.isLoading,
        hasStore: q.isError ? undefined : q.data,
      });
    });
    return m;
  }, [dedupedFa, queryResults]);

  const getConfidentialStore = useCallback(
    (
      metadataAddress: string | null | undefined,
    ): ConfidentialStoreQueryState => {
      if (!metadataAddress || !standardizedUser) {
        return {pending: false, hasStore: undefined};
      }
      const key = tryStandardizeAddress(metadataAddress) ?? metadataAddress;
      return storeStateByFaKey.get(key) ?? {pending: false, hasStore: false};
    },
    [storeStateByFaKey, standardizedUser],
  );

  return {getConfidentialStore};
}
