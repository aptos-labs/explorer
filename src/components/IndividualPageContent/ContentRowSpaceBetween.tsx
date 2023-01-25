import React from "react";
import {Box, Stack} from "@mui/material";
import {grey} from "../../themes/colors/aptosColorPalette";
import EmptyValue from "./ContentValue/EmptyValue";

type ContentRowSmallProps = {
  title: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  i?: any;
};

export default function ContentRowSpaceBetween({
  title,
  value,
  tooltip,
  i,
}: ContentRowSmallProps) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Box sx={{fontSize: "0.875rem", color: grey[450]}}>
        {title}
        <Box
          component="span"
          sx={{
            display: "inline",
            whiteSpace: "nowrap",
          }}
        >
          &nbsp;
          <Box sx={{display: "inline-block"}}>{tooltip}</Box>
        </Box>
      </Box>
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
