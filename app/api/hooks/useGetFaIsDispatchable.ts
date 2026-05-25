import {useMemo} from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountResources} from "./useGetAccountResources";

/**
 * Returns `true` when the fungible asset's metadata object owns a
 * `0x1::fungible_asset::DispatchFunctionStore` resource, meaning custom
 * dispatch functions are registered for transfers (withdraw / deposit /
 * balance). This is the only property still surfaced on FA detail pages
 * — see `CHANGELOG.md → Removed` for why mint/burn/freeze chips were
 * dropped.
 */
export function isDispatchableFromResources(
  resources: Types.MoveResource[] | undefined,
): boolean | null {
  if (!resources) return null;
  return resources.some(
    (r) => r.type === "0x1::fungible_asset::DispatchFunctionStore",
  );
}

export function useGetFaIsDispatchable(address: string | undefined): {
  isLoading: boolean;
  data: boolean | null;
} {
  const {data: resources, isLoading} = useGetAccountResources(address ?? "", {
    retry: false,
    enabled: !!address,
  });

  const dispatchable = useMemo(
    () => isDispatchableFromResources(resources),
    [resources],
  );

  return {isLoading, data: dispatchable};
}
