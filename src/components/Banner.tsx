import {
  Collapse,
  Alert,
  Stack,
  Typography,
  Divider,
  IconButton,
  Button,
  Box,
  SxProps,
  Theme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {grey} from "../themes/colors/aptosColorPalette";
import AptosBannerImage from "../assets/Banner.jpg";

interface BannerProps {
  children: React.ReactNode;
  handleClick: () => void;
  sx?: SxProps<Theme>;
}

export function Banner({children, handleClick, sx}: BannerProps) {
  const [bannerOpen, setBannerOpen] = useState<boolean>(true);
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const learnMoreButton = (
    <Button variant="text" onClick={handleClick} sx={{alignSelf: "flex-start"}}>
      <Typography>LEARN MORE</Typography>
      <ArrowForwardIosIcon sx={{marginLeft: 2}} fontSize="small" />
    </Button>
  );

  const divider = (
    <Divider
      orientation="vertical"
      variant="middle"
      flexItem
      sx={{color: grey[200]}}
    />
  );

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
        borderRadius: 1,
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
        fontFamily: "apparat-semicond,Geneva,Tahoma,Verdana,sans-serif",
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
            sx={{backgroundImage: `url(${AptosBannerImage})`, borderRadius: 1}}
            icon={false}
            action={
              <Stack
                direction="column"
                spacing={1}
                marginRight={2}
                sx={{verticalAlign: "center"}}
              >
                {closeIcon}
              </Stack>
            }
          >
            <Stack
              direction="column"
              spacing={1}
              marginLeft={5}
              sx={{
                paddingTop: 0.5,
              }}
            >
              {icon}
              {text}
              {learnMoreButton}
            </Stack>
          </Alert>
        ) : (
          <Alert
            sx={{backgroundImage: `url(${AptosBannerImage})`, borderRadius: 1}}
            icon={false}
            action={
              <Stack
                direction="row"
                spacing={1}
                marginRight={2}
                sx={{verticalAlign: "center"}}
              >
                {learnMoreButton}
                {divider}
                {closeIcon}
              </Stack>
            }
          >
            <Stack
              direction="row"
              spacing={1}
              marginLeft={5}
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
