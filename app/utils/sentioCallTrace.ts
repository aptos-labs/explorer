import type {NetworkName} from "~/lib/constants";

export const SENTIO_CALL_TRACE_API =
  "https://app.sentio.xyz/api/v1/move/call_trace";

/**
 * Sentio `networkId` for the public call_trace API. Currently only mainnet is
 * wired; other Aptos networks may use different ids once documented.
 */
export function getSentioCallTraceNetworkId(
  networkName: NetworkName,
): number | undefined {
  if (networkName === "mainnet") {
    return 1;
  }
  return undefined;
}

export function getSentioTransactionTraceViewerUrl(
  networkName: NetworkName,
  txHash: string,
): string | null {
  if (networkName !== "mainnet") {
    return null;
  }
  const h = txHash.startsWith("0x") ? txHash : `0x${txHash}`;
  return `https://app.sentio.xyz/tx/aptos_mainnet/${h}`;
}

export async function fetchSentioCallTrace(
  networkId: number,
  txHash: string,
): Promise<unknown> {
  const normalized = txHash.startsWith("0x") ? txHash : `0x${txHash}`;
  const url = new URL(SENTIO_CALL_TRACE_API);
  url.searchParams.set("networkId", String(networkId));
  url.searchParams.set("txHash", normalized);

  const res = await fetch(url.toString());
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === "object" && "message" in body) {
        detail = String((body as {message: unknown}).message);
      }
    } catch {
      try {
        detail = await res.text();
      } catch {
        /* ignore */
      }
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json();
}
