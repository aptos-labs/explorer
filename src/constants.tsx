export const devnetUrl =
  process.env.APTOS_DEVNET_URL || "https://fullnode.devnet.aptoslabs.com/";

export const networks = {
  local: "http://localhost:8080",
  Devnet: devnetUrl,
  Test: "https://rosetta.aptosdev.com/",
  Ait3: "https://ait3.aptosdev.com/",
  Sherry: "https://sherryx.aptosdev.com/",
};

export type NetworkName = keyof typeof networks;

// Remove trailing slashes
for (const key of Object.keys(networks)) {
  const networkName = key as NetworkName;
  if (networks[networkName].endsWith("/")) {
    networks[networkName] = networks[networkName].slice(0, -1);
  }
}

export const defaultNetworkName: NetworkName = "Devnet" as const;

if (!(defaultNetworkName in networks)) {
  throw `defaultNetworkName '${defaultNetworkName}' not in Networks!`;
}

export const defaultNetwork = networks[defaultNetworkName];
