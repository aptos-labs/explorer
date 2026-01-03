import React from "react";
import {Box, SxProps, Theme, useTheme} from "@mui/material";
import {getSemanticColors} from "../themes/colors/aptosBrandColors";

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
  const semanticColors = getSemanticColors(theme.palette.mode);
  const codeBlockBg = semanticColors.codeBlock.background;
  const codeBlockBgHover = semanticColors.codeBlock.backgroundHover;

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
                backgroundColor: codeBlockBg,
                "&:hover": {
                  backgroundColor: codeBlockBgHover,
                },
              }
            : {
                borderStyle: "solid",
              }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      borderColor={codeBlockBg}
      borderRadius={50}
    >
      {children}
    </Box>
  );
}
