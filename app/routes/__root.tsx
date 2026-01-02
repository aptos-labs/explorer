import React, {Suspense} from "react";
import {createRootRouteWithContext, Outlet} from "@tanstack/react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {TanStackRouterDevtools} from "@tanstack/react-router-devtools";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import {HelmetProvider} from "react-helmet-async";

import {ProvideColorMode} from "../context/color-mode";
import {GlobalConfigProvider} from "../global-config";
import {GlobalStateProvider} from "../context/global-state";
import {WalletAdapterProvider} from "../context/wallet-adapter";
import {GraphqlClientProvider} from "../api/hooks/useGraphqlClient";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {Fallback} from "../components/layout/Fallback";
import {ErrorBoundary, NotFoundError} from "../components/ErrorBoundary";
// Removed SSR-specific imports - meta tags are handled in index.html and via react-helmet-async

// Router context type
interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  errorComponent: ({error}) => <ErrorBoundary error={error} />,
  notFoundComponent: () => <NotFoundError />,
  component: RootComponent,
});

function RootComponent() {
  const {queryClient} = Route.useRouteContext();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ProvideColorMode>
          <CssBaseline />
          <GlobalConfigProvider>
            <GlobalStateProvider>
              <GraphqlClientProvider>
                <WalletAdapterProvider>
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
                    <Container
                      maxWidth="xl"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 4,
                        paddingTop: "2rem",
                      }}
                    >
                      <Suspense fallback={<Fallback />}>
                        <Outlet />
                      </Suspense>
                    </Container>
                    <Footer />
                  </Box>
                </WalletAdapterProvider>
              </GraphqlClientProvider>
            </GlobalStateProvider>
          </GlobalConfigProvider>
        </ProvideColorMode>
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <TanStackRouterDevtools position="bottom-right" />
      </QueryClientProvider>
    </HelmetProvider>
  );
}
