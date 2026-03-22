import {useMemo} from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountResources} from "./useGetAccountResources";

export type FaProperties = {
  mintable: boolean;
  burnable: boolean;
  freezable: boolean;
  dispatchable: boolean;
  untransferable: boolean;
};

type OptionVec<T = unknown> = {vec: T[]};

function isOptionSome(opt: OptionVec | undefined): boolean {
  return Array.isArray(opt?.vec) && opt.vec.length > 0;
}

function detectPairedCoinRefs(
  resources: Types.MoveResource[],
): Partial<FaProperties> | null {
  const pairedRefs = resources.find(
    (r) => r.type === "0x1::coin::PairedFungibleAssetRefs",
  );
  if (!pairedRefs) return null;

  const data = pairedRefs.data as {
    mint_ref_opt?: OptionVec;
    burn_ref_opt?: OptionVec;
    transfer_ref_opt?: OptionVec;
  };

  return {
    mintable: isOptionSome(data.mint_ref_opt),
    burnable: isOptionSome(data.burn_ref_opt),
    freezable: isOptionSome(data.transfer_ref_opt),
  };
}

const REF_FIELD_PATTERNS: Array<{
  key: keyof Pick<FaProperties, "mintable" | "burnable" | "freezable">;
  pattern: RegExp;
}> = [
  {key: "mintable", pattern: /mint[_\s]?ref/i},
  {key: "burnable", pattern: /burn[_\s]?ref/i},
  {key: "freezable", pattern: /transfer[_\s]?ref|freeze[_\s]?ref/i},
];

function scanFieldsForRefs(
  // biome-ignore lint/suspicious/noExplicitAny: resource data is untyped
  data: any,
  depth = 0,
): Pick<FaProperties, "mintable" | "burnable" | "freezable"> {
  const result = {mintable: false, burnable: false, freezable: false};
  if (depth > 4 || data === null || data === undefined) return result;

  if (typeof data === "object" && !Array.isArray(data)) {
    for (const [fieldName, fieldValue] of Object.entries(data)) {
      for (const {key, pattern} of REF_FIELD_PATTERNS) {
        if (
          pattern.test(fieldName) &&
          typeof fieldValue === "object" &&
          fieldValue !== null
        ) {
          const val = fieldValue as OptionVec | Record<string, unknown>;
          if ("vec" in val) {
            result[key] = isOptionSome(val as OptionVec);
          } else if ("metadata" in val) {
            result[key] = true;
          }
        }
      }

      if (typeof fieldValue === "object" && fieldValue !== null) {
        const nested = scanFieldsForRefs(fieldValue, depth + 1);
        if (nested.mintable) result.mintable = true;
        if (nested.burnable) result.burnable = true;
        if (nested.freezable) result.freezable = true;
      }
    }
  }

  return result;
}

export function deriveProperties(
  resources: Types.MoveResource[] | undefined,
): FaProperties | null {
  if (!resources || resources.length === 0) return null;

  const props: FaProperties = {
    mintable: false,
    burnable: false,
    freezable: false,
    dispatchable: false,
    untransferable: false,
  };

  props.untransferable = resources.some(
    (r) => r.type === "0x1::fungible_asset::Untransferable",
  );

  props.dispatchable = resources.some(
    (r) => r.type === "0x1::fungible_asset::DispatchFunctionStore",
  );

  const pairedRefs = detectPairedCoinRefs(resources);
  if (pairedRefs) {
    props.mintable = pairedRefs.mintable ?? false;
    props.burnable = pairedRefs.burnable ?? false;
    props.freezable = pairedRefs.freezable ?? false;
    return props;
  }

  for (const resource of resources) {
    if (
      resource.type.startsWith("0x1::fungible_asset::") ||
      resource.type.startsWith("0x1::object::") ||
      resource.type.startsWith("0x1::coin::PairedCoinType")
    ) {
      continue;
    }

    const scanned = scanFieldsForRefs(resource.data);
    if (scanned.mintable) props.mintable = true;
    if (scanned.burnable) props.burnable = true;
    if (scanned.freezable) props.freezable = true;
  }

  return props;
}

export function useGetFaProperties(address: string | undefined): {
  isLoading: boolean;
  data: FaProperties | null;
} {
  const {data: resources, isLoading} = useGetAccountResources(address ?? "", {
    retry: false,
    enabled: !!address,
  });

  const properties = useMemo(() => deriveProperties(resources), [resources]);

  return {isLoading, data: properties};
}
