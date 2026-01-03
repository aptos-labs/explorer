import React, {lazy, Suspense} from "react";
import {
  Stack,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Box,
} from "@mui/material";
import MapMetrics from "./Components/MapMetrics";
import {useGetValidatorSetGeoData} from "../../api/hooks/useGetValidatorsGeoData";
import {useGetEpochTime} from "../../api/hooks/useGetEpochTime";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import {SkeletonTheme} from "react-loading-skeleton";

// Lazy load Map component to avoid SSR issues with react-simple-maps/d3
// These libraries have ESM/CommonJS compatibility issues during server rendering
const Map = lazy(() => import("./Components/Map"));

// Loading placeholder for the map
function MapLoading() {
  return (
    <Box
      sx={{
        width: "100%",
        height: 450,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function ValidatorsMap() {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === "dark";
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const backgroundColor = theme.palette.background.paper;

  const {validatorGeoMetric, validatorGeoGroups} = useGetValidatorSetGeoData();
  const {curEpoch} = useGetEpochTime();
  const {totalVotingPower, numberOfActiveValidators} = useGetValidatorSet();

  // Calculate isSkeletonLoading during render instead of using useEffect
  const isSkeletonLoading =
    !curEpoch || !totalVotingPower || !numberOfActiveValidators;

  return (
    <SkeletonTheme
      baseColor={isDarkTheme ? theme.palette.neutralShade.lighter : undefined}
    >
      {isOnMobile ? (
        <Stack
          direction="column"
          justifyContent="space-between"
          marginY={4}
          sx={{backgroundColor: backgroundColor}}
          overflow="hidden"
        >
          <Suspense fallback={<MapLoading />}>
            <Map validatorGeoGroups={validatorGeoGroups} />
          </Suspense>
          <MapMetrics
            validatorGeoMetric={validatorGeoMetric}
            isOnMobile={isOnMobile}
            isSkeletonLoading={isSkeletonLoading}
          />
        </Stack>
      ) : (
        <Stack
          direction="row"
          justifyContent="space-between"
          marginY={4}
          sx={{backgroundColor: backgroundColor}}
          overflow="hidden"
        >
          <MapMetrics
            validatorGeoMetric={validatorGeoMetric}
            isOnMobile={isOnMobile}
            isSkeletonLoading={isSkeletonLoading}
          />
          <Suspense fallback={<MapLoading />}>
            <Map validatorGeoGroups={validatorGeoGroups} />
          </Suspense>
        </Stack>
      )}
    </SkeletonTheme>
  );
}
