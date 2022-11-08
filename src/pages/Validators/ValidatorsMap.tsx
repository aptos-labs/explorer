import React from "react";
import {Stack, Box, Typography, useTheme} from "@mui/material";
import Map from "./Components/Map";
import {grey} from "../../themes/colors/aptosColorPalette";

export default function ValidatorsMap() {
  const theme = useTheme();

  return (
    <Stack
      direction={{xs: "column", md: "row"}}
      justifyContent="space-between"
      marginY={4}
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? grey[800] : grey[50],
      }}
    >
      <Box>
        <Typography variant="body2">Title</Typography>
      </Box>
      <Map />
    </Stack>
  );
}
