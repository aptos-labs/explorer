import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import ExplorerRoutes from "./ExplorerRoutes";
import {ErrorBoundary} from "./components/ErrorBoundary";
import {isRateLimitError} from "./utils/rateLimiter";
import {ResponseError, ResponseErrorType} from "./api/client";

import * as Sentry from "@sentry/react";

import ReactGA from "react-ga4";
import {initGTM} from "./api/hooks/useGoogleTagManager";
import {GTMEvents} from "./dataConstants";

initGTM({
  events: {
    walletConnection: GTMEvents.WALLET_CONNECTION,
    searchStats: GTMEvents.SEARCH_STATS,
  },
});

ReactGA.initialize(import.meta.env.GA_TRACKING_ID || "G-8XH7V50XK7");

// TODO: redirect to the new explorer domain on the domain host
if (window.location.origin.includes("explorer.devnet.aptos.dev")) {
  const new_location = window.location.href.replace(
    "explorer.devnet.aptos.dev",
    "explorer.aptoslabs.com",
  );
  window.location.replace(new_location);
}

Sentry.init({
  dsn: "https://531160c88f78483491d129c02be9f774@o1162451.ingest.sentry.io/6249755",
  integrations: [Sentry.browserTracingIntegration()],
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
});

// inform the compiler of the existence of the window.aptos API
// This is the legacy Petra wallet API that may be injected by browser extensions
declare global {
  interface Window {
    aptos?: {
      connect?: () => Promise<unknown>;
      disconnect?: () => Promise<void>;
      account?: () => Promise<{address: string}>;
      signAndSubmitTransaction?: (transaction: unknown) => Promise<unknown>;
      signTransaction?: (transaction: unknown) => Promise<unknown>;
      isConnected?: () => Promise<boolean>;
      network?: () => Promise<string>;
      [key: string]: unknown; // Allow for additional properties
    };
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default staleTime: 30 seconds for dynamic data
      staleTime: 30 * 1000,
      // Default gcTime (formerly cacheTime): 5 minutes
      gcTime: 5 * 60 * 1000,
      // Refetch on window focus for real-time data
      refetchOnWindowFocus: true,
      // Custom retry logic that handles rate limits with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 404 errors
        if (
          error &&
          typeof error === "object" &&
          "type" in error &&
          (error as ResponseError).type === ResponseErrorType.NOT_FOUND
        ) {
          return false;
        }
        // Retry rate limit errors up to 3 times with exponential backoff
        if (isRateLimitError(error)) {
          return failureCount < 3;
        }
        // Retry other errors once
        return failureCount < 1;
      },
      // Exponential backoff for retries (handled by React Query)
      retryDelay: (attemptIndex, error) => {
        // For rate limit errors, use exponential backoff
        if (isRateLimitError(error)) {
          const baseDelay = 1000; // 1 second
          const maxDelay = 30000; // 30 seconds max
          const delay = Math.min(
            baseDelay * Math.pow(2, attemptIndex),
            maxDelay,
          );
          // Add jitter (±20%)
          const jitter = delay * 0.2 * (Math.random() * 2 - 1);
          return Math.max(0, delay + jitter);
        }
        // For other errors, use shorter delay
        return Math.min(1000 * (attemptIndex + 1), 5000);
      },
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
  },
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ExplorerRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
