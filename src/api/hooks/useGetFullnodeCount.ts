import {useEffect, useState} from "react";
import {NodeCountData, useGetAnalyticsData} from "./useGetAnalyticsData";

export function useGetFullnodeCount() {
  const [latestNodeCount, setLatestNodeCount] = useState<number | null>(null);

  const analyticsData = useGetAnalyticsData();

  useEffect(() => {
    if (analyticsData?.latest_node_count !== undefined) {
      const data = analyticsData.latest_node_count as NodeCountData[];
      setLatestNodeCount(data[data.length - 1].approx_nodes);
    }
  }, [analyticsData?.latest_node_count]);

  return {latestNodeCount};
}
