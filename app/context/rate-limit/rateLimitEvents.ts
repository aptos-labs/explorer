type RateLimitListener = () => void;

const listeners = new Set<RateLimitListener>();

export function onRateLimit(listener: RateLimitListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitRateLimit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Detect a 429 / rate-limit from any error shape the app may encounter:
 *   - `{ type: "Too Many Requests" }` (ResponseError from app/api/client.ts)
 *   - `{ status: 429 }` (AptosApiError, Response, or similar)
 *   - `Error` with "too many requests" or "429" in its message
 */
export function isRateLimitLike(error: unknown): boolean {
  if (!error) return false;

  if (typeof error === "object" && error !== null) {
    if (
      "type" in error &&
      (error as {type: string}).type === "Too Many Requests"
    )
      return true;
    if ("status" in error && (error as {status: number}).status === 429)
      return true;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("too many requests") || msg.includes("429")) return true;
  }

  return false;
}
