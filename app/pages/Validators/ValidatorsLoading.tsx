import {Box, CircularProgress, Typography} from "@mui/material";
import {useTranslation} from "../../i18n";

/** Progress indicator while ValidatorSet / validator stats are still loading. */
export function ValidatorsLoading() {
  const {t} = useTranslation();
  return (
    <Box
      role="status"
      aria-label={t("common.loadingValidators")}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 6,
      }}
    >
      <CircularProgress size={32} />
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
        }}
      >
        {t("common.loadingValidatorsEllipsis")}
      </Typography>
    </Box>
  );
}
