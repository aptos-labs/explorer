/**
 * Lightweight fullnode / archival REST helpers for search and pruned-hash
 * lookups. Public nodes answer `404` for pruned transaction hashes (they
 * cannot tell a pruned hash from one that never existed) and do not advertise
 * an archival retry. Version `0` still 410s with `archival_endpoint` when the
 * node prunes, so we cache that URL and retry hash/version reads there
 * **without** API credentials — archive hosts 401 when the explorer's
 * gateway key is forwarded (the SDK still forwards it because
 * `archive.*.aptoslabs.com` is same-site with `api.*.aptoslabs.com`).
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

/**
 * Discover the node's advertised archival endpoint, or `null` when the node
 * still holds genesis (no pruning). Returns `undefined` on probe failure.
 */
export async function resolveArchivalEndpoint(
  fullnodeUrl: string,
  fullnodeHeaders?: Record<string, string>,
  signal?: AbortSignal,
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
    return undefined;
  }

  if (resp.status === 410) {
    const endpoint = archivalEndpointFromResponse(
      resp,
      await readJsonBody(resp),
      key,
    );
    archivalEndpointCache.set(key, endpoint ?? null);
    return endpoint ?? null;
  }

  if (resp.ok) {
    await cancelBody(resp);
    archivalEndpointCache.set(key, null);
    return null;
  }

  return undefined;
}

function archivalTransactionPath(txnHashOrVersion: string): string {
  if (/^\d+$/.test(txnHashOrVersion)) {
    const stripped = txnHashOrVersion.replace(/^0+(?=\d)/, "");
    return `transactions/by_version/${stripped}`;
  }
  return `transactions/by_hash/${normalizeTransactionHash(txnHashOrVersion)}`;
}

export async function transactionHashExists(
  fullnodeUrl: string,
  hash: string,
  fullnodeHeaders?: Record<string, string>,
  signal?: AbortSignal,
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

  const archival = await resolveArchivalEndpoint(node, fullnodeHeaders, signal);
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
  return false;
}

export async function fetchTransactionFromArchival(
  fullnodeUrl: string,
  txnHashOrVersion: string,
  fullnodeHeaders?: Record<string, string>,
  signal?: AbortSignal,
): Promise<unknown | null> {
  const archival = await resolveArchivalEndpoint(
    fullnodeUrl,
    fullnodeHeaders,
    signal,
  );
  if (!archival) return null;

  let resp: Response;
  try {
    resp = await fetch(
      `${archival}/${archivalTransactionPath(txnHashOrVersion)}`,
      {
        signal,
        credentials: "omit",
      },
    );
  } catch {
    return null;
  }
  if (!resp.ok) return null;
  return readJsonBody(resp);
}
