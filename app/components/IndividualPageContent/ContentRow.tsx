import React, {memo} from "react";
import {Box, Grid, useTheme} from "@mui/material";
import EmptyValue from "./ContentValue/EmptyValue";

type ContentRowProps = {
  title: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  i?: string | number;
};

// Extracted static styles to avoid recreation on every render
const tooltipWrapperStyle = {
  display: "inline",
  whiteSpace: "nowrap",
} as const;

const tooltipInnerStyle = {display: "inline-block"} as const;

const valueGridStyle = {
  fontSize: "0.8rem",
  overflow: "auto",
} as const;

const valueBoxStyle = {
  display: "inline-flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 1,
} as const;

const ContentRow = memo(function ContentRow({
  title,
  value,
  tooltip,
  i,
}: ContentRowProps) {
  const theme = useTheme();
  return (
    <Box>
      <Grid
        container
        rowSpacing={0.5}
        columnSpacing={4}
        alignItems="start"
        key={i}
      >
        <Grid container size={{xs: 12, sm: 3}}>
          <Box sx={{fontSize: "0.875rem", color: theme.palette.text.secondary}}>
            {title}
            <Box component="span" sx={tooltipWrapperStyle}>
              &nbsp;
              <Box sx={tooltipInnerStyle}>{tooltip}</Box>
            </Box>
          </Box>
        </Grid>
        <Grid size={{xs: 12, sm: 9}} sx={valueGridStyle}>
          {value ? <Box sx={valueBoxStyle}>{value}</Box> : <EmptyValue />}
        </Grid>
      </Grid>
    </Box>
  );
});

export default ContentRow;
