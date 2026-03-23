import {aptosFrameworkAddressBranding} from "../aptosFrameworkAddressBranding";
import type {KnownAddressBranding} from "../knownAddressBranding";

export const devnetKnownAddressBranding: Record<string, KnownAddressBranding> =
  {
    ...aptosFrameworkAddressBranding,
  };
