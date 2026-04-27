import {aptosFrameworkAddressBranding} from "~/data/aptosFrameworkAddressBranding";
import type {KnownAddressBranding} from "~/data/knownAddressBranding";

export const devnetKnownAddressBranding: Record<string, KnownAddressBranding> =
  {
    ...aptosFrameworkAddressBranding,
  };
