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
