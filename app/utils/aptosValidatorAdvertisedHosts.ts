/**
 * On-chain `ValidatorConfig.{network_addresses,fullnode_addresses}` values are
 * length-prefixed blobs that embed a DNS hostname as printable ASCII.
 * We recover the longest plausible hostname substring for REST probing.
 *
 * This is a best-effort parse — operators sometimes publish addresses that do
 * not expose a public `GET /v1/` listener on standard ports.
 */
const HOSTNAME_SUBSTRING_RE =
  /[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}/g;

export function extractAdvertisedHostnameFromAddressBlob(
  hexMaybeWith0x: string,
): string | null {
  const trimmed = hexMaybeWith0x.trim();
  if (!trimmed || trimmed === "0x00" || trimmed === "00") return null;
  const hex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
    return null;
  }
  const bytePairs = hex.match(/.{1,2}/g);
  if (!bytePairs) return null;
  let raw: Uint8Array;
  try {
    raw = Uint8Array.from(bytePairs.map((pair) => Number.parseInt(pair, 16)));
  } catch {
    return null;
  }
  if (raw.length === 0) return null;
  const latin1 = new TextDecoder("latin1").decode(raw);
  let best: string | null = null;
  let bestLen = 0;
  HOSTNAME_SUBSTRING_RE.lastIndex = 0;
  for (;;) {
    const match = HOSTNAME_SUBSTRING_RE.exec(latin1);
    if (match === null) break;
    const host = match[0];
    if (host.length >= bestLen) {
      bestLen = host.length;
      best = host;
    }
  }
  return best;
}

/** 40-char lowercase hex aptos-core commit sha */
const GIT_HASH_RE = /^[0-9a-f]{40}$/;

export function normalizeAptosCoreGitHash(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const h = raw.trim().toLowerCase();
  return GIT_HASH_RE.test(h) ? h : null;
}

export async function fetchLedgerGitHashFromBaseUrl(
  baseUrl: string,
  signal: AbortSignal,
): Promise<string | null> {
  const url = `${baseUrl.replace(/\/$/, "")}/`;
  try {
    const res = await fetch(url, {signal});
    if (!res.ok) return null;
    const data = (await res.json()) as {git_hash?: string};
    return normalizeAptosCoreGitHash(data.git_hash);
  } catch {
    return null;
  }
}

const PROBE_TIMEOUT_MS = 4500;

function probeUrlsForHostname(hostname: string): string[] {
  return [
    `https://${hostname}/v1`,
    `http://${hostname}:8080/v1`,
    `http://${hostname}:8180/v1`,
  ];
}

/**
 * Try common HTTPS / HTTP+port shapes against an advertised hostname.
 * No Authorization header — these are third-party operator endpoints.
 */
export async function fetchGitHashFromAdvertisedHostname(
  hostname: string,
): Promise<string | null> {
  const bases = probeUrlsForHostname(hostname);
  const attempts = bases.map((base) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    return fetchLedgerGitHashFromBaseUrl(base, controller.signal).finally(() =>
      clearTimeout(timer),
    );
  });
  const results = await Promise.allSettled(attempts);
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) return r.value;
  }
  return null;
}

export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      const item = items[i];
      if (item === undefined) return;
      results[i] = await fn(item, i);
    }
  }

  const workers = Math.min(concurrency, items.length);
  await Promise.all(Array.from({length: workers}, () => worker()));
  return results;
}

/** Pick the most frequent hash; break ties with lexicographic order (deterministic). */
export function modeGitHash(hashes: readonly string[]): string | null {
  if (hashes.length === 0) return null;
  const counts = new Map<string, number>();
  for (const h of hashes) {
    counts.set(h, (counts.get(h) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = -1;
  for (const [h, c] of counts) {
    if (
      c > bestCount ||
      (c === bestCount && best !== null && h.localeCompare(best) < 0)
    ) {
      bestCount = c;
      best = h;
    }
  }
  return best;
}
