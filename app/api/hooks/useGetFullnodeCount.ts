import {NodeCountData, useGetAnalyticsData} from "./useGetAnalyticsData";

export function useGetFullnodeCount() {
  const analyticsData = useGetAnalyticsData();

  // Calculate value during render instead of using useEffect
  const latestNodeCount =
    analyticsData?.latest_node_count !== undefined
      ? (analyticsData.latest_node_count as NodeCountData[])[
          analyticsData.latest_node_count.length - 1
        ].approx_nodes
      : null;

  return {latestNodeCount};
}
