import {alpha, Box, type BoxProps, useTheme} from "@mui/material";
import type React from "react";
import {useContext} from "react";
import {StyleContext} from "../pages/Analytics/NetworkInfo/NetworkInfo";

interface CardProps extends BoxProps {
  children: React.ReactNode;
}

export function CardWithStyle({children, ...props}: CardProps) {
  const style = useContext(StyleContext);

  return style === "default" ? (
    <Card {...props}>{children}</Card>
  ) : (
    <CardOutline {...props}>{children}</CardOutline>
  );
}

export function Card({children, sx, ...props}: CardProps) {
  const theme = useTheme();

  return (
    <Box
      {...props}
      sx={[
        {
          background: theme.palette.background.paper,
          padding: 2.5,
          borderRadius: 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

export function CardOutline({children, sx, ...props}: CardProps) {
  const theme = useTheme();

  return (
    <Box
      {...props}
      sx={[
        {
          padding: 2.5,
          borderRadius: 1,
          boxShadow: `0px 0px 5px 2px ${alpha(
            theme.palette.mode === "dark"
              ? theme.palette.common.white
              : theme.palette.common.black,
            theme.palette.mode === "dark" ? 0.15 : 0.05,
          )}`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
