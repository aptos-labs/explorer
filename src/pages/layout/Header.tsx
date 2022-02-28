import React from "react";

import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MuiAppBar from "@mui/material/AppBar";
import {styled} from "@mui/material/styles";
import Box from "@mui/material/Box";
import LogoWhite from "../../assets/aptos_icon_transparent_wht2.png";
import HeaderSearch from "./Search";
import Container from "@mui/material/Container";
import NetworkSelect from "./NetworkSelect";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";

const HeaderAppBar = styled(MuiAppBar)(
  ({theme}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }));

export default function Header() {
  return (
    <HeaderAppBar position="absolute">
      <Container maxWidth="lg">

        <Toolbar disableGutters>
          <Box
            component="img"
            sx={{
              height: 32,
              mr: 2,
            }}
            alt="Aptos Labs"
            src={LogoWhite}
          />
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{flexGrow: 1}}
          >
            <Link component={RRD.Link}
                  to="/"
                  color="inherit"
                  underline="none"
            >
              Aptos Explorer
            </Link>
          </Typography>
          <HeaderSearch/>
          <NetworkSelect/>
        </Toolbar>

      </Container>
    </HeaderAppBar>
  );
}