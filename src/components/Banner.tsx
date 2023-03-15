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

  return (
    <Collapse in={bannerOpen}>
      <Box
        sx={[
          {
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
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
              <Button variant="text" onClick={handleClick}>
                <Typography>LEARN MORE</Typography>
                <ArrowForwardIosIcon sx={{marginLeft: 2}} fontSize="small" />
              </Button>
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{color: grey[200]}}
              />
              <IconButton
                sx={{color: "#ffffff"}}
                size="medium"
                onClick={() => {
                  setBannerOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
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
            <Typography
              sx={{
                backgroundColor: "#8B5CF6",
                color: "#ffffff",
                borderRadius: 1,
                paddingX: 1,
              }}
            >
              NEW
            </Typography>
            <Typography color="#ffffff">{children}</Typography>
          </Stack>
        </Alert>
      </Box>
    </Collapse>
  );
}
