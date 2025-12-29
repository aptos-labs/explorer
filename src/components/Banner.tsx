import {
  Collapse,
  Alert,
  Stack,
  Typography,
  IconButton,
  Box,
  SxProps,
  Theme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import AptosBannerImage from "../assets/Banner.jpg";
import {brandColors} from "../themes/colors/aptosBrandColors";

type PillColors =
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning"
  | "inherit";
const PillColors: Record<PillColors, string> = {
  error: brandColors.coral,
  info: brandColors.babyBlue,
  primary: brandColors.babyBlue,
  secondary: brandColors.mint,
  success: brandColors.mint,
  warning: brandColors.coral,
  inherit: "inherit",
};

interface BannerProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
  pillText?: string;
  pillColor?: PillColors;
}

export function Banner({
  children,
  action,
  sx,
  pillText,
  pillColor = "primary",
}: BannerProps) {
  const [bannerOpen, setBannerOpen] = useState<boolean>(true);
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const closeIcon = (
    <IconButton
      sx={{
        color: brandColors.white,
        position: "relative",
        top: 0,
        right: 0,
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
      }}
      size="medium"
      onClick={() => {
        setBannerOpen(false);
      }}
    >
      <CloseIcon fontSize="inherit" />
    </IconButton>
  );

  // Determine text color based on background color brightness
  const getPillTextColor = (bgColor: string) => {
    // For light backgrounds (Baby Blue, Mint), use dark text
    // For dark backgrounds (Coral), use white text
    if (bgColor === brandColors.babyBlue || bgColor === brandColors.mint) {
      return theme.palette.mode === "dark"
        ? brandColors.black
        : brandColors.black;
    }
    // For coral/error/warning, use white text
    return brandColors.white;
  };

  const pill = Boolean(pillText) && (
    <Typography
      sx={{
        backgroundColor: PillColors[pillColor],
        color: getPillTextColor(PillColors[pillColor]),
        borderRadius: "4px",
        paddingX: 1.5,
        paddingY: 0.25,
        minWidth: "fit-content",
        height: "fit-content",
        flex: "0 0 auto",
        textAlign: "center",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {pillText}
    </Typography>
  );

  const text = (
    <Typography
      color={brandColors.white}
      sx={{
        fontFamily: theme.typography.fontFamily,
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
      }}
    >
      {children}
    </Typography>
  );

  return (
    <Collapse in={bannerOpen}>
      <Box sx={[...(Array.isArray(sx) ? sx : [sx])]}>
        {isOnMobile ? (
          <Alert
            sx={{
              backgroundImage: `url(${AptosBannerImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: theme.shape.borderRadius,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? brandColors.ink
                  : brandColors.black,
              padding: 2,
              "& .MuiAlert-message": {
                width: "100%",
                padding: 0,
              },
            }}
            icon={false}
            action={
              <Stack
                direction="column"
                spacing={1}
                marginRight={1}
                sx={{verticalAlign: "center"}}
              >
                {action}
                {closeIcon}
              </Stack>
            }
          >
            <Stack
              direction="column"
              spacing={1.5}
              sx={{
                alignItems: "flex-start",
              }}
            >
              {pill}
              {text}
            </Stack>
          </Alert>
        ) : (
          <Alert
            sx={{
              backgroundImage: `url(${AptosBannerImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: theme.shape.borderRadius,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? brandColors.ink
                  : brandColors.black,
              padding: 2,
              "& .MuiAlert-message": {
                width: "100%",
                padding: 0,
              },
            }}
            icon={false}
            action={
              <Stack
                direction="row"
                spacing={1}
                marginRight={2}
                sx={{verticalAlign: "center", alignItems: "center"}}
              >
                {action}
                {closeIcon}
              </Stack>
            }
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {pill}
              {text}
            </Stack>
          </Alert>
        )}
      </Box>
    </Collapse>
  );
}
