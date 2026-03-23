import {Box, Grid, useTheme} from "@mui/material";
import type React from "react";
import {memo} from "react";
import EmptyValue from "./ContentValue/EmptyValue";

type ContentRowProps = {
  title: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  i?: string | number;
  /**
   * `fit`: on sm+ screens the title column sizes to its content so the value
   * column gets the rest (better for wide tables like transaction arguments).
   * Default keeps the historical 3/12 · 9/12 split.
   */
  titleLayout?: "grid" | "fit";
};

// Extracted static styles to avoid recreation on every render
const tooltipWrapperStyle = {
  display: "inline",
  whiteSpace: "nowrap",
} as const;

const tooltipInnerStyle = {display: "inline-block"} as const;

const valueGridStyle = {
  fontSize: "0.8rem",
  overflow: "hidden",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
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
  titleLayout = "grid",
}: ContentRowProps) {
  const theme = useTheme();
  const titleSize =
    titleLayout === "fit"
      ? ({xs: 12, sm: "auto"} as const)
      : ({xs: 12, sm: 3} as const);
  const valueSize =
    titleLayout === "fit"
      ? ({xs: 12, sm: "grow"} as const)
      : ({xs: 12, sm: 9} as const);
  return (
    <Box>
      <Grid
        container
        rowSpacing={0.5}
        columnSpacing={4}
        alignItems="start"
        key={i}
      >
        <Grid
          container
          size={titleSize}
          sx={titleLayout === "fit" ? {flexShrink: 0} : undefined}
        >
          <Box sx={{fontSize: "0.875rem", color: theme.palette.text.secondary}}>
            {title}
            <Box component="span" sx={tooltipWrapperStyle}>
              &nbsp;
              <Box sx={tooltipInnerStyle}>{tooltip}</Box>
            </Box>
          </Box>
        </Grid>
        <Grid size={valueSize} sx={valueGridStyle}>
          {value ? <Box sx={valueBoxStyle}>{value}</Box> : <EmptyValue />}
        </Grid>
      </Grid>
    </Box>
  );
});

export default ContentRow;
