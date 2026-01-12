import React, {useState, useEffect} from "react";
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

// Client-only Map wrapper - prevents any SSR import of react-simple-maps
function ClientOnlyMap({
  validatorGeoGroups,
}: {
  validatorGeoGroups: ValidatorGeoGroup[];
}) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    validatorGeoGroups: ValidatorGeoGroup[];
  }> | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only import on client side after confirming we're in browser
    if (!isClient) return;

    // Use dynamic import to load the client-only Map component
    // Map.client.tsx contains react-simple-maps which can't be imported during SSR
    const loadMap = async () => {
      try {
        const module = await import("./Components/Map.client");
        setMapComponent(() => module.default);
      } catch (e) {
        console.error("Failed to load map component", e);
        setHasError(true);
      }
    };
    loadMap();
  }, [isClient]);

  if (hasError) {
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
        <Typography color="text.secondary">
          Failed to load map component
        </Typography>
      </Box>
    );
  }

  if (!MapComponent) {
    return <MapLoading />;
  }

  return <MapComponent validatorGeoGroups={validatorGeoGroups} />;
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
