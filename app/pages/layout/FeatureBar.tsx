import {Box, Link, Stack, Typography, useTheme} from "@mui/material";
import React from "react";
import {defaultFeatureName, features} from "../../constants";
import {
  useFeatureName,
  useGlobalActions,
} from "../../global-config/GlobalConfig";

/**
 * This is the information bar on top of the screen when the current feature is not "prod".
 * This bar is used to indicate that it is now in development mode.
 */
export default function FeatureBar() {
  const theme = useTheme();
  const featureName = useFeatureName();
  const {selectFeature} = useGlobalActions();

  if (featureName === defaultFeatureName) {
    return null;
  }

  return (
    <Box sx={{backgroundColor: theme.palette.error.main}} padding={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography>{`This is the ${features[featureName]}.`}</Typography>
        <Link
          component="button"
          variant="body2"
          color="inherit"
          onClick={() => selectFeature(defaultFeatureName)}
        >
          {`Go To ${defaultFeatureName} Mode`}
        </Link>
      </Stack>
    </Box>
  );
}
