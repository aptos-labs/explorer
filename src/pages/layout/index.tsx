import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Header from "./Header";
import Footer from "./Footer";
import {GlobalStateProvider} from "../../GlobalState";
import {ProvideColorMode} from "../../context";
import {WalletProvider} from "../../context/wallet";

interface LayoutProps {
  children: React.ReactNode;
}

export default function ExplorerLayout({children}: LayoutProps) {
  return (
    <ProvideColorMode>
      <GlobalStateProvider>
        <WalletProvider>
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
            <Container maxWidth="xl" sx={{mt: 4, mb: 4, flexGrow: 4}}>
              <CssBaseline />
              <Header />
              <Grid container>{children}</Grid>
            </Container>
            <Footer />
          </Box>
        </WalletProvider>
      </GlobalStateProvider>
    </ProvideColorMode>
  );
}
