import React from "react";
import {Grid2, Stack} from "@mui/material";
import {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorsGeoData";
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
    <Grid2
      container
      direction="row"
      marginX={2}
      marginTop={0.5}
      marginBottom={4}
      spacing={2}
    >
      <Grid2 size={{xs: 12, sm: 6}}>
        <NodeCountsSection
          validatorGeoMetric={validatorGeoMetric}
          isSkeletonLoading={isSkeletonLoading}
        />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        <EpochSection isSkeletonLoading={isSkeletonLoading} />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        <StakingSection isSkeletonLoading={isSkeletonLoading} />
      </Grid2>
    </Grid2>
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
