export const devnetUrl =
  process.env.APTOS_DEVNET_URL || "https://fullnode.devnet.aptoslabs.com/";

export const testnetUrl =
  process.env.APTOS_TESTNET_URL || "http://awsnode1.aptosdev.com/";

export const networks: Record<string, string> = {
  local: "http://localhost:8080",
  devnet: devnetUrl,
  testnet: testnetUrl,
};
// Remove trailing slashes
for (let key of Object.keys(networks)) {
  if (networks[key].endsWith("/")) {
    networks[key] = networks[key].slice(0, -1);
  }
}

export const defaultNetworkName: string = "devnet";

if (!(defaultNetworkName in networks)) {
  throw `defaultNetworkName '${defaultNetworkName}' not in Networks!`;
}

export const defaultNetwork = networks[defaultNetworkName];
