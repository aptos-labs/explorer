export const testnet_url = process.env.APTOS_TESTNET_URL || "http://localhost:8080";

export const networks: Record<string, string> = {
  "local": "http://localhost:8080",
  "testnet": testnet_url,
  "dev_testnet": "https://dev.fullnode.aptoslabs.com",
};
// Remove trailing slashes
for (let key of Object.keys(networks)) {
  if (networks[key].endsWith("/")) {
    networks[key] = networks[key].slice(0, -1);
  }
}

export const default_network: string = "dev_testnet";

if (!(default_network in networks)) {
  throw `DefaultNetwork '${default_network}' not in Networks!`;
}