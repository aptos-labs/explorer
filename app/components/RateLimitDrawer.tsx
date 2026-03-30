import CloseIcon from "@mui/icons-material/Close";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {useRateLimit} from "../context/rate-limit";
import {Link} from "../routing";

const GEOMI_DEV_URL = "https://geomi.dev";

export default function RateLimitDrawer() {
  const {isRateLimited, dismissRateLimit} = useRateLimit();
  const theme = useTheme();
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
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <TimerOutlinedIcon color="warning" />
            <Typography variant="subtitle1" fontWeight={600}>
              Rate limited
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={dismissRateLimit}
            aria-label="Dismiss rate limit notice"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          The API returned a rate-limit response (HTTP 429). Data on this page
          may be incomplete or stale until the limit resets.
        </Typography>

        <Stack
          direction={isSmall ? "column" : "row"}
          spacing={1.5}
          alignItems={isSmall ? "stretch" : "center"}
        >
          <Button
            component={Link}
            to="/settings"
            variant="contained"
            size="small"
            startIcon={<SettingsOutlinedIcon />}
            onClick={dismissRateLimit}
          >
            Set API key override
          </Button>
          <Box>
            <Typography variant="body2" color="text.secondary">
              or wait ~5 minutes for the rate limit to reset.
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Don&apos;t have a key?{" "}
          <MuiLink
            href={GEOMI_DEV_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get one at geomi.dev
          </MuiLink>
        </Typography>
      </Stack>
    </Drawer>
  );
}
