import type {FunctionArgumentNameOverrideMap} from "./types";
import {decibelMainnetFunctionArgumentNameOverrides} from "./decibelMainnet";

/** Merged lookup table; add new vendor maps here. */
export const FUNCTION_ARGUMENT_NAME_OVERRIDES: FunctionArgumentNameOverrideMap =
  {
    ...decibelMainnetFunctionArgumentNameOverrides,
  };
