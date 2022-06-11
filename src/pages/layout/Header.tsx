import React from "react";
import Toolbar from "@mui/material/Toolbar";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import NetworkSelect from "./NetworkSelect";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";
import { useColorMode } from '../../context';
import { useTheme } from '@mui/material';
import { ReactComponent as LogoFull } from '../../assets/svg/aptos_logo_full.svg';
import { ReactComponent as IconLight } from '../../assets/svg/icon_light.svg';
import { ReactComponent as IconDark } from '../../assets/svg/icon_dark.svg';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';

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

  return (
    <MuiAppBar sx={{
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
      
    </MuiAppBar>
  );
}
