import * as React from "react";
import {Typography, TypographyProps} from "@mui/material";

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
