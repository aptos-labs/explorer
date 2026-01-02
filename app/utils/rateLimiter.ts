/**
 * Rate Limiter - Centralized rate limiting and request queuing system
 *
 * Features:
 * - Token bucket algorithm for rate limiting
 * - Request queuing for when rate limits are hit
 * - Exponential backoff for retries
 * - Per-endpoint rate limit tracking
 * - Automatic retry with jitter
 */

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Maximum number of retries for rate-limited requests
   */
  maxRetries?: number;
  /**
   * Base delay for exponential backoff in milliseconds
   */
  baseDelayMs?: number;
  /**
   * Maximum delay between retries in milliseconds
   */
  maxDelayMs?: number;
}

interface QueuedRequest {
  fn: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  retries: number;
  endpoint: string;
}

interface EndpointRateLimit {
  tokens: number;
  lastRefill: number;
  config: RateLimitConfig;
  queue: QueuedRequest[];
  processing: boolean;
}

// Default rate limit configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100, // 100 requests
  windowMs: 60000, // per minute
  maxRetries: 3,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 30000, // 30 seconds max
};

// Per-endpoint rate limiters
const endpointLimiters = new Map<string, EndpointRateLimit>();

/**
 * Get or create a rate limiter for a specific endpoint
 */
function getRateLimiter(
  endpoint: string,
  config?: Partial<RateLimitConfig>,
): EndpointRateLimit {
  if (!endpointLimiters.has(endpoint)) {
    const fullConfig = {...DEFAULT_CONFIG, ...config};
    endpointLimiters.set(endpoint, {
      tokens: fullConfig.maxRequests,
      lastRefill: Date.now(),
      config: fullConfig,
      queue: [],
      processing: false,
    });
  }
  return endpointLimiters.get(endpoint)!;
}

/**
 * Refill tokens based on elapsed time (token bucket algorithm)
 */
function refillTokens(limiter: EndpointRateLimit): void {
  const now = Date.now();
  const elapsed = now - limiter.lastRefill;
  const tokensToAdd = Math.floor(
    (elapsed / limiter.config.windowMs) * limiter.config.maxRequests,
  );

  if (tokensToAdd > 0) {
    limiter.tokens = Math.min(
      limiter.config.maxRequests,
      limiter.tokens + tokensToAdd,
    );
    limiter.lastRefill = now;
  }
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const delay = Math.min(exponentialDelay, maxDelayMs);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.max(0, delay + jitter);
}

/**
 * Process the request queue for an endpoint
 */
async function processQueue(limiter: EndpointRateLimit): Promise<void> {
  if (limiter.processing || limiter.queue.length === 0) {
    return;
  }

  limiter.processing = true;

  while (limiter.queue.length > 0) {
    refillTokens(limiter);

    if (limiter.tokens < 1) {
      // No tokens available, wait until next refill
      const waitTime = limiter.config.windowMs / limiter.config.maxRequests;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }

    const request = limiter.queue.shift();
    if (!request) {
      break;
    }

    // Consume a token
    limiter.tokens -= 1;

    try {
      const result = await request.fn();
      request.resolve(result);
    } catch (error) {
      // Check if it's a rate limit error
      const isRateLimit =
        (error &&
          typeof error === "object" &&
          "status" in error &&
          (error as {status: number}).status === 429) ||
        (error &&
          typeof error === "object" &&
          "type" in error &&
          (error as {type: string}).type === "Too Many Requests");

      if (isRateLimit && request.retries < (limiter.config.maxRetries ?? 3)) {
        // Rate limited - retry with exponential backoff
        const delay = calculateBackoffDelay(
          request.retries,
          limiter.config.baseDelayMs ?? 1000,
          limiter.config.maxDelayMs ?? 30000,
        );

        // Re-queue the request
        setTimeout(() => {
          limiter.queue.unshift({
            ...request,
            retries: request.retries + 1,
          });
          processQueue(limiter).catch(console.error);
        }, delay);
      } else {
        // Not rate limited or max retries reached
        request.reject(error);
      }
    }
  }

  limiter.processing = false;
}

/**
 * Execute a function with rate limiting
 *
 * @param fn - The async function to execute
 * @param endpoint - Endpoint identifier for rate limiting (e.g., "api.mainnet.aptoslabs.com")
 * @param config - Optional rate limit configuration
 * @returns Promise that resolves with the function result
 */
export async function withRateLimit<T>(
  fn: () => Promise<T>,
  endpoint: string,
  config?: Partial<RateLimitConfig>,
): Promise<T> {
  const limiter = getRateLimiter(endpoint, config);

  return new Promise<T>((resolve, reject) => {
    limiter.queue.push({
      fn: fn as () => Promise<unknown>,
      resolve: resolve as (value: unknown) => void,
      reject,
      retries: 0,
      endpoint,
    });

    processQueue(limiter).catch((error) => {
      console.error("Rate limiter queue processing error:", error);
    });
  });
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  // Check for HTTP 429 status
  if ("status" in error && (error as {status: number}).status === 429) {
    return true;
  }

  // Check for ResponseError type
  if (
    "type" in error &&
    (error as {type: string}).type === "Too Many Requests"
  ) {
    return true;
  }

  // Check error message
  if (
    "message" in error &&
    typeof (error as {message: string}).message === "string"
  ) {
    const message = (error as {message: string}).message.toLowerCase();
    if (
      message.includes("rate limit") ||
      message.includes("too many requests")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Extract endpoint from URL for rate limiting
 */
export function getEndpointFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    // If URL parsing fails, use the whole string as endpoint
    return url;
  }
}

/**
 * Retry a function with exponential backoff when rate limited
 *
 * @param fn - The async function to execute
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelayMs - Base delay for exponential backoff (default: 1000ms)
 * @returns Promise that resolves with the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRateLimitError(error)) {
        // Not a rate limit error, throw immediately
        throw error;
      }

      if (attempt < maxRetries - 1) {
        // Calculate delay with exponential backoff
        const delay = calculateBackoffDelay(
          attempt,
          baseDelayMs,
          30000, // max 30 seconds
        );

        console.warn(
          `Rate limit hit, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
