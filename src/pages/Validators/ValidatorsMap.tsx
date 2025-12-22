import React, {useEffect, useState} from "react";
import {Stack, useMediaQuery, useTheme} from "@mui/material";
import Map from "./Components/Map";
import {grey} from "../../themes/colors/aptosColorPalette";
import MapMetrics from "./Components/MapMetrics";
import {useGetValidatorSetGeoData} from "../../api/hooks/useGetValidatorsGeoData";
import {useGetEpochTime} from "../../api/hooks/useGetEpochTime";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import {SkeletonTheme} from "react-loading-skeleton";

export default function ValidatorsMap() {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === "dark";
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const backgroundColor = isDarkTheme ? grey[800] : grey[50];

  const {validatorGeoMetric, validatorGeoGroups, hasGeoData} = useGetValidatorSetGeoData();
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);
  const {curEpoch} = useGetEpochTime();
  const {totalVotingPower} = useGetValidatorSet();
  const {numberOfActiveValidators} = useGetValidatorSet();

  useEffect(() => {
    if (curEpoch && totalVotingPower && numberOfActiveValidators) {
      setIsSkeletonLoading(false);
    }
  }, [curEpoch, totalVotingPower, numberOfActiveValidators]);

  // When no geo data, render a simpler layout without the map container styling
  if (!hasGeoData) {
    return (
      <SkeletonTheme baseColor={isDarkTheme ? grey[500] : undefined}>
        <MapMetrics
          validatorGeoMetric={validatorGeoMetric}
          isOnMobile={isOnMobile}
          isSkeletonLoading={isSkeletonLoading}
          hasGeoData={hasGeoData}
        />
      </SkeletonTheme>
    );
  }

  return (
    <SkeletonTheme baseColor={isDarkTheme ? grey[500] : undefined}>
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
            hasGeoData={hasGeoData}
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
            hasGeoData={hasGeoData}
          />
          <Map validatorGeoGroups={validatorGeoGroups} />
        </Stack>
      )}
    </SkeletonTheme>
  );
}
