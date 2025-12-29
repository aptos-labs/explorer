import React from "react";
import {Box, SxProps, Theme, useTheme} from "@mui/material";
import {
  codeBlockColor,
  codeBlockColorClickableOnHover,
} from "../themes/colors/aptosColorPalette";

export function CodeLineBox({
  children,
  sx,
  clickable = false,
}: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  clickable?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={[
        {
          width: "max-content",
          color: theme.palette.primary.main,
          padding: "0.35rem 1rem 0.35rem 1rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightRegular,
          fontSize: 13,
          ...(clickable
            ? {
                backgroundColor: codeBlockColor,
                "&:hover": {
                  backgroundColor: codeBlockColorClickableOnHover,
                },
              }
            : {
                borderStyle: "solid",
              }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      borderColor={codeBlockColor}
      borderRadius={50}
    >
      {children}
    </Box>
  );
}
