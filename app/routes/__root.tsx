import React, {Suspense, lazy} from "react";
import {createRootRouteWithContext, Outlet} from "@tanstack/react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import {HelmetProvider} from "react-helmet-async";

// Check if in development mode
const isDev = process.env.NODE_ENV === "development";

// Lazy load devtools only in development to reduce production bundle size
const ReactQueryDevtools = isDev
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((mod) => ({
        default: mod.ReactQueryDevtools,
      })),
    )
  : () => null;

const TanStackRouterDevtools = isDev
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null;

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
        {isDev && (
          <Suspense fallback={null}>
            <ReactQueryDevtools buttonPosition="bottom-left" />
            <TanStackRouterDevtools position="bottom-right" />
          </Suspense>
        )}
      </QueryClientProvider>
    </HelmetProvider>
  );
}
