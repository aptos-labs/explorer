import {Box, useTheme} from "@mui/material";
import {memo} from "react";
import {useTranslation} from "../../../i18n";

// Memoized since used frequently as placeholder in content rows
const EmptyValue = memo(function EmptyValue() {
  const theme = useTheme();
  const {t} = useTranslation();
  return (
    <Box
      sx={{
        color: theme.palette.text.secondary,
      }}
    >
      {t("common.na")}
    </Box>
  );
});

export default EmptyValue;
