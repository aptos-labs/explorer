export const devnetUrl =
  process.env.APTOS_DEVNET_URL || "https://fullnode.devnet.aptoslabs.com/";

export const networks = {
  local: "http://localhost:8080",
  devnet: devnetUrl,
  test: "https://rosetta.aptosdev.com/",
};

export type NetworkName = keyof typeof networks;

// Remove trailing slashes
for (let key of Object.keys(networks)) {
  if (networks[key as keyof typeof networks].endsWith("/")) {
    networks[key as keyof typeof networks] = networks[key as keyof typeof networks].slice(0, -1);
  }
}

export const defaultNetworkName = "devnet" as const;

if (!(defaultNetworkName in networks)) {
  throw `defaultNetworkName '${defaultNetworkName}' not in Networks!`;
}

export const defaultNetwork = networks[defaultNetworkName];
