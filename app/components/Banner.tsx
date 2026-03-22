import CloseIcon from "@mui/icons-material/Close";
import {
  alpha,
  Box,
  Collapse,
  IconButton,
  Stack,
  type SxProps,
  type Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type React from "react";
import {useState} from "react";
import {brandColors} from "../themes/colors/aptosBrandColors";

type PillColor =
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning"
  | "inherit";

interface BannerProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
  pillText?: string;
  pillColor?: PillColor;
}

/**
 * Accent color for the left border and pill, keyed by semantic intent.
 * Light mode uses deeper hues from the a11y palette for contrast;
 * dark mode uses the brighter brand fills.
 */
function useAccentColor(color: PillColor) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  const map: Record<PillColor, string> = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    error: dark ? brandColors.coral : theme.palette.error.main,
    info: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: dark ? brandColors.coral : theme.palette.warning.main,
    inherit: theme.palette.text.primary,
  };
  return map[color];
}

export function Banner({
  children,
  action,
  sx,
  pillText,
  pillColor = "primary",
}: BannerProps) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const accent = useAccentColor(pillColor);
  const isSmall = !useMediaQuery(theme.breakpoints.up("sm"));

  const pill = pillText ? (
    <Typography
      component="span"
      sx={{
        backgroundColor: accent,
        color: theme.palette.getContrastText(accent),
        borderRadius: "6px",
        px: 1.25,
        py: 0.25,
        fontSize: "0.6875rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        lineHeight: 1.6,
        whiteSpace: "nowrap",
        flex: "0 0 auto",
      }}
    >
      {pillText}
    </Typography>
  ) : null;

  return (
    <Collapse in={open}>
      <Box sx={[...(Array.isArray(sx) ? sx : [sx])]}>
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmall ? "column" : "row",
            alignItems: isSmall ? "flex-start" : "center",
            gap: isSmall ? 1.5 : 2,
            px: 2.5,
            py: 1.75,
            borderRadius: `${theme.shape.borderRadius}px`,
            borderLeft: `4px solid ${accent}`,
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(accent, 0.08)
                : alpha(accent, 0.06),
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{flex: 1, minWidth: 0, flexWrap: "wrap"}}
          >
            {pill}
            <Typography
              component="div"
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 400,
                lineHeight: 1.6,
                color: theme.palette.text.primary,
              }}
            >
              {children}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              flex: "0 0 auto",
              alignSelf: isSmall ? "flex-end" : "center",
            }}
          >
            {action}
            <IconButton
              aria-label="Dismiss"
              size="small"
              onClick={() => setOpen(false)}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.text.primary, 0.06),
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Collapse>
  );
}
