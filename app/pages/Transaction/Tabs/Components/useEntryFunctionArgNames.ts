import {useMemo} from "react";
import type {Types} from "~/types/aptos";
import {useGetAccountPackages} from "../../../../api/hooks/useGetAccountResource";
import {lookupFunctionArgumentNameOverride} from "../../../../data/functionArgumentNameOverrides";
import {
  extractFunctionParamNames,
  extractFunctionTypeParamNames,
  transformCode,
} from "../../../../utils";

type UseEntryFunctionArgNamesParams = {
  /** Module address; the package registry at this address is searched for source. */
  address?: string;
  moduleName?: string;
  functionName?: string;
  /** Ledger version to pin the package source to (omit for latest). */
  ledgerVersion?: number;
  /** Number of serialized (non-signer) function arguments. */
  argCount: number;
  /** Number of type arguments. */
  typeArgCount: number;
  /** The ABI function entry (provides `params` to map source names by position). */
  moveFunction?: Types.MoveFunction;
};

type EntryFunctionArgNames = {
  /** Function argument names aligned to serialized args (signer slots removed), or null. */
  functionArgNames: string[] | null;
  /** Type-parameter names aligned to type arguments, or null. */
  typeArgNames: string[] | null;
};

function isSignerParam(param: string): boolean {
  return param === "signer" || param === "&signer";
}

/**
 * Resolves human-readable names for an entry function's arguments and type
 * parameters. Names come from a manual override registry first, then from the
 * module's Move source (via the account's `PackageRegistry`). Source-derived
 * argument names are mapped to the serialized arguments by ABI position, with
 * every `signer` / `&signer` slot dropped. Returns `null` for either list when
 * names can't be resolved confidently (so callers fall back to positional labels).
 *
 * This is the shared implementation behind both the transaction overview
 * `TransactionArguments` view and the multisig payload decoder.
 */
export function useEntryFunctionArgNames({
  address,
  moduleName,
  functionName,
  ledgerVersion,
  argCount,
  typeArgCount,
  moveFunction,
}: UseEntryFunctionArgNamesParams): EntryFunctionArgNames {
  const {packages} = useGetAccountPackages(address ?? "", ledgerVersion);

  const moduleSource = useMemo(() => {
    if (!moduleName) return undefined;
    for (const pkg of packages) {
      const mod = pkg.modules.find((m) => m.name === moduleName);
      if (mod?.source) return mod.source;
    }
    return undefined;
  }, [packages, moduleName]);

  return useMemo(() => {
    if (!functionName) {
      return {functionArgNames: null, typeArgNames: null};
    }

    const fromOverride =
      address && moduleName
        ? lookupFunctionArgumentNameOverride(
            address,
            moduleName,
            functionName,
            argCount,
          )
        : null;

    let typeNames: string[] | null = null;
    let fnArgNames: string[] | null = null;

    if (moduleSource) {
      const decoded = transformCode(moduleSource);

      const rawTypeNames = extractFunctionTypeParamNames(decoded, functionName);
      typeNames =
        rawTypeNames && rawTypeNames.length === typeArgCount
          ? rawTypeNames
          : null;

      if (moveFunction) {
        const filteredParams = moveFunction.params.filter(
          (p) => !isSignerParam(p),
        );
        const rawParamNames = extractFunctionParamNames(decoded, functionName);
        // Map source names to serialized args by ABI position: drop every signer
        // slot (not only a single leading signer).
        if (
          rawParamNames &&
          rawParamNames.length === moveFunction.params.length
        ) {
          const nonSignerIndices = moveFunction.params.reduce<number[]>(
            (indices, param, index) => {
              if (!isSignerParam(param)) {
                indices.push(index);
              }
              return indices;
            },
            [],
          );
          if (nonSignerIndices.length === filteredParams.length) {
            fnArgNames = nonSignerIndices.map((idx) => rawParamNames[idx]);
          }
        }
      }
    }

    return {
      functionArgNames: fromOverride ?? fnArgNames,
      typeArgNames: typeNames,
    };
  }, [
    address,
    moduleName,
    functionName,
    argCount,
    typeArgCount,
    moduleSource,
    moveFunction,
  ]);
}
