import React, {useState} from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "./Header";
import Footer from "./Footer";
import {GlobalStateProvider} from "../../GlobalState";
import {ProvideColorMode} from "../../context";
import {GraphqlClientProvider} from "../../api/hooks/useGraphqlClient";
import {
  Alert,
  Collapse,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {primary} from "../../themes/colors/aptosColorPalette";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";

interface LayoutProps {
  children: React.ReactNode;
}

export default function ExplorerLayout({children}: LayoutProps) {
  const theme = useTheme();
  const inDev = useGetInDevMode();
  const [bannerOpen, setBannerOpen] = useState<boolean>(true);
  // TODO(jill): update learn more link

  return (
    <ProvideColorMode>
      <CssBaseline />
      <GlobalStateProvider>
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
            {inDev && (
              <Collapse in={bannerOpen}>
                <Alert
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1E40AF" : "#1D4ED8",
                    borderRadius: 0,
                  }}
                  icon={
                    <Stack color="#ffffff">
                      <link
                        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                        rel="stylesheet"
                      />
                      <span className="material-symbols-outlined">info</span>
                    </Stack>
                  }
                  action={
                    <Stack direction="row" spacing={3} color={primary[400]}>
                      <Link href={""} color={primary[400]}>
                        <Stack direction="row" paddingTop={1} spacing={1}>
                          <Typography>LEARN MORE</Typography>
                          <ArrowForwardIosIcon />
                        </Stack>
                      </Link>
                      <Divider
                        orientation="vertical"
                        flexItem
                        variant="middle"
                        sx={{backgroundColor: "#3B82F6"}}
                      />

                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="medium"
                        onClick={() => {
                          setBannerOpen(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  }
                >
                  <Typography color="#ffffff">
                    Power Aptos network. Stake tokens and earn rewards.
                  </Typography>
                </Alert>
              </Collapse>
            )}
            <Container maxWidth="xl" sx={{flexGrow: 4, paddingTop: "2rem"}}>
              {children}
            </Container>
            <Footer />
          </Box>
        </GraphqlClientProvider>
      </GlobalStateProvider>
    </ProvideColorMode>
  );
}
