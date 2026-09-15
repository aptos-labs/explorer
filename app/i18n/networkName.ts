import type {TFunction} from "./I18nProvider";

const NETWORK_KEYS: Record<string, string> = {
  mainnet: "network.mainnet",
  testnet: "network.testnet",
  devnet: "network.devnet",
  local: "network.localnet",
};

export function translateNetworkName(name: string, t: TFunction): string {
  const key = NETWORK_KEYS[name];
  if (key) {
    return t(key);
  }
  if (name.length === 0) {
    return name;
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}
