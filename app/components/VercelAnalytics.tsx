import {Analytics} from "@vercel/analytics/react";
import {SpeedInsights} from "@vercel/speed-insights/react";
import {useRouterState} from "@tanstack/react-router";
import {
  sanitizeVercelAnalyticsPathname,
  vercelAnalyticsBeforeSend,
  vercelSpeedInsightsBeforeSend,
} from "../utils/vercelAnalytics";

/**
 * Client-side Vercel Web Analytics and Speed Insights (FEAT-TELEMETRY-002/003).
 *
 * Both scripts inject on the client only. Page URLs and vital routes are
 * redacted so addresses, hashes, and search text are not sent to Vercel.
 */
export function VercelAnalytics() {
  const route = useRouterState({
    select: (s) => sanitizeVercelAnalyticsPathname(s.location.pathname),
  });

  return (
    <>
      <Analytics
        framework="tanstack-start"
        beforeSend={vercelAnalyticsBeforeSend}
      />
      <SpeedInsights
        framework="tanstack-start"
        route={route}
        beforeSend={vercelSpeedInsightsBeforeSend}
      />
    </>
  );
}
