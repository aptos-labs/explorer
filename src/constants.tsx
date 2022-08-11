import { assertNever } from "./utils";

export const devnetUrl =
  process.env.APTOS_DEVNET_URL || "https://fullnode.devnet.aptoslabs.com/";

export const networks = {
  local: "http://localhost:8080",
  devnet: devnetUrl,
  test: "https://rosetta.aptosdev.com/",
};

export const walleExplorertNetworkMap = (walletNetwork: WalletNetworks):ExplorerNetworks => {
  switch(walletNetwork){
    case "Devnet":
      return "devnet";
    case "Localhost":
      return "local";
    case "Testnet":
      return "test";
    default:
      return assertNever(walletNetwork);
  }
}

export type ExplorerNetworks = keyof typeof networks;

export type WalletNetworks = "Devnet" | "Localhost" | "Testnet";

// Remove trailing slashes
for (let value of Object.values(networks)) {  
  if (value.endsWith("/")) {
    value = value.slice(0, -1);
  }
}

export const defaultNetworkName = "devnet" as const;

if (!(defaultNetworkName in networks)) {
  throw `defaultNetworkName '${defaultNetworkName}' not in Networks!`;
}

export const defaultNetwork = networks[defaultNetworkName];
