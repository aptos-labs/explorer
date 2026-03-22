import type {KnownAddressBranding} from "./knownAddressBranding";

const APTOS_MARK = "/address-icons/aptos-mark.svg";

/**
 * Canonical framework accounts (identical address on mainnet, testnet, and devnet).
 */
export const aptosFrameworkAddressBranding: Record<
  string,
  KnownAddressBranding
> = {
  "0x0000000000000000000000000000000000000000000000000000000000000001": {
    icon: APTOS_MARK,
    iconBadge: "0x1",
    description:
      "The Aptos framework account (0x1). Hosts core Move packages such as AptosFramework and AptosStdlib used for execution, governance hooks, and system upgrades.",
  },
  "0x0000000000000000000000000000000000000000000000000000000000000003": {
    icon: APTOS_MARK,
    iconBadge: "0x3",
    description:
      "Legacy token / 0x1::coin era modules and registry-related code (commonly referenced as 0x3 on explorers).",
  },
  "0x0000000000000000000000000000000000000000000000000000000000000004": {
    icon: APTOS_MARK,
    iconBadge: "0x4",
    description:
      "Digital asset standards on Aptos: fungible assets, token objects, and related framework support for on-chain assets.",
  },
  "0x000000000000000000000000000000000000000000000000000000000000000a": {
    icon: APTOS_MARK,
    iconBadge: "0xA",
    description:
      "Aptos Coin (APT) fungible asset metadata and definitions under the FA model (framework fungible asset address 0xA).",
  },
};
