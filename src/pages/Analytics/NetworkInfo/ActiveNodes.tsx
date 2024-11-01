import {Box, Stack} from "@mui/material";
import React from "react";
import {DoubleMetricCard} from "./MetricCard";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import {useGetFullnodeCount} from "../../../api/hooks/useGetFullnodeCount";

export default function ActiveNodes() {
  const {latestNodeCount} = useGetFullnodeCount();
  const {numberOfActiveValidators} = useGetValidatorSet();

  return (
    <DoubleMetricCard
      data1={
        numberOfActiveValidators
          ? numberOfActiveValidators.toLocaleString("en-US")
          : "-"
      }
      data2={latestNodeCount ? latestNodeCount.toLocaleString("en-US") : "-"}
      label1="Validators"
      label2="Fullnodes"
      cardLabel="Active Nodes"
      tooltip={
        <Stack spacing={1}>
          <Box>
            <Box sx={{fontWeight: 700}}>Active Validators</Box>
            <Box>
              Number of validators in the validator set in the current epoch.
            </Box>
          </Box>
          <Box>
            <Box sx={{fontWeight: 700}}>Active Fullnodes</Box>
            <Box>Number of approximate fullnodes.</Box>
          </Box>
        </Stack>
      }
    />
  );
}
