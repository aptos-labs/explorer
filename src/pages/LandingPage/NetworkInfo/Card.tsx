import React from "react";
import {Box, BoxProps, useTheme} from "@mui/material";
import {grey} from "../../../themes/colors/aptosColorPalette";

interface CardProps extends BoxProps {
  effectColor?: string;
  children: React.ReactNode;
}

export default function Card({
  effectColor: customizedEffectColor,
  children,
  ...props
}: CardProps) {
  const theme = useTheme();
  const effectColor =
    customizedEffectColor ??
    (theme.palette.mode === "dark" ? grey[800] : grey[100]);

  return (
    <Box
      sx={{
        padding: 2,
        border: 1,
        borderRadius: 1,
        borderColor: effectColor,
        boxShadow: `0px 0px 5px 1px ${effectColor}`,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
