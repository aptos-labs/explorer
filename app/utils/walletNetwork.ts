/**
 * Wallet ↔ explorer network alignment helpers.
 *
 * Non-Petra wallets often report SDK `Network.CUSTOM` while the explorer uses
 * `local` for loopback development; treat them as compatible when the wallet
 * RPC URL targets localhost / loopback.
 */

export function isLoopbackHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost") return true;
  if (h === "::1" || h === "0:0:0:0:0:0:0:1") return true;

  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) {
    const parts = h.split(".").map(Number);
    if (
      parts.length === 4 &&
      parts[0] === 127 &&
      parts.every((n) => n >= 0 && n <= 255)
    ) {
      return true;
    }
  }

  return false;
}

export function isLoopbackRpcUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return isLoopbackHostname(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * When the explorer is on `local`, allow a wallet-reported `custom` network
 * for non-Petra wallets if the wallet's REST URL points at loopback.
 */
export function allowsCustomNetworkForLocalExplorer(
  walletName: string | undefined,
  walletNetworkName: string | undefined,
  walletRpcUrl: string | undefined,
  explorerNetworkName: string,
): boolean {
  if (walletName === "Petra") return false;
  if (explorerNetworkName.toLowerCase() !== "local") return false;
  if (walletNetworkName?.toLowerCase() !== "custom") return false;
  return isLoopbackRpcUrl(walletRpcUrl);
}
