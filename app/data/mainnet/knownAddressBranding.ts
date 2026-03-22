import type {KnownAddressBranding} from "../knownAddressBranding";

/**
 * Keys are standardized account addresses (0x + 64 lowercase hex).
 */
export const mainnetKnownAddressBranding: Record<string, KnownAddressBranding> =
  {
    "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06": {
      icon: "/address-icons/decibel.png",
      description:
        "Decibel is an onchain trading engine on Aptos for spot, perpetuals, and unified margin—built for transparent execution and deep liquidity.",
    },
  };
