import React from "react";
import {Box, Container, Grid, Stack, Typography, useTheme} from "@mui/material";
import GithubLogo from "../../assets/github.svg?react";
import DiscordLogo from "../../assets/discord.svg?react";
import TwitterLogo from "../../assets/twitter.svg?react";
import MediumLogo from "../../assets/medium.svg?react";
import LinkedInLogo from "../../assets/linkedin.svg?react";
import {grey} from "../../themes/colors/libra2ColorPalette";
import SvgIcon from "@mui/material/SvgIcon";

import LogoFull from "../../assets/svg/libra2_logo_labs.svg?react";
import {Link} from "../../routing";

const socialLinks = [
  {title: "Git", url: "https://github.com/aptos-labs", icon: GithubLogo},
  {
    title: "Discord",
    url: "https://discord.com/invite/aptosnetwork",
    icon: DiscordLogo,
  },
  {title: "Twitter", url: "https://x.com/aptoslabs/", icon: TwitterLogo},
  {title: "Medium", url: "https://aptoslabs.medium.com/", icon: MediumLogo},
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/company/aptoslabs/",
    icon: LinkedInLogo,
  },
];

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: theme.palette.mode === "dark" ? grey[900] : "white",
        color: theme.palette.mode === "dark" ? grey[100] : "rgba(18,22,21,1)",
        mt: 8,
      }}
    >
      <Container maxWidth="xl" sx={{paddingTop: "2rem", paddingBottom: "2rem"}}>
        <Grid
          container
          gap={4}
          alignContent="center"
          alignItems="center"
          direction={{xs: "column", md: "row"}}
        >
          <Grid
            size={{xs: "auto"}}
            gap={1}
            container
            alignItems={{xs: "center", md: "start"}}
            direction="column"
          >
            <Link
              color="inherit"
              to="https://aptoslabs.com/"
              target="_blank"
              title="Aptos Labs"
              sx={{width: "8rem", mr: {md: 2}}}
            >
              <LogoFull />
            </Link>
            <Grid container direction="row" padding="0" spacing={2}>
              <Typography
                sx={{
                  textAlign: {
                    xs: "center",
                    md: "left",
                    fontFamily: "apparat, Geneva, Tahoma, Verdana, sans-serif",
                  },
                }}
                fontSize="0.8rem"
              >
                © {new Date().getFullYear()}{" "}
                <Box component="span" sx={{whiteSpace: "nowrap"}}>
                  Aptos Labs
                </Box>
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{xs: "center", md: "start"}}
              >
                <Link
                  color="inherit"
                  to="https://aptoslabs.com/privacy"
                  target="_blank"
                  sx={{
                    fontSize: "0.8rem",
                    fontFamily: "apparat, Geneva, Tahoma, Verdana, sans-serif",
                  }}
                >
                  Privacy
                </Link>
                <Link
                  color="inherit"
                  to="https://aptoslabs.com/terms"
                  target="_blank"
                  sx={{
                    fontSize: "0.8rem",
                    fontFamily: "apparat, Geneva, Tahoma, Verdana, sans-serif",
                  }}
                >
                  Terms
                </Link>
              </Stack>
            </Grid>
          </Grid>

          <Grid
            size={{xs: "auto"}}
            sx={{marginLeft: {xs: "0", md: "auto"}}}
            container
            justifyContent="end"
          >
            <Grid
              container
              justifyContent={{xs: "center", md: "end"}}
              spacing={3}
              direction="row"
            >
              {socialLinks.map((link) => (
                <Grid key={link.title}>
                  <Link
                    color="inherit"
                    to={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.title}
                    width="26px"
                    sx={{display: "block"}}
                  >
                    <SvgIcon component={link.icon} inheritViewBox />
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
