import React from "react";
import {Box, Stack, Typography} from "@mui/material";
import {grey} from "../../themes/colors/aptosColorPalette";
import EmptyValue from "./ContentValue/EmptyValue";

type ContentRowSmallProps = {
  title: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  i?: any;
};

export default function ContentRowSpaceBetween({
  title,
  value,
  tooltip,
}: ContentRowSmallProps) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography sx={{fontSize: "0.875rem", color: grey[450]}}>
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
