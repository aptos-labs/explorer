import React from "react";
import {Stack, useMediaQuery, useTheme} from "@mui/material";
import Map from "./Components/Map";
import {grey} from "../../themes/colors/aptosColorPalette";
import MapMetrics from "./Components/MapMetrics";
import {useGetValidatorSetGeoData} from "../../api/hooks/useGetValidatorSetGeoData";

export default function ValidatorsMap() {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const backgroundColor = theme.palette.mode === "dark" ? grey[800] : grey[50];

  const {validatorGeoMetric, validatorGeoGroups} = useGetValidatorSetGeoData();

  return isOnMobile ? (
    <Stack
      direction="column"
      justifyContent="space-between"
      marginY={4}
      sx={{backgroundColor: backgroundColor}}
      overflow="hidden"
    >
      <Map validatorGeoGroups={validatorGeoGroups} />
      <MapMetrics validatorGeoMetric={validatorGeoMetric} isOnMobile />
    </Stack>
  ) : (
    <Stack
      direction="row"
      justifyContent="space-between"
      marginY={4}
      sx={{backgroundColor: backgroundColor}}
      overflow="hidden"
    >
      <MapMetrics validatorGeoMetric={validatorGeoMetric} />
      <Map validatorGeoGroups={validatorGeoGroups} />
    </Stack>
  );
}
