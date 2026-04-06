import {Box, type BoxProps, Stack, useTheme} from "@mui/material";
import type * as React from "react";

interface ContentBoxProps extends BoxProps {
  children: React.ReactNode;
}

export default function ContentBox({
  children,
  sx: sxProp,
  ...props
}: ContentBoxProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;

  return (
    <Box
      marginTop={3}
      {...props}
      sx={[
        {
          backgroundColor: backgroundColor,
          borderRadius: `${theme.shape.borderRadius}px`,
          px: {xs: 2, sm: 3, md: 4},
          py: {xs: 2, sm: 3, md: 4},
        },
        ...(Array.isArray(sxProp) ? sxProp : sxProp != null ? [sxProp] : []),
      ]}
    >
      <Stack direction="column" spacing={{xs: 2, sm: 3, md: 4}}>
        {children}
      </Stack>
    </Box>
  );
}
