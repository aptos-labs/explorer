/**
 * Utility functions for the Aptos Explorer
 */

import {NetworkName, isValidNetworkName, defaultNetworkName} from "./constants";

/**
 * Gets the network name from search params, defaulting to mainnet
 */
export function getNetworkFromSearchParams(
  searchParams: URLSearchParams,
): NetworkName {
  const network = searchParams.get("network");
  if (network && isValidNetworkName(network)) {
    return network;
  }
  return defaultNetworkName;
}

/**
 * Formats an address for display (truncates middle)
 */
export function truncateAddress(address: string, length = 4): string {
  if (address.length <= length * 2 + 2) {
    return address;
  }
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

/**
 * Formats a number with commas
 */
export function formatNumber(num: number | string): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Converts OCTA to APT
 */
export function octaToApt(octa: bigint | number | string): number {
  const value = typeof octa === "string" ? BigInt(octa) : BigInt(octa);
  return Number(value) / 100000000;
}

/**
 * Converts APT to OCTA
 */
export function aptToOcta(apt: number): bigint {
  return BigInt(Math.floor(apt * 100000000));
}

/**
 * Type guard for checking if an error is a Response error
 */
export function isResponseError(
  error: unknown,
): error is {type: string; message?: string} {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    typeof (error as {type: unknown}).type === "string"
  );
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
