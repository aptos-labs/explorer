import {createFileRoute} from "@tanstack/react-router";
import {ANALYTICS_DATA_URL} from "../api/hooks/useGetAnalyticsData";
import {getNetworkFromSearch} from "../api/createClient";
import {PagePending} from "../components/NavigationPending";
import {defaultNetworkName} from "../constants";
import AnalyticsPage from "../pages/Analytics/Index";

export const Route = createFileRoute("/analytics")({
  // Pre-fetch the mainnet analytics JSON from GCS so the page renders with
  // chart data populated. Skipped on non-mainnet (the hook is disabled there)
  // and on errors, since the bucket is publicly readable.
  loader: async ({context, location}) => {
    const {queryClient} = context;
    const search = Object.fromEntries(
      new URLSearchParams(location.search),
    ) as Record<string, string>;
    const networkName = getNetworkFromSearch(search);

    if (networkName !== defaultNetworkName) return {};

    try {
      await queryClient.ensureQueryData({
        queryKey: ["analyticsData", networkName],
        queryFn: async () => {
          const response = await fetch(ANALYTICS_DATA_URL);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch analytics data: ${response.status}`,
            );
          }
          return response.json();
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
      });
    } catch {
      // Falls through to the client-side fetch in `useGetAnalyticsData`.
    }
    return {};
  },
  pendingComponent: PagePending,
  component: AnalyticsPage,
});
