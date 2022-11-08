import React from "react";
import {Box, useTheme, styled, Typography, Stack} from "@mui/material";
import Tooltip, {TooltipProps, tooltipClasses} from "@mui/material/Tooltip";
import {ComposableMap, Geographies, Geography, Marker} from "react-simple-maps";
import {
  City,
  useGetValidatorSetGeoData,
  ValidatorGeoGroup,
} from "../../../api/hooks/useGetValidatorSetGeoData";
import {grey} from "../../../themes/colors/aptosColorPalette";

const WIDTH = 800;
const HEIGHT = 450;
const GEO_URL =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-continents.json";
const CIRCLE_COLOR = "#22D3EE";

function getCircleRadius(currentGroupSize: number) {
  return Math.pow(currentGroupSize, 1 / 4) * 4;
}

const LightTooltip = styled(({className, ...props}: TooltipProps) => (
  <Tooltip {...props} classes={{popper: className}} />
))(({theme}) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.mode === "dark" ? grey[800] : grey[50],
    color: theme.palette.mode === "dark" ? grey[50] : grey[800],
    boxShadow: "1px 1px 3px 3px rgba(0, 0, 0, 0.05)",
    borderRadius: 4,
  },
}));

function MapMarker({group}: {group: ValidatorGeoGroup}) {
  const {country, countryLng, countryLat, nodes, cities} = group;
  const radius = getCircleRadius(nodes.length);

  return (
    <LightTooltip
      title={
        <Box margin={1}>
          <Typography
            variant="body2"
            marginBottom={1}
          >{`${country} (${nodes.length})`}</Typography>
          {cities.map((city: City) => (
            <Stack
              key={city.name}
              direction="row"
              justifyContent="space-between"
              spacing={4}
              sx={{fontSize: 11}}
              marginBottom={0.5}
            >
              <Box>{city.name}</Box>
              <Box>{city.count}</Box>
            </Stack>
          ))}
        </Box>
      }
    >
      <Marker coordinates={[countryLng, countryLat]}>
        <g>
          <circle
            fill="rgba(0,0,0,0)"
            stroke={CIRCLE_COLOR}
            strokeWidth={0.6}
            strokeOpacity={0.4}
            r={radius + 2}
          />
          <circle
            fill="rgba(0,0,0,0)"
            stroke={CIRCLE_COLOR}
            strokeWidth={0.6}
            strokeOpacity={0.8}
            r={radius + 0.9}
          />
          <circle fill={CIRCLE_COLOR} r={radius} />
          {nodes.length > 4 && (
            <text
              textAnchor="middle"
              fill={grey[900]}
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

export default function Map() {
  const theme = useTheme();
  const {validatorGeoGroups} = useGetValidatorSetGeoData();

  return (
    <Box width={WIDTH} height={HEIGHT} style={{overflow: "hidden"}}>
      <ComposableMap
        projectionConfig={{
          rotate: [0, 15, 0],
          center: [0, -5],
          scale: 130,
        }}
        projection="geoMercator"
      >
        <Geographies geography={GEO_URL}>
          {({geographies}) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={theme.palette.mode === "dark" ? grey[600] : grey[200]}
              />
            ))
          }
        </Geographies>
        {validatorGeoGroups.map((group, idx) => (
          <MapMarker key={`${group.country}-${idx}`} group={group} />
        ))}
      </ComposableMap>
    </Box>
  );
}
