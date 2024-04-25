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

interface BannerProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function Banner({children, action, sx}: BannerProps) {
  const [bannerOpen, setBannerOpen] = useState<boolean>(true);
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const closeIcon = (
    <IconButton
      sx={{
        color: "#ffffff",
        position: "relative",
        top: 0,
        right: 0,
      }}
      size="medium"
      onClick={() => {
        setBannerOpen(false);
      }}
    >
      <CloseIcon fontSize="inherit" />
    </IconButton>
  );

  const icon = (
    <Typography
      sx={{
        backgroundColor: "#8B5CF6",
        color: "#ffffff",
        borderRadius: 0,
        paddingX: 1,
        width: "3rem",
        minWidth: "3rem",
        height: "1.5rem",
      }}
    >
      NEW
    </Typography>
  );

  const text = (
    <Typography
      color="#ffffff"
      sx={{
        fontFamily: "space-grotesk-variable,Geneva,Tahoma,Verdana,sans-serif",
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
            sx={{backgroundImage: `url(${AptosBannerImage})`, borderRadius: 0}}
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
              spacing={1}
              marginLeft={2}
              sx={{
                paddingTop: 0.5,
              }}
            >
              {icon}
              {text}
            </Stack>
          </Alert>
        ) : (
          <Alert
            sx={{backgroundImage: `url(${AptosBannerImage})`, borderRadius: 0}}
            icon={false}
            action={
              <Stack
                direction="row"
                spacing={1}
                marginRight={2}
                sx={{verticalAlign: "center"}}
              >
                {action}
                {closeIcon}
              </Stack>
            }
          >
            <Stack
              direction="row"
              spacing={1}
              marginLeft={2}
              sx={{
                paddingTop: 0.5,
                verticalAlign: "center",
              }}
            >
              {icon}
              {text}
            </Stack>
          </Alert>
        )}
      </Box>
    </Collapse>
  );
}
