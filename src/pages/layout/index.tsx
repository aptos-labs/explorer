import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Header from "./Header";
import HeaderSearch from "./Search";
import Footer from "./Footer";
import { GlobalStateProvider } from "../../GlobalState";
import { ProvideColorMode } from '../../context';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ExplorerLayout({ children }: LayoutProps) {
  return (
    <ProvideColorMode>
      <GlobalStateProvider>
        <Box
          component="main"
          sx={{
            minHeight: "100vh",
            backgroundColor: "transparent",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 4 }}>
            <CssBaseline />

            <Header />

            <HeaderSearch />

            {/* <Toolbar/> */}

            <Grid container>
              {children}
            </Grid>

          </Container>

          <Footer />

        </Box>
      </GlobalStateProvider>
    </ProvideColorMode>
  );
}
