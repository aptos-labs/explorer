/**
 * Known addresses for Devnet
 * Maps addresses to human-readable names for display in the explorer
 */
export const devnetKnownAddresses: Record<string, string> = {
  // Core Framework (same across all networks)
  "0x0000000000000000000000000000000000000000000000000000000000000001":
    "Framework (0x1)",
  "0x0000000000000000000000000000000000000000000000000000000000000003":
    "Legacy Token (0x3)",
  "0x0000000000000000000000000000000000000000000000000000000000000004":
    "Digital Assets (0x4)",
  "0x000000000000000000000000000000000000000000000000000000000000000A":
    "Aptos Coin Fungible Asset",

  // Burn Address
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff":
    "Burn Address",
};

/**
 * Known scam addresses for Devnet
 */
export const devnetScamAddresses: Record<string, string> = {
  // Devnet doesn't track scams
};
