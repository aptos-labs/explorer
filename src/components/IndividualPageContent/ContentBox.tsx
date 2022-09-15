import * as React from "react";
import {Box, BoxProps, Stack, useTheme} from "@mui/material";
import {grey} from "../../themes/colors/aptosColorPalette";

interface ContentBoxProps extends BoxProps {
  children: React.ReactNode;
}

export default function ContentBox({
  children,
  ...props
}: ContentBoxProps): JSX.Element {
  const theme = useTheme();
  // TODO: unify colors for the new transaction page
  const backgroundColor = theme.palette.mode === "dark" ? grey[800] : grey[50];

  return (
    <Box
      paddingLeft={4}
      paddingRight={4}
      paddingY={4}
      marginTop={3}
      sx={{
        backgroundColor: backgroundColor,
        borderRadius: "15px",
      }}
      {...props}
    >
      <Stack direction="column" spacing={3}>
        {children}
      </Stack>
    </Box>
  );
}
