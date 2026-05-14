import {Box, type BoxProps, Stack, useTheme} from "@mui/material";
import type * as React from "react";

interface ContentBoxProps extends BoxProps {
  children: React.ReactNode;
}

export default function ContentBox({children, ...props}: ContentBoxProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;

  return (
    <Box
      {...props}
      sx={[
        {
          padding: 4,
          marginTop: 3,
          backgroundColor: backgroundColor,
          borderRadius: `${theme.shape.borderRadius}px`,
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      <Stack direction="column" spacing={4}>
        {children}
      </Stack>
    </Box>
  );
}
