import React, {useEffect, useState} from "react";
import {Stack, useMediaQuery, useTheme} from "@mui/material";
import Map from "./Components/Map";
import {grey} from "../../themes/colors/aptosColorPalette";
import MapMetrics from "./Components/MapMetrics";
import {useGetValidatorSetGeoData} from "../../api/hooks/useGetMainnetValidatorsGeoData";
import {useGetEpochTime} from "../../api/hooks/useGetEpochTime";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import {SkeletonTheme} from "react-loading-skeleton";

export default function ValidatorsMap() {
  const theme = useTheme();
  const isDarkTheme = theme.palette.mode === "dark";
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const backgroundColor = isDarkTheme ? grey[800] : grey[50];

  const {validatorGeoMetric, validatorGeoGroups} = useGetValidatorSetGeoData();
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(true);
  const {curEpoch} = useGetEpochTime();
  const {totalVotingPower} = useGetValidatorSet();
  const {numberOfActiveValidators} = useGetValidatorSet();

  useEffect(() => {
    if (curEpoch && totalVotingPower && numberOfActiveValidators) {
      setIsSkeletonLoading(false);
    }
  }, [curEpoch, totalVotingPower, numberOfActiveValidators]);

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
