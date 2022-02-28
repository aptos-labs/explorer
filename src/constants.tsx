export const testnet_url = process.env.APTOS_TESTNET_URL || "http://localhost:8080";

export const networks: Record<string, string> = {
  "local": "http://localhost:8080",
  "testnet": testnet_url,
  "dev_testnet": "https://dev.testnet.aptoslabs.com",
};

export const default_network: string = "dev_testnet";

if (!(default_network in networks)) {
  throw `DefaultNetwork '${default_network}' not in Networks!`;
}