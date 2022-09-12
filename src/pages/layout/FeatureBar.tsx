import React, {useEffect} from "react";
import {Box, Link, Stack, Typography} from "@mui/material";
import {useSearchParams} from "react-router-dom";
import {useGlobalState} from "../../GlobalState";
import {features, FeatureName, defaultFeatureName} from "../../constants";

const ALERT_COLOR: string = "#F97373"; // red

/**
 * This is the information bar on top of the screen when the current feature is not "prod".
 * This bar is used to indicate that it is now in development mode.
 */
export default function FeatureBar() {
  const [state, dispatch] = useGlobalState();
  const [searchParams, setSearchParams] = useSearchParams();

  function maybeSetFeature(featureNameString: string | null) {
    if (!featureNameString || state.feature_name === featureNameString) {
      return;
    }
    if (!(featureNameString in features)) {
      return;
    }
    const feature_name = featureNameString as FeatureName;
    const network_name = state.network_name;
    const network_value = state.network_value;
    if (feature_name) {
      // only show the "feature" param in the url when it's not "prod"
      // we don't want the users to know the existence of the "feature" param
      if (feature_name !== defaultFeatureName) {
        setSearchParams({network: network_name, feature: feature_name});
      } else {
        setSearchParams({network: network_name});
      }
      dispatch({network_name, network_value, feature_name});
    }
  }

  const goToProd = () => {
    maybeSetFeature(defaultFeatureName);
  };

  useEffect(() => {
    const feature_name = searchParams.get("feature");
    if (feature_name) {
      maybeSetFeature(feature_name);
    } else {
      // the "feature" param being null means that it's in "prod"
      // so set feature to "prod"
      maybeSetFeature(defaultFeatureName);
    }
  });

  if (state.feature_name === defaultFeatureName) {
    return null;
  }

  return (
    <Box sx={{backgroundColor: ALERT_COLOR}} padding={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography>{`This is the ${
          features[state.feature_name]
        }.`}</Typography>
        <Link
          component="button"
          variant="body2"
          color="inherit"
          onClick={goToProd}
        >
          Go To Prod
        </Link>
      </Stack>
    </Box>
  );
}
