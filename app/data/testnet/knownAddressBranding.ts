import type {KnownAddressBranding} from "../knownAddressBranding";
import {aptosFrameworkAddressBranding} from "../aptosFrameworkAddressBranding";

export const testnetKnownAddressBranding: Record<string, KnownAddressBranding> =
  {
    ...aptosFrameworkAddressBranding,
  };
