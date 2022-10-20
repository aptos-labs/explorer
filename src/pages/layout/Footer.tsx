import React from "react";
import {Box, Container, Link, Stack, Typography, useTheme} from "@mui/material";

import Grid from "@mui/material/Unstable_Grid2";

import {ReactComponent as GithubLogo} from "../../assets/github.svg";
import {ReactComponent as DiscordLogo} from "../../assets/discord.svg";
import {ReactComponent as TwitterLogo} from "../../assets/twitter.svg";
import {ReactComponent as MediumLogo} from "../../assets/medium.svg";
import {ReactComponent as LinkedInLogo} from "../../assets/linkedin.svg";
import {grey} from "../../themes/colors/aptosColorPalette";
import SvgIcon, {SvgIconProps} from "@mui/material/SvgIcon";

import {ReactComponent as LogoFull} from "../../assets/svg/aptos_logo_icon.svg";

const socialLinks = [
  {title: "Git", url: "https://github.com/aptos-labs", icon: GithubLogo},
  {
    title: "Discord",
    url: "https://discord.com/invite/aptoslabs",
    icon: DiscordLogo,
  },
  {title: "Twitter", url: "https://twitter.com/aptoslabs/", icon: TwitterLogo},
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
          spacing={{xs: 4, md: 1}}
          alignContent="center"
          alignItems="center"
          direction={{xs: "column", md: "row"}}
        >
          <Grid xs="auto" container justifyContent="start">
            <Link
              color="inherit"
              href="https://aptoslabs.com/"
              target="_blank"
              sx={{width: "3rem", mb: {xs: 2, md: 0}, mr: {md: 2}}}
            >
              <LogoFull />
            </Link>
          </Grid>
          <Grid
            xs="auto"
            container
            direction={{xs: "column"}}
            justifyContent="start"
          >
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
                href="https://aptoslabs.com/privacy"
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
                href="https://aptoslabs.com/terms"
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
          <Grid
            xs="auto"
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
                    href={link.url}
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
