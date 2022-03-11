import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Header from "./Header";
import Footer from "./Footer";
import { GlobalStateProvider } from "../../GlobalState";
import BackgroundImage from "../../assets/hero_v3-min.9c96f35d.jpg";


interface LayoutProps {
  children: React.ReactNode;
}

const mdTheme = createTheme();

export default function ExplorerLayout({children}: LayoutProps) {
  return (
    <ThemeProvider theme={mdTheme}>
      <GlobalStateProvider>
        <Box
          component="main"
          sx={{
            minHeight: "100vh",
            backgroundColor: "transparent",
            backgroundImage: `url(${BackgroundImage})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "50%",
            backgroundSize: "cover",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Container maxWidth="lg" sx={{mt: 4, mb: 4, flexGrow: 4}}>
            <CssBaseline/>

            <Header/>

            <Toolbar/>

            <Grid container>
              {children}
            </Grid>

          </Container>

          <Footer/>

        </Box>

      </GlobalStateProvider>
    </ThemeProvider>
  );
}
