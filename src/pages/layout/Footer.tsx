import React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import {styled} from "@mui/material/styles";

import GitLogo from "../../assets/git.svg";
import DiscordLogo from "../../assets/discord.svg";
import TwitterLogo from "../../assets/twitter.svg";
import MediumLogo from "../../assets/medium.svg";
import LinkedInLogo from "../../assets/linkedin.svg";
import AptosLogo from "../../assets/aptos_word.svg";
import Box from "@mui/material/Box";

const StyledFooter = styled(Box)(({theme}) => ({
  minHeight: "10em",
  maxHeight: "8em",
  maxWidth: "100% !important",
  backgroundColor: "black",
  marginTop: "3em",
  color: "white !important",
}));

const socialLinks = [
  {title: "Git", url: "https://github.com/aptoslabs", icon: GitLogo},
  {title: "Discord", url: "https://discord.gg/zTDYBEud7U", icon: DiscordLogo},
  {title: "Twitter", url: "https://twitter.com/aptoslabs/", icon: TwitterLogo},
  {title: "Medium", url: "https://aptoslabs.medium.com/", icon: MediumLogo},
  {
    title: "LinkedIn",
    url: "https://www.linkedin.com/company/aptoslabs/",
    icon: LinkedInLogo,
  },
];

export default function Footer() {
  return (
    <StyledFooter maxWidth="lg">
      <Container maxWidth="lg" sx={{paddingTop: "1em"}}>
        <Grid container spacing={12} direction="row" alignItems="center">
          <Grid item>
            <Link
              color="inherit"
              href="https://aptoslabs.com/"
              target="blank"
              sx={{color: "white"}}
            >
              <img
                src={AptosLogo}
                alt="Aptos Labs"
                style={{maxWidth: "15rem", height: "80px", width: "150px"}}
              />
            </Link>
          </Grid>

          <Grid item lg>
            <Typography align="center">
              If you have any questions, please contact us at
              <br />
              <a href="mailto:info@aptoslabs.com" style={{color: "white"}}>
                info@aptoslabs.com
              </a>{" "}
              or{" "}
              <a href="mailto:press@aptoslabs.com" style={{color: "white"}}>
                press@aptoslabs.com
              </a>
            </Typography>
          </Grid>

          <Grid item>
            <Grid container spacing={2} direction="row">
              {socialLinks.map((link) => (
                <Grid item key={link.title}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.title}
                  >
                    <img
                      src={link.icon}
                      alt={`${link.title} Icon`}
                      style={{height: "20px", width: "20px"}}
                    />
                  </a>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </StyledFooter>
  );
}
