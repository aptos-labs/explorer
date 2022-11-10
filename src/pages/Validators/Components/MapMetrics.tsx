import React from "react";
import {Grid, Stack, Typography} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorSetGeoData";
import MetricSection from "./MetricSection";
import Subtitle from "./Text/Subtitle";
import Body from "./Text/Body";
import {
  fontSizeBodySmall,
  fontSizeSubtitle,
  fontSizeTitle,
  fontSizeTitleSmall,
} from "../constants";
import Epoch from "./Epoch";

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

  // TODO: add real data
  const stakeSection = (
    <MetricSection>
      <Stack direction="row" spacing={0.7} alignItems="center">
        <Subtitle>829,615,127</Subtitle>
        <Body color="inherit">Staked</Body>
      </Stack>
      <Body>7% rewards per year</Body>
    </MetricSection>
  );

  return isOnMobile ? (
    <Grid
      container
      direction="row"
      marginX={{xs: 2, sm: 4}}
      marginTop={0.5}
      marginBottom={3}
    >
      <Grid item xs={6} sm={4}>
        {nodeCountsSection}
      </Grid>
      <Grid item xs={6} sm={4}>
        <Epoch />
      </Grid>
      <Grid item xs={6} sm={4} marginTop={{xs: 2, sm: 0}}>
        {stakeSection}
      </Grid>
    </Grid>
  ) : (
    <Stack marginY={4} marginLeft={4} spacing={4} justifyContent="center">
      {nodeCountsSection}
      <Epoch />
      {stakeSection}
    </Stack>
  );
}
