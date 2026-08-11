import type {NetworkName} from "../../../lib/constants";

/**
 * WormholeScan deep link for cross-chain transfer tracking.
 * Only mainnet is linked — WormholeScan has no documented Aptos testnet UI route
 * for per-tx deep links (testnet API exists but not this hash URL shape).
 */
export function buildCctpScanUrl(
  networkName: NetworkName,
  transactionHash: string,
): string | undefined {
  if (networkName !== "mainnet") {
    return undefined;
  }
  return `https://wormholescan.io/#/tx/${transactionHash}?network=Mainnet`;
}
