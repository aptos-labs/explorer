import type {KnownAddressBranding} from "../knownAddressBranding";
import {aptosFrameworkAddressBranding} from "../aptosFrameworkAddressBranding";

export const testnetKnownAddressBranding: Record<string, KnownAddressBranding> =
  {
    ...aptosFrameworkAddressBranding,
    "0xc63d6a5efb0080a6029403131715bd4971e1149f7cc099aac69bb0069b3ddbf5": {
      icon: "/address-icons/shelby.ico",
      description:
        "Shelby on Aptos testnet — programmable markets and agentic finance. https://shelby.xyz",
    },
  };
