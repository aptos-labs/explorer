import {decibelMainnetFunctionArgumentNameOverrides} from "./decibelMainnet";
import type {FunctionArgumentNameOverrideMap} from "./types";

/** Merged lookup table; add new vendor maps here. */
export const FUNCTION_ARGUMENT_NAME_OVERRIDES: FunctionArgumentNameOverrideMap =
  {
    ...decibelMainnetFunctionArgumentNameOverrides,
  };
