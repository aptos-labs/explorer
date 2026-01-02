import React, {Suspense, lazy} from "react";
import {
  createRootRouteWithContext,
  Outlet,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import * as ReactHelmetAsync from "react-helmet-async";
const HelmetProvider =
  ReactHelmetAsync.HelmetProvider ||
  (ReactHelmetAsync as unknown as {default: typeof ReactHelmetAsync}).default
    ?.HelmetProvider;

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

// Router context type
interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {charSet: "UTF-8"},
      {name: "viewport", content: "width=device-width, initial-scale=1.0"},
      {title: "Aptos Explorer"},
      {
        name: "description",
        content:
          "Explore transactions, accounts, blocks, validators, and activity on the Aptos blockchain. The official block explorer for the Aptos network.",
      },
      {
        name: "keywords",
        content:
          "Aptos, blockchain, explorer, web3, crypto, transactions, accounts, blocks, validators, NFTs, tokens, staking",
      },
      {name: "author", content: "Aptos Labs"},
      {name: "robots", content: "index, follow"},
      // AI/LLM optimization meta tags
      {
        name: "ai:description",
        content:
          "Aptos blockchain explorer for viewing transactions, accounts, blocks, validators, tokens, and network analytics",
      },
      {name: "ai:site_type", content: "blockchain_explorer"},
      {
        name: "ai:primary_topics",
        content:
          "blockchain, cryptocurrency, Aptos, transactions, smart contracts, Move language",
      },
    ],
    links: [
      // Fonts
      {rel: "preconnect", href: "https://fonts.googleapis.com"},
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap",
      },
      // Favicons
      {rel: "icon", href: "/favicon-light.svg", type: "image/svg+xml"},
      {rel: "apple-touch-icon", href: "/apple-touch-icon.png"},
      {rel: "manifest", href: "/manifest.json"},
      // LLM documentation link
      {
        rel: "help",
        href: "/llms.txt",
        type: "text/plain",
        title: "LLM Documentation",
      },
    ],
  }),
  errorComponent: ({error}) => <ErrorBoundary error={error} />,
  notFoundComponent: () => <NotFoundError />,
  component: RootComponent,
});

function RootComponent() {
  const {queryClient} = Route.useRouteContext();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="root">
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
        </div>
        <Scripts />
      </body>
    </html>
  );
}
