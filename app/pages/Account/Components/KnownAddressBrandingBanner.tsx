import {Box, Paper, Stack, Typography, useTheme} from "@mui/material";
import {useKnownAddressBranding} from "../../../data/hooks";

type KnownAddressBrandingBannerProps = {
  address: string;
};

/**
 * Shows configured logo and optional description for addresses in the known-address branding map.
 */
export function KnownAddressBrandingBanner({
  address,
}: KnownAddressBrandingBannerProps) {
  const theme = useTheme();
  const branding = useKnownAddressBranding(address);

  if (!branding) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.neutralShade.lighter
            : theme.palette.background.paper,
      }}
    >
      <Stack
        direction={{xs: "column", sm: "row"}}
        spacing={2}
        alignItems={{sm: "flex-start"}}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            flexShrink: 0,
            borderRadius: 2,
            overflow: "hidden",
            bgcolor:
              theme.palette.mode === "dark"
                ? theme.palette.action.hover
                : theme.palette.neutralShade.darker,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
            position: "relative",
          }}
        >
          <img
            src={branding.icon}
            alt=""
            width={72}
            height={72}
            style={{objectFit: "contain", display: "block"}}
            loading="lazy"
          />
          {branding.iconBadge ? (
            <Typography
              component="span"
              variant="caption"
              sx={{
                position: "absolute",
                top: 6,
                left: 0,
                right: 0,
                textAlign: "center",
                fontWeight: 700,
                lineHeight: 1,
                color: "#fff",
                textShadow:
                  "0 0 2px #000, 0 1px 2px rgba(0,0,0,0.95), 0 -1px 1px rgba(0,0,0,0.5)",
                pointerEvents: "none",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.7rem",
              }}
            >
              {branding.iconBadge}
            </Typography>
          ) : null}
        </Box>
        {branding.description ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{pt: {sm: 0.5}, flex: 1, minWidth: 0}}
          >
            {branding.description}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
