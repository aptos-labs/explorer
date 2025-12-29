# Rate Limiting Implementation

## Overview

A comprehensive rate limiting system has been implemented to prevent API throttling and improve reliability. The system includes:

- **Token bucket algorithm** for proactive rate limiting
- **Request queuing** for when rate limits are hit
- **Exponential backoff** with jitter for retries
- **Per-endpoint rate limit tracking**
- **React Query integration** for automatic retry handling

## Components

### 1. Rate Limiter Utility (`src/utils/rateLimiter.ts`)

A centralized rate limiting utility that provides:

- `withRateLimit<T>(fn, endpoint, config?)` - Wraps API calls with rate limiting
- `isRateLimitError(error)` - Detects rate limit errors
- `retryWithBackoff<T>(fn, maxRetries?, baseDelayMs?)` - Retries with exponential backoff
- `getEndpointFromUrl(url)` - Extracts endpoint from URL for rate limiting

**Default Configuration:**

- 100 requests per minute per endpoint
- 3 retries with exponential backoff
- Base delay: 1 second
- Max delay: 30 seconds

### 2. React Query Integration (`src/index.tsx`)

React Query has been configured with intelligent retry logic:

- **Rate limit errors**: Retry up to 3 times with exponential backoff (1s, 2s, 4s)
- **404 errors**: No retry (immediate failure)
- **Other errors**: Retry once with shorter delay

The retry delay includes jitter (±20%) to prevent thundering herd problems.

### 3. Error Handling (`src/api/client.ts`)

The `withResponseError` function detects rate limit errors (HTTP 429) and converts them to `ResponseErrorType.TOO_MANY_REQUESTS`.

## Usage

### Basic Usage with Rate Limiting

For high-volume operations, wrap API calls with `withRateLimit`:

```typescript
import {withRateLimit, getEndpointFromUrl} from "../utils/rateLimiter";

// Extract endpoint from client URL
const endpoint = getEndpointFromUrl(client.nodeUrl);

// Wrap API call with rate limiting
const result = await withRateLimit(
  () => client.getTransactions({start: 0, limit: 100}),
  endpoint,
  {
    maxRequests: 50, // Custom limit for this endpoint
    windowMs: 60000, // Per minute
  },
);
```

### React Query Automatic Retry

React Query automatically handles rate limit retries for all queries:

```typescript
const {data, error} = useQuery({
  queryKey: ["transactions", networkValue],
  queryFn: () => getTransactions({limit: 100}, aptosClient),
  // Rate limit retries are handled automatically
});
```

### Manual Retry with Backoff

For non-React Query scenarios:

```typescript
import {retryWithBackoff, isRateLimitError} from "../utils/rateLimiter";

try {
  const result = await retryWithBackoff(
    () => someApiCall(),
    3, // max retries
    1000, // base delay (1 second)
  );
} catch (error) {
  if (isRateLimitError(error)) {
    // Handle rate limit error
  }
}
```

## Configuration

### Per-Endpoint Rate Limits

Different endpoints can have different rate limits:

```typescript
const result = await withRateLimit(
  () => apiCall(),
  "api.mainnet.aptoslabs.com",
  {
    maxRequests: 200, // Higher limit for mainnet
    windowMs: 60000,
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 10000,
  },
);
```

### Global Rate Limit Configuration

To change default rate limits, modify `DEFAULT_CONFIG` in `src/utils/rateLimiter.ts`:

```typescript
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100, // Change default
  windowMs: 60000,
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};
```

## How It Works

### Token Bucket Algorithm

1. Each endpoint has a "bucket" of tokens (default: 100)
2. Tokens refill over time (100 per minute)
3. Each request consumes 1 token
4. If no tokens available, request is queued

### Request Queuing

When rate limits are hit:

1. Request is added to a queue
2. Queue processor waits for tokens to refill
3. Requests are processed in order
4. Rate-limited requests are automatically retried with backoff

### Exponential Backoff

Retry delays increase exponentially:

- Attempt 1: ~1 second
- Attempt 2: ~2 seconds
- Attempt 3: ~4 seconds
- Max: 30 seconds

Jitter (±20%) prevents synchronized retries.

## Benefits

1. **Prevents API Throttling**: Proactive rate limiting prevents hitting limits
2. **Automatic Retry**: Failed requests due to rate limits are automatically retried
3. **Better UX**: Users don't see errors, requests are queued and retried
4. **Per-Endpoint Tracking**: Different endpoints can have different limits
5. **Configurable**: Easy to adjust limits per endpoint or globally

## Migration Notes

### Existing Code

Existing code continues to work without changes. React Query automatically handles rate limit retries.

### CSV Export (`AccountAllTransactions.tsx`)

The CSV export already has custom retry logic. This can be simplified to use the centralized rate limiter:

```typescript
// Before (custom retry logic)
const retryWithBackoff = async (fn, maxRetries = 3) => {
  // ... custom implementation
};

// After (use centralized utility)
import {retryWithBackoff} from "../../utils/rateLimiter";
```

## Future Enhancements

1. **Rate Limit Detection from Headers**: Parse `Retry-After` headers from 429 responses
2. **Adaptive Rate Limiting**: Adjust limits based on server responses
3. **Priority Queues**: Prioritize certain requests (e.g., user-initiated vs background)
4. **Metrics**: Track rate limit hits and retry success rates
5. **Visual Feedback**: Show users when requests are queued due to rate limits

## Testing

To test rate limiting:

1. Make many rapid API calls
2. Observe requests being queued
3. Check console for rate limit warnings
4. Verify requests eventually succeed after retries

## Monitoring

Rate limit events are logged to console in development:

- Rate limit hits: `"Rate limit hit, retrying in Xms (attempt Y/Z)"`
- Queue processing errors: `"Rate limiter queue processing error: ..."`

In production, consider integrating with error tracking (e.g., Sentry) to monitor rate limit frequency.
