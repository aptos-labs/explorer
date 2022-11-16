import React from "react";
import {Grid, Stack, Typography} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorSetGeoData";
import MetricSection from "./MetricSection";
import {
  fontSizeBodySmall,
  fontSizeSubtitle,
  fontSizeTitle,
  fontSizeTitleSmall,
} from "../constants";
import EpochSection from "./Epoch";
import StakingSection from "./Staking";

type MapMetricsProps = {
  validatorGeoMetric: ValidatorGeoMetric;
  isOnMobile?: boolean;
};

export default function MapMetrics({
  validatorGeoMetric,
  isOnMobile,
}: MapMetricsProps) {
  const nodeCountsSection = (
    <MetricSection>
      <Typography sx={{fontSize: {xs: fontSizeTitleSmall, md: fontSizeTitle}}}>
        {`${validatorGeoMetric.nodeCount} Nodes`}
      </Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
        color={grey[450]}
      >{`${validatorGeoMetric.countryCount} Countries`}</Typography>
      <Typography
        sx={{fontSize: {xs: fontSizeBodySmall, md: fontSizeSubtitle}}}
        color={grey[450]}
      >{`${validatorGeoMetric.cityCount} Cities`}</Typography>
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
        {nodeCountsSection}
      </Grid>
      <Grid item xs={12} sm={6}>
        <EpochSection />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StakingSection />
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
      {nodeCountsSection}
      <EpochSection />
      <StakingSection />
    </Stack>
  );
}
