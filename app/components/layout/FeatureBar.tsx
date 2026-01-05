import {Box, Stack, Typography, useTheme} from "@mui/material";
import React from "react";
import {defaultFeatureName, features, FeatureName} from "../../constants";
import {useFeatureName} from "../../global-config";

/**
 * This is the information bar on top of the screen when the current feature is not "prod".
 * This bar is used to indicate that it is now in development mode.
 */
export default function FeatureBar() {
  const theme = useTheme();
  const featureName = useFeatureName();

  if (featureName === defaultFeatureName) {
    return null;
  }

  const featureLabel = features[featureName as FeatureName] || featureName;

  return (
    <Box sx={{backgroundColor: theme.palette.error.main}} padding={1}>
      <Stack direction="row" alignItems="center" justifyContent="center">
        <Typography>{`This is the ${featureLabel}.`}</Typography>
      </Stack>
    </Box>
  );
}
