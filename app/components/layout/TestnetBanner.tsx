import CloseIcon from "@mui/icons-material/Close";
import {Box, IconButton, Stack, Typography, useTheme} from "@mui/material";
import {useState} from "react";
import {useNetworkName} from "../../global-config";
import {useTranslation} from "../../i18n";

/**
 * Temporary notice shown on every page while testnet is being reset.
 * Remove this banner (and the `network.testnetResetBanner` message) once
 * testnet is back up (expected 10/9).
 */
export default function TestnetBanner() {
  const theme = useTheme();
  const {t} = useTranslation();
  const networkName = useNetworkName();
  const [dismissed, setDismissed] = useState(false);

  if (networkName !== "testnet" || dismissed) {
    return null;
  }

  const backgroundColor = theme.palette.warning.main;
  const color = theme.palette.getContrastText(backgroundColor);

  return (
    <Box
      sx={{
        padding: 1,
        paddingRight: 2,
        backgroundColor,
        color,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
        }}
      >
        <Typography sx={{fontWeight: 600, textAlign: "center"}}>
          {t("network.testnetResetBanner")}
        </Typography>
        <IconButton
          aria-label={t("common.dismiss")}
          size="small"
          onClick={() => setDismissed(true)}
          sx={{color: "inherit"}}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
