import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "./Header";
import Footer from "./Footer";
import {GlobalStateProvider} from "../../GlobalState";
import {ProvideColorMode} from "../../context";
import {WalletProvider} from "../../context/wallet";
import {GraphqlClientProvider} from "../../api/hooks/useGraphqlClient";

interface LayoutProps {
  children: React.ReactNode;
}

export default function ExplorerLayout({children}: LayoutProps) {
  return (
    <ProvideColorMode>
      <CssBaseline />
      <GlobalStateProvider>
        <WalletProvider>
          <GraphqlClientProvider>
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
              <Header />
              <Container maxWidth="xl" sx={{flexGrow: 4, paddingTop: "2rem"}}>
                {children}
              </Container>
              <Footer />
            </Box>
          </GraphqlClientProvider>
        </WalletProvider>
      </GlobalStateProvider>
    </ProvideColorMode>
  );
}
