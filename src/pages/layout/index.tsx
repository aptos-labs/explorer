import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Header from "./Header";
import HeaderSearch from "./Search";
import Footer from "./Footer";
import { GlobalStateProvider } from "../../GlobalState";
import { ProvideColorMode } from '../../context';
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export default function ExplorerLayout({ children }: LayoutProps) {

  const location = useLocation();

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
            {/* dont show the search box if on the governance page, 
            TODO - include the HeaderSearch only on transaction pages */}
            {location.pathname !== '/proposals' && <HeaderSearch />}
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
