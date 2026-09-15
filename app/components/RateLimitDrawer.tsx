import CloseIcon from "@mui/icons-material/Close";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {useRateLimit} from "../context/rate-limit";
import {InlineMarkup, useTranslation} from "../i18n";
import {Link} from "../routing";

export default function RateLimitDrawer() {
  const {isRateLimited, dismissRateLimit} = useRateLimit();
  const theme = useTheme();
  const {t} = useTranslation();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Drawer
      anchor="bottom"
      open={isRateLimited}
      onClose={dismissRateLimit}
      variant="persistent"
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            px: {xs: 2, sm: 3},
            py: 2,
            maxWidth: 720,
            mx: "auto",
            boxShadow: theme.shadows[8],
          },
          role: "alert",
        },
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
            }}
          >
            <TimerOutlinedIcon color="warning" />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
              }}
            >
              {t("rateLimit.title")}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={dismissRateLimit}
            aria-label={t("rateLimit.dismissAria")}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          <InlineMarkup text={t("rateLimit.body")} />
        </Typography>

        <Stack
          direction={isSmall ? "column" : "row"}
          spacing={1.5}
          sx={{
            alignItems: isSmall ? "stretch" : "center",
          }}
        >
          <Button
            component={Link}
            to="/settings"
            variant="contained"
            size="small"
            startIcon={<SettingsOutlinedIcon />}
            onClick={dismissRateLimit}
          >
            {t("rateLimit.setOverride")}
          </Button>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {t("rateLimit.orWait")}
            </Typography>
          </Box>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          <InlineMarkup text={t("rateLimit.getKey")} />
        </Typography>
      </Stack>
    </Drawer>
  );
}
