import {tryStandardizeAddress} from "../../utils/utils";
import {FUNCTION_ARGUMENT_NAME_OVERRIDES} from "./registry";

/**
 * Returns override labels for function arguments when a registry entry exists.
 * If the override has fewer names than `nonSignerArgCount`, returns null
 * (the data is incomplete). Extra names (for signer slots) are fine.
 */
export function lookupFunctionArgumentNameOverride(
  moduleAddress: string,
  moduleName: string,
  functionName: string,
  nonSignerArgCount: number,
): string[] | null {
  const std = tryStandardizeAddress(moduleAddress);
  if (!std) return null;
  const key = `${std}::${moduleName}::${functionName}`;
  const names = FUNCTION_ARGUMENT_NAME_OVERRIDES[key];
  if (!names) return null;
  if (names.length < nonSignerArgCount) return null;
  return names.slice(-nonSignerArgCount);
}
