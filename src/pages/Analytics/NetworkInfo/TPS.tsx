import {Box, Stack} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useGetPeakTPS, useGetTPS} from "../../../api/hooks/useGetTPS";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import MetricCard, {DoubleMetricCard} from "./MetricCard";
import { availableNetworks } from "../../../constants";

function getFormattedTPS(tps: number) {
  //tps = tps + 1; // to avoid reducing tps from `toFixed` api
  const tpsWithDecimal = parseFloat(tps.toFixed(0));
  return tpsWithDecimal.toLocaleString("en-US");
}

export default function TPS() {
  const {tps} = useGetTPS();
  const {peakTps} = useGetPeakTPS();
  const [state] = useGlobalState();
  const [showPeakTps, setShowPeakTps] = useState<boolean>(true);

  useEffect(() => {
    const showNetworks = availableNetworks;
    if (showNetworks.includes(state.network_name)) {
      setShowPeakTps(true);
    } else {
      setShowPeakTps(false);
    }
  }, [state]);

  //const isMainnet = state.network_name === "mainnet" || state.network_name === "devnet";
  const showRealTime = false; // Toggle to show real-time TPS. Previously targetted mainnet.

  return showPeakTps ? (
    <DoubleMetricCard
      data1={
        showRealTime
          ? tps
            ? getFormattedTPS(tps)
            : "-"
          : peakTps
            ? getFormattedTPS(peakTps)
            : "-"
      }
      data2={showRealTime ? (peakTps ? getFormattedTPS(peakTps) : "-") : undefined}
      label1={showRealTime ? "REAL-TIME" : "PEAK LAST 30 DAYS"}
      label2={showRealTime ? "PEAK LAST 30 DAYS" : undefined}
      cardLabel="Max TPS"
      tooltip={
        showRealTime ? (
          <Stack spacing={1}>
            <Box>
              <Box sx={{fontWeight: 700}}>Real-Time</Box>
              <Box>Current rate of transactions per second on the network.</Box>
            </Box>
            <Box>
              <Box sx={{fontWeight: 700}}>Peak Last 30 Days</Box>
              <Box>
                The highest count of user transactions within any two-block interval on a given day, divided by the duration (in seconds) of that interval.
              </Box>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Box>
              <Box sx={{fontWeight: 700}}>Peak Last 30 Days</Box>
              <Box>
                The highest count of user transactions within any two-block interval on a given day, divided by the duration (in seconds) of that interval.
              </Box>
            </Box>
          </Stack>
        )
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
