import React from "react";
import {Box, useTheme} from "@mui/material";

export default function EmptyValue() {
  const theme = useTheme();
  return <Box color={theme.palette.text.secondary}>N/A</Box>;
}
