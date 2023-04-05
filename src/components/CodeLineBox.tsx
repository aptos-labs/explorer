import React from "react";
import {Box, SxProps, Theme, useTheme} from "@mui/material";
import {codeBlockColor} from "../themes/colors/aptosColorPalette";

const TEXT_COLOR_LIGHT = "#0EA5E9";
const TEXT_COLOR_DARK = "#83CCED";

export function CodeLineBox({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={[
        {
          width: "max-content",
          color:
            theme.palette.mode === "dark" ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT,
          backgroundColor: codeBlockColor,
          padding: "0.35rem 1rem 0.35rem 1rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular,
          fontSize: 13,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      borderRadius={1}
    >
      {children}
    </Box>
  );
}
