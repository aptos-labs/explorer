import React from "react";
import {Stack, useMediaQuery, useTheme} from "@mui/material";
import Map from "./Components/Map";
import MapMetrics from "./Components/MapMetrics";
import {useGetValidatorSetGeoData} from "../../api/hooks/useGetValidatorsGeoData";
import {useGetEpochTime} from "../../api/hooks/useGetEpochTime";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import {SkeletonTheme} from "react-loading-skeleton";

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
          <Map validatorGeoGroups={validatorGeoGroups} />
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
          <Map validatorGeoGroups={validatorGeoGroups} />
        </Stack>
      )}
    </SkeletonTheme>
  );
}
