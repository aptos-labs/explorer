import type {KnownAddressBranding} from "../knownAddressBranding";
import {aptosFrameworkAddressBranding} from "../aptosFrameworkAddressBranding";

export const devnetKnownAddressBranding: Record<string, KnownAddressBranding> =
  {
    ...aptosFrameworkAddressBranding,
  };
