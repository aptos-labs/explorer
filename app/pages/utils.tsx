// Re-export all utilities from the main utils file
export * from "../utils";

// Import CoinDescription for type usage
import {CoinDescription} from "../api/hooks/useGetCoinList";

/**
 * Coin ordering utility for list display
 */
export function coinOrderIndex(coin: CoinDescription) {
  if (coin.isBanned) {
    return 10000000;
  }

  if (!coin.panoraIndex) {
    return 1000000;
  }
  if (coin.panoraTags.includes("InternalFA")) {
    return coin.panoraIndex + 100000;
  }

  if (coin.panoraTags.includes("LP")) {
    return coin.panoraIndex + 100000;
  }

  if (coin.panoraTags.includes("Bridged")) {
    return coin.panoraIndex + 10000;
  }

  // wrapped but not bridged
  if (coin.name.toLowerCase().includes("wrap")) {
    return coin.panoraIndex + 50000;
  }

  return coin.panoraIndex;
}
