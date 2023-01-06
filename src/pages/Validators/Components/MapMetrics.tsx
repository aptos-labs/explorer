import React from "react";
import {Grid, Stack} from "@mui/material";
import {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorSetGeoData";
import EpochSection from "./Epoch";
import StakingSection from "./Staking";
import NodeCountsSection from "./NodeCounts";

type MapMetricsProps = {
  validatorGeoMetric: ValidatorGeoMetric;
  isOnMobile?: boolean;
  isSkeletonLoading: boolean;
};

export default function MapMetrics({
  validatorGeoMetric,
  isOnMobile,
  isSkeletonLoading,
}: MapMetricsProps) {
  return isOnMobile ? (
    <Grid
      container
      direction="row"
      marginX={2}
      marginTop={0.5}
      marginBottom={4}
      spacing={2}
    >
      <Grid item xs={12} sm={6}>
        <NodeCountsSection
          validatorGeoMetric={validatorGeoMetric}
          isSkeletonLoading={isSkeletonLoading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <EpochSection isSkeletonLoading={isSkeletonLoading} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StakingSection isSkeletonLoading={isSkeletonLoading} />
      </Grid>
    </Grid>
  ) : (
    <Stack
      marginY={4}
      marginLeft={4}
      spacing={4}
      justifyContent="center"
      minWidth={232}
    >
      <NodeCountsSection
        validatorGeoMetric={validatorGeoMetric}
        isSkeletonLoading={isSkeletonLoading}
      />
      <EpochSection isSkeletonLoading={isSkeletonLoading} />
      <StakingSection isSkeletonLoading={isSkeletonLoading} />
    </Stack>
  );
}
