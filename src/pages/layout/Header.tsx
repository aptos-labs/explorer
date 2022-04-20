import React from "react";

import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MuiAppBar from "@mui/material/AppBar";
import {styled} from "@mui/material/styles";
import Box from "@mui/material/Box";
import LogoWhite from "../../assets/aptos_icon_transparent_wht2.png";
// import HeaderSearch from "./Search";
import Container from "@mui/material/Container";
import NetworkSelect from "./NetworkSelect";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";

import { HelpOutline, Replay, Brightness4, Brightness7 } from '@mui/icons-material';
import { useColorMode } from '../../context';
import { useTheme } from '@mui/material';
import { ReactComponent as LogoFull } from '../../assets/svg/aptos_logo_full.svg';
import { ReactComponent as IconLight } from '../../assets/svg/icon_light.svg';
import { ReactComponent as IconDark } from '../../assets/svg/icon_dark.svg';
import Button from '@mui/material/Button';
import { green, cyan, grey, teal} from '@mui/material/colors';

const HeaderAppBar = styled(MuiAppBar)(
  ({theme}) => ({
    zIndex: theme.zIndex.drawer + 1,
    // backgroundColor: "rgb(0,0,0,0.3)",
    // transition: theme.transitions.create(["width", "margin"], {
    //   easing: theme.transitions.easing.sharp,
    //   duration: theme.transitions.duration.leavingScreen,
    // }),
  }));

export default function Header() {

  const scrollTop = () => {
    const docElement = document.documentElement;
    const windowTop = (window.pageYOffset || docElement.scrollTop) - (docElement.clientTop || 0);

    if (windowTop > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

  const { toggleColorMode } = useColorMode();
  const theme = useTheme();

  const primaryColor = teal['A400'];



  return (
    <HeaderAppBar sx={{
      boxShadow: 0, background: 'black', position: 'fixed', borderRadius:'0'}}>
      <Container maxWidth={false}>

        <Toolbar disableGutters>
          <Link onClick={scrollTop} component={RRD.Link}
            to="/"
            color="inherit"
            underline="none"
            sx={{
              height: { xs: "20px", sm: "20px", md: "30px" },
            }}
          >
            <LogoFull />
          </Link>
          
          <Button onClick={toggleColorMode} sx={{
            marginLeft: "auto", 
            border: `1px solid ${theme.palette.mode === 'dark' ? grey[500] : grey[100]}`, 
            "&:hover": { borderColor: theme.palette.mode === 'dark' ? grey[500] : grey[100], backgroundColor: grey[900]},
            "&:active": { borderColor: theme.palette.primary.main, backgroundColor: grey[900], borderWidth:'2px' },
            borderRadius: "8px", 
            width: "40px", 
            height: "40px", 
            display: "flex", 
            alignItems: "center", 
            justifyItems: "center", 
            padding: "0", 
            minWidth: "40px"
          }}>
            {theme.palette.mode === 'light' ? <IconLight /> : <IconDark />}
          </Button>
          <NetworkSelect/>
        </Toolbar>
      </Container>
      
    </HeaderAppBar>
  );
}


