import type {TokenFlowEdge} from "./tokenFlowGraph";

const MAX_STORED_EDGES = 2000;

export type TokenFlowStoredBucket = {
  network: string;
  account: string;
  asset: string;
  direction: "inbound" | "outbound";
  edges: TokenFlowEdge[];
  updatedAt: number;
};

function storageKey(
  network: string,
  account: string,
  asset: string,
  direction: string,
) {
  return `aptos-explorer-token-flow-edges:${network}:${account}:${asset}:${direction}`;
}

function readStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadTokenFlowEdgesFromStorage(
  network: string,
  account: string,
  asset: string,
  direction: "inbound" | "outbound",
): TokenFlowEdge[] {
  const storage = readStorage();
  if (!storage) {
    return [];
  }
  try {
    const raw = storage.getItem(storageKey(network, account, asset, direction));
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as TokenFlowStoredBucket;
    if (!Array.isArray(parsed.edges)) {
      return [];
    }
    return parsed.edges;
  } catch {
    return [];
  }
}

export function mergeAndPersistTokenFlowEdges(
  network: string,
  account: string,
  asset: string,
  direction: "inbound" | "outbound",
  incoming: TokenFlowEdge[],
): TokenFlowEdge[] {
  const storage = readStorage();
  if (!storage) {
    return incoming.slice(0, MAX_STORED_EDGES);
  }
  const existing = loadTokenFlowEdgesFromStorage(
    network,
    account,
    asset,
    direction,
  );
  const merged = mergeEdges(existing, incoming, MAX_STORED_EDGES);
  try {
    const bucket: TokenFlowStoredBucket = {
      network,
      account,
      asset,
      direction,
      edges: merged,
      updatedAt: Date.now(),
    };
    storage.setItem(
      storageKey(network, account, asset, direction),
      JSON.stringify(bucket),
    );
  } catch {
    // ignore quota
  }
  return merged;
}

export function clearTokenFlowEdgesForScope(
  network: string,
  account: string,
  asset: string,
  direction: "inbound" | "outbound",
) {
  const storage = readStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(storageKey(network, account, asset, direction));
  } catch {
    // ignore
  }
}

export function mergeEdges(
  existing: TokenFlowEdge[],
  incoming: TokenFlowEdge[],
  max: number,
): TokenFlowEdge[] {
  const map = new Map<string, TokenFlowEdge>();
  for (const e of incoming) {
    map.set(e.id, e);
  }
  for (const e of existing) {
    if (!map.has(e.id)) {
      map.set(e.id, e);
    }
  }
  return [...map.values()].sort((a, b) => b.version - a.version).slice(0, max);
}
