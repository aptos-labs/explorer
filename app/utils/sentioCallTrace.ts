import type {NetworkName} from "~/lib/constants";
import {tryStandardizeAddress} from "~/utils/utils";

export const SENTIO_CALL_TRACE_API =
  "https://app.sentio.xyz/api/v1/move/call_trace";

/** One node in Sentio’s Move call_trace tree (matches their public API shape). */
export type SentioCallTraceNode = {
  from: string;
  to: string;
  contractName: string;
  functionName: string;
  inputs: unknown[];
  returnValue: unknown[];
  typeArgs: string[];
  calls: SentioCallTraceNode[];
  gasUsed: number;
  /** Present when this call aborted (e.g. Move abort or VM error). */
  pcError?: string;
};

export function isSentioCallTraceNode(
  data: unknown,
): data is SentioCallTraceNode {
  if (!data || typeof data !== "object") {
    return false;
  }
  const d = data as Record<string, unknown>;
  if (
    typeof d.from !== "string" ||
    typeof d.to !== "string" ||
    typeof d.contractName !== "string" ||
    typeof d.functionName !== "string" ||
    typeof d.gasUsed !== "number" ||
    !Array.isArray(d.calls) ||
    !Array.isArray(d.inputs) ||
    !Array.isArray(d.returnValue) ||
    !Array.isArray(d.typeArgs)
  ) {
    return false;
  }
  return d.calls.every((child) => isSentioCallTraceNode(child));
}

/** True when this node itself aborted (has a non-empty `pcError`). */
export function isNodeFailed(node: SentioCallTraceNode): boolean {
  return typeof node.pcError === "string" && node.pcError.length > 0;
}

/** True when this node or any descendant carries a `pcError`. */
export function subtreeHasFailure(node: SentioCallTraceNode): boolean {
  if (isNodeFailed(node)) return true;
  return node.calls.some(subtreeHasFailure);
}

/**
 * Sentio uses `module::function` in `functionName` (e.g. `coin::transfer`).
 */
export function parseMoveFunctionParts(
  functionName: string,
): {module: string; fn: string} | null {
  const parts = functionName.split("::");
  if (parts.length < 2) {
    return null;
  }
  const module = parts[0];
  const fn = parts.slice(1).join("::");
  if (!module || !fn) {
    return null;
  }
  return {module, fn};
}

export function normalizeSentioAddress(addr: string): string | undefined {
  const withPrefix = addr.startsWith("0x") ? addr : `0x${addr}`;
  return tryStandardizeAddress(withPrefix);
}

/** Path to the explorer “Run” tab for a module function on an account. */
export function buildAccountModuleRunPath(
  accountAddress: string,
  module: string,
  fn: string,
): string {
  return `/account/${accountAddress}/modules/run/${encodeURIComponent(module)}/${encodeURIComponent(fn)}`;
}

export function buildAccountModuleCodePath(
  accountAddress: string,
  module: string,
): string {
  return `/account/${accountAddress}/modules/code/${encodeURIComponent(module)}`;
}

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
  signal?: AbortSignal,
): Promise<unknown> {
  const normalized = txHash.startsWith("0x") ? txHash : `0x${txHash}`;
  const url = new URL(SENTIO_CALL_TRACE_API);
  url.searchParams.set("networkId", String(networkId));
  url.searchParams.set("txHash", normalized);

  const res = await fetch(url.toString(), {signal});
  if (!res.ok) {
    let detail = "";
    try {
      const rawText = await res.text();
      if (rawText) {
        try {
          const body: unknown = JSON.parse(rawText);
          if (body && typeof body === "object" && "message" in body) {
            detail = String((body as {message: unknown}).message);
          } else {
            detail = rawText;
          }
        } catch {
          detail = rawText;
        }
      }
    } catch {
      detail = res.statusText;
    }
    const statusInfo =
      res.statusText && res.statusText.length > 0
        ? `${res.status} ${res.statusText}`
        : String(res.status);
    const message = detail
      ? `Sentio call trace error (HTTP ${statusInfo}): ${detail}`
      : `Sentio call trace error (HTTP ${statusInfo})`;
    throw new Error(message);
  }
  return res.json();
}
