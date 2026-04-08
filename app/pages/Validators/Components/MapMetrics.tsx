import {Grid, Stack} from "@mui/material";
import type {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorsGeoData";
import EpochSection from "./Epoch";
import NodeCountsSection from "./NodeCounts";
import StakingSection from "./Staking";

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
      sx={{marginX: 2, marginTop: 0.5, marginBottom: 4}}
      spacing={2}
    >
      <Grid size={{xs: 12, sm: 6}}>
        <NodeCountsSection
          validatorGeoMetric={validatorGeoMetric}
          isSkeletonLoading={isSkeletonLoading}
        />
      </Grid>
      <Grid size={{xs: 12, sm: 6}}>
        <EpochSection isSkeletonLoading={isSkeletonLoading} />
      </Grid>
      <Grid size={{xs: 12, sm: 6}}>
        <StakingSection isSkeletonLoading={isSkeletonLoading} />
      </Grid>
    </Grid>
  ) : (
    <Stack
      spacing={4}
      sx={{marginY: 4, marginLeft: 4, justifyContent: "center", minWidth: 232}}
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
