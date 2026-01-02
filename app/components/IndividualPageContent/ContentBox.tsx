import * as React from "react";
import {Box, BoxProps, Stack, useTheme} from "@mui/material";

interface ContentBoxProps extends BoxProps {
  children: React.ReactNode;
}

export default function ContentBox({children, ...props}: ContentBoxProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;

  return (
    <Box
      padding={4}
      marginTop={3}
      sx={{
        backgroundColor: backgroundColor,
        borderRadius: `${theme.shape.borderRadius}px`,
      }}
      {...props}
    >
      <Stack direction="column" spacing={4}>
        {children}
      </Stack>
    </Box>
  );
}
