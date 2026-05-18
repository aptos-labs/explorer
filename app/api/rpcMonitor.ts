/**
 * In-memory RPC request monitor for Aptos fullnode / indexer HTTP calls.
 * Counts every wrapped SDK provider request and legacy AptosClient fetch.
 */

export type RpcSource = "sdk" | "legacy";

export type RpcApiKind = "fullnode" | "indexer" | "faucet" | "other";

export type RpcRequestStatus = "success" | "error";

export type RpcRequestRecord = {
  id: number;
  timestamp: number;
  source: RpcSource;
  api: RpcApiKind;
  method: string;
  path: string;
  originMethod?: string;
  status: RpcRequestStatus;
  statusCode?: number;
  durationMs: number;
};

export type RpcMonitorStats = {
  total: number;
  success: number;
  error: number;
  byApi: Record<RpcApiKind, number>;
  bySource: Record<RpcSource, number>;
  recent: readonly RpcRequestRecord[];
};

const MAX_RECENT = 100;

const listeners = new Set<() => void>();

let nextId = 1;
let total = 0;
let success = 0;
let error = 0;

const byApi: Record<RpcApiKind, number> = {
  fullnode: 0,
  indexer: 0,
  faucet: 0,
  other: 0,
};

const bySource: Record<RpcSource, number> = {
  sdk: 0,
  legacy: 0,
};

const recent: RpcRequestRecord[] = [];

/** Stable snapshot for `useSyncExternalStore` — must keep referential equality between updates. */
let statsSnapshot: RpcMonitorStats = {
  total: 0,
  success: 0,
  error: 0,
  byApi: {...byApi},
  bySource: {...bySource},
  recent: [],
};

function rebuildStatsSnapshot(): void {
  statsSnapshot = {
    total,
    success,
    error,
    byApi: {...byApi},
    bySource: {...bySource},
    recent: [...recent],
  };
}

function notify() {
  rebuildStatsSnapshot();
  for (const listener of listeners) {
    listener();
  }
}

function isDevelopmentBuild(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isRpcMonitorLoggingEnabled(): boolean {
  if (import.meta.env.VITE_RPC_MONITOR_LOG === "false") {
    return false;
  }
  return isDevelopmentBuild() || import.meta.env.VITE_RPC_MONITOR === "true";
}

export function isRpcMonitorPanelEnabled(): boolean {
  return isDevelopmentBuild() || import.meta.env.VITE_RPC_MONITOR === "true";
}

export function classifyRpcUrl(url: string): RpcApiKind {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (host.includes("faucet") || path.includes("/mint")) {
      return "faucet";
    }
    if (
      path.includes("graphql") ||
      host.includes("indexer") ||
      host.includes("hasura")
    ) {
      return "indexer";
    }
    if (
      path.includes("/v1") ||
      host.includes("fullnode") ||
      host.includes("api.")
    ) {
      return "fullnode";
    }
    return "other";
  } catch {
    return "other";
  }
}

export function extractRpcPath(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

type RecordRpcRequestInput = {
  source: RpcSource;
  api: RpcApiKind;
  method: string;
  path: string;
  url: string;
  originMethod?: string;
  status: RpcRequestStatus;
  statusCode?: number;
  durationMs: number;
};

export function recordRpcRequest(
  input: RecordRpcRequestInput,
): RpcRequestRecord {
  const record: RpcRequestRecord = {
    id: nextId++,
    timestamp: Date.now(),
    source: input.source,
    api: input.api,
    method: input.method,
    path: input.path,
    originMethod: input.originMethod,
    status: input.status,
    statusCode: input.statusCode,
    durationMs: input.durationMs,
  };

  total += 1;
  if (input.status === "success") {
    success += 1;
  } else {
    error += 1;
  }
  byApi[input.api] += 1;
  bySource[input.source] += 1;

  recent.unshift(record);
  if (recent.length > MAX_RECENT) {
    recent.length = MAX_RECENT;
  }

  if (isRpcMonitorLoggingEnabled()) {
    const origin = input.originMethod ? ` · ${input.originMethod}` : "";
    const statusLabel =
      input.statusCode !== undefined ? `${input.statusCode}` : input.status;
    console.info(
      `[RPC #${total}] ${input.source}/${input.api} ${input.method} ${input.path}${origin} → ${statusLabel} (${input.durationMs.toFixed(0)}ms)`,
    );
  }

  notify();
  return record;
}

export function getRpcMonitorStats(): RpcMonitorStats {
  return statsSnapshot;
}

export function resetRpcMonitor(): void {
  nextId = 1;
  total = 0;
  success = 0;
  error = 0;
  byApi.fullnode = 0;
  byApi.indexer = 0;
  byApi.faucet = 0;
  byApi.other = 0;
  bySource.sdk = 0;
  bySource.legacy = 0;
  recent.length = 0;
  rebuildStatsSnapshot();
  notify();
}

export function subscribeRpcMonitor(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
