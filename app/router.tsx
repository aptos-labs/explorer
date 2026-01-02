import {createRouter as createTanStackRouter} from "@tanstack/react-router";
import {QueryClient} from "@tanstack/react-query";
import {routeTree} from "./routeTree.gen";
import {NavigationPending} from "./components/NavigationPending";

// Create a new QueryClient for each request (SSR safety)
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default staleTime: 30 seconds for dynamic data
        staleTime: 30 * 1000,
        // Default gcTime (formerly cacheTime): 5 minutes
        gcTime: 5 * 60 * 1000,
        // Refetch on window focus for real-time data
        refetchOnWindowFocus: true,
        // Custom retry logic
        retry: (failureCount, error) => {
          // Don't retry on 404 errors
          if (
            error &&
            typeof error === "object" &&
            "type" in error &&
            (error as {type: string}).type === "Not Found"
          ) {
            return false;
          }
          // Retry other errors once
          return failureCount < 1;
        },
        // Exponential backoff for retries
        retryDelay: (attemptIndex) => {
          return Math.min(1000 * (attemptIndex + 1), 5000);
        },
        // Don't refetch on mount if data is fresh
        refetchOnMount: true,
      },
    },
  });
}

// Global QueryClient for client-side (singleton pattern)
let clientQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient
    return createQueryClient();
  }
  // Browser: use singleton pattern
  if (!clientQueryClient) {
    clientQueryClient = createQueryClient();
  }
  return clientQueryClient;
}

export function createRouter() {
  const queryClient = getQueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    // Show pending component during navigation
    defaultPendingComponent: NavigationPending,
    // Minimum time to show pending component to avoid flicker
    defaultPendingMinMs: 200,
    // Wait before showing pending component for fast navigations
    defaultPendingMs: 100,
  });

  return router;
}

// Export getRouter for TanStack Start compatibility
export function getRouter() {
  return createRouter();
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
