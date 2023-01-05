import React from "react";
import {Grid, Stack, Typography} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorSetGeoData";
import MetricSection from "./MetricSection";
import {
  epochSectionSkeleton,
  fontSizeBodySmall,
  fontSizeSubtitle,
  fontSizeTitle,
  fontSizeTitleSmall,
  nodeCountsSectionSkeleton,
  stakingSectionSkeleton,
} from "../constants";
import EpochSection from "./Epoch";
import StakingSection from "./Staking";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";

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
  const {numberOfActiveValidators} = useGetValidatorSet();
  const nodeCountsSection = (
    <MetricSection>
      <Typography sx={{fontSize: {xs: fontSizeTitleSmall, md: fontSizeTitle}}}>
        {numberOfActiveValidators} Nodes
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
        color={grey[450]}
      >
        {validatorGeoMetric.countryCount} Countries
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
        color={grey[450]}
      >
        {validatorGeoMetric.cityCount} Cities
      </Typography>
    </MetricSection>
  );

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
        {!isSkeletonLoading ? nodeCountsSection : nodeCountsSectionSkeleton}
      </Grid>
      <Grid item xs={12} sm={6}>
        {!isSkeletonLoading ? <EpochSection /> : epochSectionSkeleton}
      </Grid>
      <Grid item xs={12} sm={6}>
        {!isSkeletonLoading ? <StakingSection /> : stakingSectionSkeleton}
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
      {!isSkeletonLoading ? nodeCountsSection : nodeCountsSectionSkeleton}
      {!isSkeletonLoading ? <EpochSection /> : epochSectionSkeleton}
      {!isSkeletonLoading ? <StakingSection /> : stakingSectionSkeleton}
    </Stack>
  );
}
