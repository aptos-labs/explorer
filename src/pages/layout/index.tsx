import React from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Header from "./Header";
import Footer from "./Footer";
import {GlobalStateProvider} from "../../GlobalState";


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
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            overflow: "auto",
          }}
        >
          <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
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
