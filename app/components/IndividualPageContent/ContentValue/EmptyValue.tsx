import {Box, useTheme} from "@mui/material";
import {memo} from "react";

// Memoized since used frequently as placeholder in content rows
const EmptyValue = memo(function EmptyValue() {
  const theme = useTheme();
  return <Box color={theme.palette.text.secondary}>N/A</Box>;
});

export default EmptyValue;
