/**
 * Client-only Map component that uses react-simple-maps.
 * This file should ONLY be imported via dynamic import() on the client.
 *
 * The .client.tsx naming convention signals this is client-only code.
 * Do not import this file directly - use dynamic import from ValidatorsMap.tsx
 */

import {alpha, Box, Stack, styled, Typography, useTheme} from "@mui/material";
import Tooltip, {
  type TooltipProps,
  tooltipClasses,
} from "@mui/material/Tooltip";
import {ComposableMap, Geographies, Geography, Marker} from "react-simple-maps";
import type {
  CityBreakdown,
  ValidatorGeoGroup,
} from "../../../api/hooks/useGetValidatorsGeoData";
import {brandColors} from "../../../themes/colors/aptosBrandColors";

export type MapGroupBy = "city" | "country";

const MARKER_COLOR = brandColors.babyBlue;
const MIN_NODE_COUNT_SHOWN_IN_MARKER = 5;

function getCircleRadius(currentGroupSize: number) {
  return currentGroupSize ** (1 / 4) * 4;
}

const LightTooltip = styled(({className, ...props}: TooltipProps) => (
  <Tooltip {...props} classes={{popper: className}} />
))(({theme}) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: `1px 1px 3px 3px ${alpha(theme.palette.common.black, 0.05)}`,
    borderRadius: 4,
  },
}));

function MapMarker({
  group,
  groupBy,
}: {
  group: ValidatorGeoGroup;
  groupBy: MapGroupBy;
}) {
  const theme = useTheme();
  const {city, country, lng, lat, nodes, cities} = group;
  const radius = getCircleRadius(nodes.length);

  const isCountryMode = groupBy === "country";

  return (
    <LightTooltip
      title={
        <Box margin={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={4}
            marginBottom={isCountryMode && cities?.length ? 1 : 0.5}
          >
            <Typography variant="body2">
              {isCountryMode ? country : `${city}, ${country}`}
            </Typography>
            <Typography variant="body2">{nodes.length}</Typography>
          </Stack>
          {isCountryMode &&
            cities?.map((c: CityBreakdown) => (
              <Stack
                key={c.name}
                direction="row"
                justifyContent="space-between"
                spacing={4}
                sx={{fontSize: 11}}
                marginBottom={0.5}
              >
                <Box>{c.name}</Box>
                <Box>{c.count}</Box>
              </Stack>
            ))}
        </Box>
      }
    >
      <Marker coordinates={[lng, lat]}>
        <g>
          <circle
            fill="transparent"
            stroke={MARKER_COLOR}
            strokeWidth={0.6}
            strokeOpacity={0.4}
            r={radius + 2}
          />
          <circle
            fill="transparent"
            stroke={MARKER_COLOR}
            strokeWidth={0.6}
            strokeOpacity={0.8}
            r={radius + 0.9}
          />
          <circle fill={MARKER_COLOR} r={radius} />
          {nodes.length >= MIN_NODE_COUNT_SHOWN_IN_MARKER && (
            <text
              textAnchor="middle"
              fill={theme.palette.text.primary}
              transform={`translate(0, 3.3)`}
              fontSize={9}
            >
              {nodes.length}
            </text>
          )}
        </g>
      </Marker>
    </LightTooltip>
  );
}

type MapProps = {
  validatorGeoGroups: ValidatorGeoGroup[];
  groupBy: MapGroupBy;
};

export default function Map({validatorGeoGroups, groupBy}: MapProps) {
  const theme = useTheme();

  return (
    <Box width="100%" height="100%">
      <ComposableMap
        projectionConfig={{
          rotate: [0, 10, 0],
          center: [0, 30],
          scale: 130,
        }}
        projection="geoMercator"
        height={450}
      >
        <Geographies geography={"/world.json"}>
          {({geographies}) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={
                  theme.palette.mode === "dark"
                    ? theme.palette.neutralShade.lighter
                    : brandColors.sand
                }
                style={{
                  default: {
                    outline: "0",
                  },
                  hover: {
                    outline: "0",
                  },
                  pressed: {
                    outline: "0",
                  },
                }}
              />
            ))
          }
        </Geographies>
        {validatorGeoGroups.map((group) => (
          <MapMarker
            key={
              groupBy === "city"
                ? `${group.city}-${group.country}`
                : group.country
            }
            group={group}
            groupBy={groupBy}
          />
        ))}
      </ComposableMap>
    </Box>
  );
}
