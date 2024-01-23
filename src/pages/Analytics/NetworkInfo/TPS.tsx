import {Box, Stack} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useGetPeakTPS, useGetTPS} from "../../../api/hooks/useGetTPS";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import MetricCard, {DoubleMetricCard} from "./MetricCard";

function getFormattedTPS(tps: number) {
  tps = tps + 1; // to avoid reducing tps from `toFixed` api
  const tpsWithDecimal = parseFloat(tps.toFixed(0));
  return tpsWithDecimal.toLocaleString("en-US");
}

export default function TPS() {
  const {tps} = useGetTPS();
  const {peakTps} = useGetPeakTPS();
  const [state] = useGlobalState();
  const [showPeakTps, setShowPeakTps] = useState<boolean>(true);

  useEffect(() => {
    if (state.network_name === "mainnet") {
      setShowPeakTps(true);
    } else {
      setShowPeakTps(false);
    }
  }, [state]);

  return showPeakTps ? (
    <DoubleMetricCard
      data1={tps ? getFormattedTPS(tps) : "-"}
      data2={peakTps ? getFormattedTPS(peakTps) : "-"}
      label1="REAL-TIME"
      label2="PEAK LAST 30 DAYS"
      cardLabel="TPS"
      tooltip={
        <Stack spacing={1}>
          <Box>
            <Box sx={{fontWeight: 700}}>Real-Time</Box>
            <Box>Current rate of transactions per second on the network.</Box>
          </Box>
          <Box>
            <Box sx={{fontWeight: 700}}>Peak Last 30 Days</Box>
            <Box>
              Highest rate of transactions per second over the past 30 days,
              averaged over 15 blocks.
            </Box>
          </Box>
        </Stack>
      }
    />
  ) : (
    <MetricCard
      data={tps ? getFormattedTPS(tps) : "-"}
      label="TPS"
      tooltip="Current rate of transactions per second on the network."
    />
  );
}
