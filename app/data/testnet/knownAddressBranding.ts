import {aptosFrameworkAddressBranding} from "../aptosFrameworkAddressBranding";
import type {KnownAddressBranding} from "../knownAddressBranding";

export const testnetKnownAddressBranding: Record<string, KnownAddressBranding> =
  {
    ...aptosFrameworkAddressBranding,
    // Decibel (Testnet)
    "0xe7da2794b1d8af76532ed95f38bfdf1136abfd8ea3a240189971988a83101b7f": {
      icon: "/address-icons/decibel-testnet.png",
      description:
        "Decibel (Testnet) is an onchain trading engine on Aptos for spot, perpetuals, and unified margin—built for transparent execution and deep liquidity.",
    },
    // Shelby — same address as testnetKnownAddresses (protocol / package deployer)
    "0xc63d6a5efb0080a6029403131715bd4971e1149f7cc099aac69bb0069b3ddbf5": {
      icon: "/address-icons/shelby.ico",
      description:
        "Shelby on Aptos testnet — programmable markets and agentic finance. https://shelby.xyz",
    },
  };
