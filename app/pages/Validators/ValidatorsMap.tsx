import React, {useState, useEffect, Suspense} from "react";
import {
  Stack,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import MapMetrics from "./Components/MapMetrics";
import {useGetValidatorSetGeoData} from "../../api/hooks/useGetValidatorsGeoData";
import {useGetEpochTime} from "../../api/hooks/useGetEpochTime";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import {SkeletonTheme} from "react-loading-skeleton";
import type {ValidatorGeoGroup} from "../../api/hooks/useGetValidatorsGeoData";

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

// Lazy load the Map component
const LazyMap = React.lazy(() => import("./Components/Map"));

class MapErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: unknown) {
    console.error("Map component error:", error);
    return {hasError: true};
  }

  render() {
    if (this.state.hasError) {
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
          <Typography color="text.secondary">Unable to load map</Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Client-only Map wrapper - prevents any SSR import of react-simple-maps
function ClientOnlyMap({
  validatorGeoGroups,
}: {
  validatorGeoGroups: ValidatorGeoGroup[];
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <MapLoading />;
  }

  return (
    <MapErrorBoundary>
      <Suspense fallback={<MapLoading />}>
        <LazyMap validatorGeoGroups={validatorGeoGroups} />
      </Suspense>
    </MapErrorBoundary>
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
          <ClientOnlyMap validatorGeoGroups={validatorGeoGroups} />
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
          <ClientOnlyMap validatorGeoGroups={validatorGeoGroups} />
        </Stack>
      )}
    </SkeletonTheme>
  );
}
