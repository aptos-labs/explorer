import React from "react";
import Toolbar from "@mui/material/Toolbar";
import MuiAppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import NetworkSelect from "./NetworkSelect";
import Link from "@mui/material/Link";
import * as RRD from "react-router-dom";
import { useColorMode } from '../../context';
import { useTheme } from '@mui/material';
import { ReactComponent as LogoIcon } from '../../assets/svg/aptos_logo_icon.svg';
import { ReactComponent as IconLight } from '../../assets/svg/icon_light.svg';
import { ReactComponent as IconDark } from '../../assets/svg/icon_dark.svg';
import Button from '@mui/material/Button';
import Nav from "../../components/Nav";
import NavMobile from "../../components/NavMobile";
import { grey } from "@mui/material/colors";

export default function Header() {
  const scrollTop = () => {
    const docElement = document.documentElement;
    const windowTop =
      (window.pageYOffset || docElement.scrollTop) -
      (docElement.clientTop || 0);

    if (windowTop > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const {toggleColorMode} = useColorMode();
  const theme = useTheme();

  return (
    <MuiAppBar sx={{
      background: theme.palette.mode === 'dark' ? "rgba(23,23,23,1)" : grey[50], boxShadow: 'none', position: 'sticky', top: '0', borderRadius: '0'
    }}>
      <Container maxWidth={false}>

        <Toolbar sx={{ height:"5rem", color: theme.palette.mode === 'dark' ? grey[100] : "rgba(23,23,23,1)" }} disableGutters>
          <Link onClick={scrollTop} component={RRD.Link}
            to="/"
            color="inherit"
            underline="none"
            sx={{
              width: { xs: "30px", sm: "30px", md: "40px" },
              height: { xs: "30px", sm: "30px", md: "40px" },
              marginRight: "auto",
            }}
          >
            <LogoIcon />
          </Link>

          <Nav />
          <NetworkSelect />
          <Button onClick={toggleColorMode} sx={{
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            padding: "0",
            minWidth: "30px",
            marginLeft: "1rem",
            color: "inherit", "&:hover": { background: 'transparent', opacity: '0.8' },
          }}>
            {theme.palette.mode === 'light' ? <IconLight /> : <IconDark />}
          </Button>
          <NavMobile />
          
        </Toolbar>
      </Container>

    </MuiAppBar>
  );
}
