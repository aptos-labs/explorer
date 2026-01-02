import React from "react";
import {Box, Stack, Typography, useTheme} from "@mui/material";
import EmptyValue from "./ContentValue/EmptyValue";

type ContentRowSmallProps = {
  title: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  i?: string | number;
};

export default function ContentRowSpaceBetween({
  title,
  value,
  tooltip,
}: ContentRowSmallProps) {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography
          sx={{fontSize: "0.875rem", color: theme.palette.text.secondary}}
        >
          {title}
        </Typography>
        {tooltip}
      </Stack>
      <Box
        sx={{
          fontSize: "0.8rem",
          overflow: "auto",
        }}
      >
        {value ? <Box>{value}</Box> : <EmptyValue />}
      </Box>
    </Stack>
  );
}
