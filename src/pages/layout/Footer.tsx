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

import { ReactComponent as LogoIcon } from '../../assets/svg/aptos_logo_icon.svg';

const StyledFooter = styled(Box)(
  ({ theme }) => ({
    maxWidth: "100% !important",
    backgroundColor: "black",
    marginTop: "3em",
    color: "white !important",
  }));

const socialLinks = [
  { title: "Git", url: "https://github.com/aptoslabs", icon: GitLogo },
  { title: "Discord", url: "https://discord.gg/zTDYBEud7U", icon: DiscordLogo },
  { title: "Twitter", url: "https://twitter.com/aptoslabs/", icon: TwitterLogo },
  { title: "Medium", url: "https://aptoslabs.medium.com/", icon: MediumLogo },
  { title: "LinkedIn", url: "https://www.linkedin.com/company/aptoslabs/", icon: LinkedInLogo },
];

export default function Footer() {
  return (
    <StyledFooter maxWidth="xl">
      <Container maxWidth="xl" sx={{ paddingTop: "3em", paddingBottom: "3em" }}>
        <Grid container spacing={{xs:4, md:1}} alignContent="center" alignItems="center" direction={{xs: "column", md: "row"}}>
          <Grid item xs="auto" sx={{ mr: 2 }} container justifyContent="start">
            <Link color="inherit" href="https://aptoslabs.com/" target="blank" sx={{ color: "white" }}>
              <LogoIcon />
            </Link>
          </Grid>
          <Grid item xs="auto" container justifyContent="start">
            <Typography sx={{ textAlign: { xs: "center", md: "left" }}} fontSize="0.8rem">
              © {new Date().getFullYear()} <Box component="span" sx={{ whiteSpace: "nowrap" }}>Matonee Inc. (dba Aptos Labs)</Box>
              <br />
              <Link color="inherit" href="mailto:info@aptoslabs.com" target="blank" sx={{ color: "white", }}>
                info@aptoslabs.com
              </Link>
              <Box component="span" sx={{ px:1, display:"inline-block" }}>or</Box>
              <Link color="inherit" href="mailto:press@aptoslabs.com" target="blank" sx={{ color: "white" }}>
                press@aptoslabs.com
              </Link>
            </Typography>
          </Grid>
          <Grid item xs="auto" sx={{ marginLeft:{ xs: "0", md: "auto" } }} container justifyContent="end">
            <Grid container justifyContent={{xs:"center", md:"end"}} spacing={2} direction="row">
              {socialLinks.map((link) => (
                <Grid item key={link.title}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.title}
                  >
                    <img src={link.icon} alt={`${link.title} Icon`}
                      style={{ height: "26px", width: "26px" }} />
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