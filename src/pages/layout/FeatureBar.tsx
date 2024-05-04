import {Box, Link, Stack, Typography} from "@mui/material";
import React from "react";
import {defaultFeatureName, features} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";

const ALERT_COLOR: string = "#F97373"; // red

/**
 * This is the information bar on top of the screen when the current feature is not "prod".
 * This bar is used to indicate that it is now in development mode.
 */
export default function FeatureBar() {
  const [globalState, {selectFeature}] = useGlobalState();

  if (globalState.feature_name === defaultFeatureName) {
    return null;
  }

  return (
    <Box sx={{backgroundColor: ALERT_COLOR}} padding={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography>{`This is the ${
          features[globalState.feature_name]
        }.`}</Typography>
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
