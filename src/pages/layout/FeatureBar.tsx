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
    if (state.feature_name === featureNameString) return;

    if (featureNameString && !(featureNameString in features)) return;

    if (!featureNameString && state.feature_name) return;

    const feature_name = featureNameString
      ? (featureNameString as FeatureName)
      : defaultFeatureName;
    const network_name = state.network_name;
    const network_value = state.network_value;

    if (feature_name === defaultFeatureName) {
      searchParams.delete("feature");
    } else {
      searchParams.set("feature", feature_name);
    }

    setSearchParams(searchParams);
    dispatch({network_name, network_value, feature_name});
  }

  const goToDefaultMode = () => {
    maybeSetFeature(defaultFeatureName);
  };

  useEffect(() => {
    const feature_name = searchParams.get("feature");
    maybeSetFeature(feature_name);
  }, [searchParams]);

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
          onClick={goToDefaultMode}
        >
          {`Go To ${defaultFeatureName} Mode`}
        </Link>
      </Stack>
    </Box>
  );
}
