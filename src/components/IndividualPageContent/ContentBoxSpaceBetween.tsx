import * as React from "react";
import {Box, BoxProps, Stack, useTheme} from "@mui/material";
import {grey} from "../../themes/colors/aptosColorPalette";

interface ContentBoxSpaceBetweenProps extends BoxProps {
  children: React.ReactNode;
}

export default function ContentBoxSpaceBetween({
  children,
  ...props
}: ContentBoxSpaceBetweenProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === "dark" ? grey[800] : grey[50];

  return (
    <Box
      padding={3}
      sx={{
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
