import {tryStandardizeAddress} from "../../utils/utils";
import {FUNCTION_ARGUMENT_NAME_OVERRIDES} from "./registry";

/**
 * Returns override labels for non-signer function arguments when a registry entry exists
 * and its length matches `nonSignerArgCount`.
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
  if (names.length !== nonSignerArgCount) return null;
  return [...names];
}
