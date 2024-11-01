import React from "react";
import MetricCard from "./MetricCard";
import {useGetFullnodeCount} from "../../../api/hooks/useGetFullnodeCount";

export default function ActiveFullnodes() {
  const {latestNodeCount} = useGetFullnodeCount();

  return (
    <MetricCard
      data={latestNodeCount ? latestNodeCount.toLocaleString("en-US") : "-"}
      label="Active Fullnodes"
      tooltip="Number of approximate fullnodes. Updated once every 24 hours."
    />
  );
}
