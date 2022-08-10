import {walletNetworkMap} from "./constants";

/**
 * Helper function for exhaustiveness checks.
 *
 * Hint: If this function is causing a type error, check to make sure that your
 * switch statement covers all cases!
 */
export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

export const getWalletNetworkFromNetworkMap = (network: string) => {
  if (!(network in walletNetworkMap)) {
    throw `network '${network}' not in Wallet Network Map!`;
  }
  return walletNetworkMap[network];
};
