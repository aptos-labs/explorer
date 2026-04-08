import {Box, type BoxProps, Stack, useTheme} from "@mui/material";
import type * as React from "react";

interface ContentBoxSpaceBetweenProps extends BoxProps {
  children: React.ReactNode;
}

export default function ContentBoxSpaceBetween({
  children,
  ...props
}: ContentBoxSpaceBetweenProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: backgroundColor,
        borderRadius: `${theme.shape.borderRadius}px`,
      }}
      {...props}
    >
      <Stack direction="column" spacing={2}>
        {children}
      </Stack>
    </Box>
  );
}
