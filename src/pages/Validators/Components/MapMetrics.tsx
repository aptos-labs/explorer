import React from "react";
import {Grid, Stack, Typography} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {ValidatorGeoMetric} from "../../../api/hooks/useGetValidatorSetGeoData";

type MapMetricsProps = {
  validatorGeoMetric: ValidatorGeoMetric;
  isOnMobile?: boolean;
};

export default function MapMetrics({
  validatorGeoMetric,
  isOnMobile,
}: MapMetricsProps) {
  const fontSizeTitle = {xs: 20, md: 25};
  const fontSizeSubtitle = {xs: 15, md: 17};
  const fontSizeBody = {xs: 12, md: 14};
  const lineSpacing = {xs: 0.2, md: 0.5};

  const nodeCountsSection = (
    <Stack spacing={lineSpacing}>
      <Typography sx={{fontSize: fontSizeTitle}}>
        {`${validatorGeoMetric.nodeCount} Nodes`}
      </Typography>
      <Typography
        sx={{fontSize: fontSizeSubtitle}}
        color={grey[450]}
      >{`${validatorGeoMetric.countryCount} Countries`}</Typography>
      <Typography
        sx={{fontSize: fontSizeSubtitle}}
        color={grey[450]}
      >{`${validatorGeoMetric.cityCount} Cities`}</Typography>
    </Stack>
  );

  // TODO: add real data
  const epochSection = (
    <Stack spacing={2}>
      <Stack spacing={lineSpacing}>
        <Typography sx={{fontSize: fontSizeSubtitle}}>Epoch 321</Typography>
        <Typography sx={{fontSize: fontSizeBody}} color={grey[450]}>
          16 minutes remaining
        </Typography>
      </Stack>
      <Stack spacing={lineSpacing}>
        <Typography sx={{fontSize: fontSizeBody}} color={grey[450]}>
          Current leader
        </Typography>
        <Typography sx={{fontSize: fontSizeBody}} color="#D946EF">
          0xe8fa...8788
        </Typography>
      </Stack>
    </Stack>
  );

  // TODO: add real data
  const stakeSection = (
    <Stack spacing={lineSpacing}>
      <Stack direction="row" spacing={0.7} alignItems="center">
        <Typography sx={{fontSize: fontSizeSubtitle}}>829,615,127</Typography>
        <Typography sx={{fontSize: fontSizeBody}}>Staked</Typography>
      </Stack>
      <Typography sx={{fontSize: fontSizeBody}} color={grey[450]}>
        7% rewards per year
      </Typography>
    </Stack>
  );

  return isOnMobile ? (
    <Grid
      container
      direction="row"
      marginX={2}
      marginTop={0.5}
      marginBottom={2}
    >
      <Grid item xs={6} sm={4}>
        {nodeCountsSection}
      </Grid>
      <Grid item xs={6} sm={4}>
        {epochSection}
      </Grid>
      <Grid item xs={6} sm={4}>
        {stakeSection}
      </Grid>
    </Grid>
  ) : (
    <Stack marginY={4} marginLeft={4} spacing={4} justifyContent="center">
      {nodeCountsSection}
      {epochSection}
      {stakeSection}
    </Stack>
  );
}
