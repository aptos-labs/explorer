/**
 * Known addresses for Testnet
 * Maps addresses to human-readable names for display in the explorer
 */
export const testnetKnownAddresses: Record<string, string> = {
  // Core Framework (same across all networks)
  "0x0000000000000000000000000000000000000000000000000000000000000001":
    "Framework (0x1)",
  "0x0000000000000000000000000000000000000000000000000000000000000003":
    "Legacy Token (0x3)",
  "0x0000000000000000000000000000000000000000000000000000000000000004":
    "Digital Assets (0x4)",
  "0x000000000000000000000000000000000000000000000000000000000000000A":
    "Aptos Coin Fungible Asset",

  // Aave (Testnet)
  "0xb23539ad6490a465e92e751943a3eaedf4b48d7d844ff59adf2ae66bcb09f53d":
    "Aave Testnet Acl",
  "0x4fb5d8348c8873295f97136bbe1c43d976fb18a4a966a85e21d16958eaecef99":
    "Aave Testnet Config",
  "0xb0ec364235f47ad2a8eb52d639c80579b11497d0711879840f1ce51c885b165f":
    "Aave Testnet Data",
  "0xf6f896cefd7b1b1e85ff56033981cf92dcd5d6e93b1349a7ab5003761c52498d":
    "Aave Testnet Math",
  "0xe2b42cab2f84bf57edaf87bcaffee409c2b3d5243e3def00d9d2f7dec568d867":
    "Aave Testnet Mock Underlyings",
  "0xcb9eb79a52f41933192c2e1e37a9e72bfd726fdb9a687cd6cfe45527e52f4e41":
    "Aave Testnet Oracle",
  "0xbd7912c555a06809c2e385eab635ff0ef52b1fa062ce865c785c67694a12bb12":
    "Aave Testnet Pool",

  // Burn Address
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff":
    "Burn Address",
};

/**
 * Known scam addresses for Testnet
 */
export const testnetScamAddresses: Record<string, string> = {
  // Testnet typically doesn't have known scams, but keeping structure for consistency
};
