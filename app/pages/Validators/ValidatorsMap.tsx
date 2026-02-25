import {
  Box,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type React from "react";
import {useEffect, useState} from "react";
import {useGetEpochTime} from "../../api/hooks/useGetEpochTime";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import type {ValidatorGeoGroup} from "../../api/hooks/useGetValidatorsGeoData";
import {useGetValidatorSetGeoData} from "../../api/hooks/useGetValidatorsGeoData";
import type {MapGroupBy} from "./Components/Map.client";
import MapMetrics from "./Components/MapMetrics";

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
  groupBy,
}: {
  validatorGeoGroups: ValidatorGeoGroup[];
  groupBy: MapGroupBy;
}) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    validatorGeoGroups: ValidatorGeoGroup[];
    groupBy: MapGroupBy;
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

  return (
    <MapComponent validatorGeoGroups={validatorGeoGroups} groupBy={groupBy} />
  );
}

export default function ValidatorsMap() {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const backgroundColor = theme.palette.background.paper;

  const {validatorGeoMetric, cityGroups, countryGroups} =
    useGetValidatorSetGeoData();
  const {curEpoch} = useGetEpochTime();
  const {totalVotingPower, numberOfActiveValidators} = useGetValidatorSet();

  const [groupBy, setGroupBy] = useState<MapGroupBy>("city");

  const handleGroupByChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: MapGroupBy | null,
  ) => {
    if (newValue !== null) {
      setGroupBy(newValue);
    }
  };

  // Calculate isSkeletonLoading during render instead of using useEffect
  const isSkeletonLoading =
    !curEpoch || !totalVotingPower || !numberOfActiveValidators;

  const activeGroups = groupBy === "city" ? cityGroups : countryGroups;

  const toggle = (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOnMobile ? "center" : "flex-end",
        px: 2,
        pt: 1,
      }}
    >
      <ToggleButtonGroup
        value={groupBy}
        exclusive
        onChange={handleGroupByChange}
        size="small"
        sx={{
          "& .MuiToggleButton-root": {
            textTransform: "none",
            fontSize: "0.75rem",
            px: 1.5,
            py: 0.25,
          },
        }}
      >
        <ToggleButton value="city">By City</ToggleButton>
        <ToggleButton value="country">By Country</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  return (
    <>
      {isOnMobile ? (
        <Stack
          direction="column"
          justifyContent="space-between"
          marginY={4}
          sx={{backgroundColor: backgroundColor}}
          overflow="hidden"
        >
          {toggle}
          <ClientOnlyMap validatorGeoGroups={activeGroups} groupBy={groupBy} />
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
          <Box sx={{flex: 1, position: "relative"}}>
            {toggle}
            <ClientOnlyMap
              validatorGeoGroups={activeGroups}
              groupBy={groupBy}
            />
          </Box>
        </Stack>
      )}
    </>
  );
}
