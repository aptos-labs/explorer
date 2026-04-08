import {Box, Container, Grid, Stack, Typography, useTheme} from "@mui/material";
import SvgIcon from "@mui/material/SvgIcon";
import DiscordLogo from "../../assets/discord.svg?react";
import GithubLogo from "../../assets/github.svg?react";
import LinkedInLogo from "../../assets/linkedin.svg?react";
import MediumLogo from "../../assets/medium.svg?react";
import LogoFullDark from "../../assets/svg/aptos_logo_full_dark.svg?react";

import LogoFullLight from "../../assets/svg/aptos_logo_full_light.svg?react";
import TwitterLogo from "../../assets/twitter.svg?react";
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
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      component="footer"
      sx={{
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        mt: 8,
      }}
    >
      <Container maxWidth="xl" sx={{paddingTop: "2rem", paddingBottom: "2rem"}}>
        <Grid
          container
          sx={{
            flexDirection: {xs: "column", md: "row"},
            gap: 4,
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Grid
            size={{xs: "auto"}}
            container
            sx={{
              flexDirection: "column",
              gap: 1,
              alignItems: {xs: "center", md: "start"},
            }}
          >
            <Link
              color="inherit"
              to="https://aptoslabs.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Aptos Labs"
              sx={{width: "8rem", marginRight: "1rem"}}
            >
              {isDark ? (
                <LogoFullDark width="8rem" height="3rem" />
              ) : (
                <LogoFullLight width="8rem" height="3rem" />
              )}
            </Link>
            <Grid container direction="row" spacing={2} sx={{padding: "0"}}>
              <Typography
                sx={{
                  textAlign: {xs: "center", md: "left"},
                  fontFamily: theme.typography.fontFamily,
                  fontSize: "0.8rem",
                }}
              >
                © {new Date().getFullYear()}{" "}
                <Box component="span" sx={{whiteSpace: "nowrap"}}>
                  Aptos Labs
                </Box>
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{justifyContent: {xs: "center", md: "start"}}}
              >
                <Link
                  color="inherit"
                  to="https://aptoslabs.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontSize: "0.8rem",
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  Privacy
                </Link>
                <Link
                  color="inherit"
                  to="https://aptoslabs.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontSize: "0.8rem",
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  Terms
                </Link>
                <Link
                  color="inherit"
                  to="/verification"
                  sx={{
                    fontSize: "0.8rem",
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  Token & Address Verification
                </Link>
              </Stack>
            </Grid>
          </Grid>

          <Grid
            size={{xs: "auto"}}
            sx={{marginLeft: {xs: "0", md: "auto"}, justifyContent: "end"}}
            container
          >
            <Grid
              container
              spacing={3}
              direction="row"
              sx={{justifyContent: {xs: "center", md: "end"}}}
            >
              {socialLinks.map((link) => (
                <Grid key={link.title}>
                  <Link
                    color="inherit"
                    to={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.title}
                    sx={{display: "block", width: "26px"}}
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
