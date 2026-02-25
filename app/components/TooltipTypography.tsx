import {Typography, type TypographyProps} from "@mui/material";
import type * as React from "react";

interface TooltipTypography extends TypographyProps {
  children?: React.ReactNode;
}

export default function TooltipTypography({
  children,
  ...props
}: TooltipTypography) {
  return (
    <Typography sx={{fontFamily: "sans-serif"}} {...props}>
      {children}
    </Typography>
  );
}
