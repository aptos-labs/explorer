/**
 * Lightweight fullnode / archival REST helpers for search, pruned history,
 * and historical reads after the serving public fullnode misses (before the
 * indexer, which cannot reconstruct a full REST body).
 *
 * Public nodes answer `404` for pruned transaction hashes (they cannot tell
 * a pruned hash from one that never existed) and do not advertise an
 * archival retry. Version `0` still 410s with `archival_endpoint` when the
 * node prunes. We cache that URL, or derive `archive.{rest}` from Aptos Labs
 * `api.*` hosts, and retry there **without** API credentials — archive hosts
 * 401 when the explorer's gateway key is forwarded (`archive.*.aptoslabs.com`
 * is same-site with `api.*.aptoslabs.com`, so the SDK forwards it).
 */

const archivalEndpointCache = new Map<string, string | null>();

export function resetArchivalEndpointCache(): void {
  archivalEndpointCache.clear();
}

export function toStringHeaders(
  headers?: Record<string, string | number | boolean>,
): Record<string, string> | undefined {
  if (!headers) return undefined;
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key, String(value)]),
  );
}

export function headersFromAptosClient(client: {
  config?: {
    clientConfig?: {HEADERS?: Record<string, string | number | boolean>};
  };
}): Record<string, string> | undefined {
  return toStringHeaders(client.config?.clientConfig?.HEADERS);
}

export function normalizeNodeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function normalizeTransactionHash(hash: string): string {
  const trimmed = hash.trim().toLowerCase();
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

/**
 * Aptos Labs archive hosts follow `api.{network}…` → `archive.{network}…`.
 * Used when a 410 does not advertise `archival_endpoint`, or the version-0
 * probe fails, so last-resort reads still have a URL.
 */
export function defaultArchiveNodeUrl(fullnodeUrl: string): string | undefined {
  try {
    const url = new URL(fullnodeUrl);
    const host = url.hostname.toLowerCase();
    if (!host.startsWith("api.")) return undefined;
    if (!host.endsWith(".aptoslabs.com") && host !== "aptoslabs.com") {
      return undefined;
    }
    url.hostname = `archive.${host.slice("api.".length)}`;
    url.hash = "";
    url.search = "";
    return normalizeNodeUrl(url.toString());
  } catch {
    return undefined;
  }
}

const NETWORK_ARCHIVE_URLS: Record<string, string> = {
  mainnet: "https://archive.mainnet.aptoslabs.com/v1",
  testnet: "https://archive.testnet.aptoslabs.com/v1",
};

export function fallbackArchiveNodeUrl(
  fullnodeUrl?: string,
  network?: string,
): string | undefined {
  if (fullnodeUrl) {
    const derived = defaultArchiveNodeUrl(fullnodeUrl);
    if (derived) return derived;
  }
  const name = network?.toLowerCase();
  if (name && name in NETWORK_ARCHIVE_URLS) {
    return NETWORK_ARCHIVE_URLS[name];
  }
  return undefined;
}

export function networkNameFromAptosClient(client: {
  config?: {network?: string};
}): string | undefined {
  const network = client.config?.network;
  return typeof network === "string" ? network : undefined;
}

export function parseArchivalEndpoint(
  data: unknown,
  originUrl?: string,
): string | undefined {
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as {archival_endpoint?: unknown}).archival_endpoint !==
      "string"
  ) {
    return undefined;
  }
  const advertised = (data as {archival_endpoint: string}).archival_endpoint;
  try {
    const archivalUrl = new URL(advertised);
    if (archivalUrl.protocol !== "https:" && archivalUrl.protocol !== "http:") {
      return undefined;
    }
    if (originUrl) {
      const origin = new URL(originUrl);
      if (origin.protocol === "https:" && archivalUrl.protocol !== "https:") {
        return undefined;
      }
    }
    return advertised.replace(/\/+$/, "");
  } catch {
    return undefined;
  }
}

async function readJsonBody(resp: Response): Promise<unknown> {
  try {
    return await resp.json();
  } catch {
    return undefined;
  }
}

async function cancelBody(resp: Response): Promise<void> {
  try {
    await resp.body?.cancel();
  } catch {
    // Already consumed or not cancellable (jsdom / mock).
  }
}

function archivalEndpointFromResponse(
  resp: Response,
  body: unknown,
  originUrl: string,
): string | undefined {
  return (
    parseArchivalEndpoint(body, originUrl) ??
    parseArchivalEndpoint(
      {archival_endpoint: resp.headers.get("x-aptos-archival-endpoint")},
      originUrl,
    )
  );
}

function cacheAndReturn(key: string, endpoint: string | null): string | null {
  archivalEndpointCache.set(key, endpoint);
  return endpoint;
}

/**
 * Discover the node's advertised archival endpoint, or `null` when the node
 * still holds genesis (no pruning). Returns `undefined` on probe failure.
 * A 410 without `archival_endpoint` uses the Aptos Labs archive host derived
 * from the fullnode URL (or the network default).
 */
export async function resolveArchivalEndpoint(
  fullnodeUrl: string,
  fullnodeHeaders?: Record<string, string>,
  signal?: AbortSignal,
  network?: string,
): Promise<string | null | undefined> {
  const key = normalizeNodeUrl(fullnodeUrl);
  if (archivalEndpointCache.has(key)) {
    return archivalEndpointCache.get(key);
  }

  const probeUrl = `${key}/transactions/by_version/0`;
  let resp: Response;
  try {
    resp = await fetch(probeUrl, {
      signal,
      credentials: "omit",
      headers: fullnodeHeaders,
    });
  } catch {
    const fallback = fallbackArchiveNodeUrl(key, network);
    if (fallback) return cacheAndReturn(key, fallback);
    return undefined;
  }

  if (resp.status === 410) {
    const advertised = archivalEndpointFromResponse(
      resp,
      await readJsonBody(resp),
      key,
    );
    const endpoint = advertised ?? fallbackArchiveNodeUrl(key, network) ?? null;
    return cacheAndReturn(key, endpoint);
  }

  if (resp.ok) {
    await cancelBody(resp);
    return cacheAndReturn(key, null);
  }

  await cancelBody(resp);
  const fallback = fallbackArchiveNodeUrl(key, network);
  if (fallback) return cacheAndReturn(key, fallback);
  return undefined;
}

/**
 * Archive URL for a last-resort read. `null` from the probe means the serving
 * node still has genesis (not pruning) — do not guess an archive. `undefined`
 * (probe failed) still uses the derived / network default.
 */
export async function archivalUrlForFallback(
  fullnodeUrl: string,
  fullnodeHeaders?: Record<string, string>,
  signal?: AbortSignal,
  network?: string,
): Promise<string | undefined> {
  const resolved = await resolveArchivalEndpoint(
    fullnodeUrl,
    fullnodeHeaders,
    signal,
    network,
  );
  if (resolved) return resolved;
  if (resolved === null) return undefined;
  return fallbackArchiveNodeUrl(fullnodeUrl, network);
}

function archivalTransactionPath(txnHashOrVersion: string): string {
  if (/^\d+$/.test(txnHashOrVersion)) {
    const stripped = txnHashOrVersion.replace(/^0+(?=\d)/, "");
    return `transactions/by_version/${stripped}`;
  }
  return `transactions/by_hash/${normalizeTransactionHash(txnHashOrVersion)}`;
}

function archivalBlockPath(request: {
  height?: number | bigint;
  version?: number | bigint;
  withTransactions?: boolean;
}): string | undefined {
  const qs = `with_transactions=${request.withTransactions === true}`;
  if (request.height !== undefined) {
    return `blocks/by_height/${request.height}?${qs}`;
  }
  if (request.version !== undefined) {
    return `blocks/by_version/${request.version}?${qs}`;
  }
  return undefined;
}

async function fetchArchivalJson(
  archivalBase: string,
  path: string,
  signal?: AbortSignal,
): Promise<unknown | null> {
  let resp: Response;
  try {
    resp = await fetch(`${archivalBase}/${path}`, {
      signal,
      credentials: "omit",
    });
  } catch {
    return null;
  }
  if (!resp.ok) {
    await cancelBody(resp);
    return null;
  }
  return readJsonBody(resp);
}

export async function transactionHashExists(
  fullnodeUrl: string,
  hash: string,
  fullnodeHeaders?: Record<string, string>,
  signal?: AbortSignal,
  network?: string,
): Promise<boolean> {
  const node = normalizeNodeUrl(fullnodeUrl);
  const path = archivalTransactionPath(hash);
  const primaryUrl = `${node}/${path}`;

  let primary: Response;
  try {
    primary = await fetch(primaryUrl, {
      signal,
      credentials: "omit",
      headers: fullnodeHeaders,
    });
  } catch {
    return false;
  }

  if (primary.ok) {
    await cancelBody(primary);
    return true;
  }

  if (primary.status !== 404 && primary.status !== 410) {
    await cancelBody(primary);
    return false;
  }

  await cancelBody(primary);

  const archival = await archivalUrlForFallback(
    node,
    fullnodeHeaders,
    signal,
    network,
  );
  if (!archival) return false;

  let archived: Response;
  try {
    archived = await fetch(`${archival}/${path}`, {
      signal,
      credentials: "omit",
    });
  } catch {
    return false;
  }

  if (archived.ok) {
    await cancelBody(archived);
    return true;
  }
  await cancelBody(archived);
  return false;
}

export async function fetchTransactionFromArchival(
  fullnodeUrl: string,
  txnHashOrVersion: string,
  fullnodeHeaders?: Record<string, string>,
  signal?: AbortSignal,
  network?: string,
): Promise<unknown | null> {
  const archival = await archivalUrlForFallback(
    fullnodeUrl,
    fullnodeHeaders,
    signal,
    network,
  );
  if (!archival) return null;
  return fetchArchivalJson(
    archival,
    archivalTransactionPath(txnHashOrVersion),
    signal,
  );
}

export async function fetchBlockFromArchival(
  fullnodeUrl: string,
  request: {
    height?: number | bigint;
    version?: number | bigint;
    withTransactions?: boolean;
  },
  fullnodeHeaders?: Record<string, string>,
  signal?: AbortSignal,
  network?: string,
): Promise<unknown | null> {
  const path = archivalBlockPath(request);
  if (!path) return null;
  const archival = await archivalUrlForFallback(
    fullnodeUrl,
    fullnodeHeaders,
    signal,
    network,
  );
  if (!archival) return null;
  return fetchArchivalJson(archival, path, signal);
}
