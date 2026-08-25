import {Analytics} from "@vercel/analytics/react";
import {vercelAnalyticsBeforeSend} from "../utils/vercelAnalytics";

/**
 * Client-side Vercel Web Analytics (FEAT-TELEMETRY-002).
 *
 * The React component injects the tracking script on the client only. Page
 * URLs are redacted in `beforeSend` so addresses, hashes, and search text
 * are not sent to Vercel.
 */
export function VercelAnalytics() {
  return (
    <Analytics
      framework="tanstack-start"
      beforeSend={vercelAnalyticsBeforeSend}
    />
  );
}
