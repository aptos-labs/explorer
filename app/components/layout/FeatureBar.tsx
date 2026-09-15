import {Box, Stack, Typography, useTheme} from "@mui/material";
import {defaultFeatureName, type FeatureName, features} from "../../constants";
import {useFeatureName} from "../../global-config";
import {useTranslation} from "../../i18n";

/**
 * This is the information bar on top of the screen when the current feature is not "prod".
 * This bar is used to indicate that it is now in development mode.
 */
export default function FeatureBar() {
  const theme = useTheme();
  const {t} = useTranslation();
  const featureName = useFeatureName();

  if (featureName === defaultFeatureName) {
    return null;
  }

  const featureLabel =
    featureName === "prod"
      ? t("feature.prod")
      : featureName === "dev"
        ? t("feature.dev")
        : featureName === "earlydev"
          ? t("feature.earlydev")
          : features[featureName as FeatureName] || featureName;

  return (
    <Box
      sx={{
        padding: 1,
        backgroundColor: theme.palette.error.main,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>{t("feature.banner", {name: featureLabel})}</Typography>
      </Stack>
    </Box>
  );
}
