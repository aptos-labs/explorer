import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import {type QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import {lazy, Suspense} from "react";
// Universal import pattern for ESM/CJS compatibility
import * as ReactHelmetAsync from "react-helmet-async";

const HelmetProvider = ((
  ReactHelmetAsync as {HelmetProvider?: typeof ReactHelmetAsync.HelmetProvider}
).HelmetProvider ??
  (ReactHelmetAsync as {default?: typeof ReactHelmetAsync}).default
    ?.HelmetProvider) as typeof ReactHelmetAsync.HelmetProvider;

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

import {GraphqlClientProvider} from "../api/hooks/useGraphqlClient";
import {ErrorBoundary, NotFoundError} from "../components/ErrorBoundary";
import LocalnetUnavailableModal from "../components/LocalnetUnavailableModal";
import {Fallback} from "../components/layout/Fallback";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import {ProvideColorMode} from "../context/color-mode";
import {WalletAdapterProvider} from "../context/wallet-adapter";
import {GlobalConfigProvider} from "../global-config";
import {useHashToPathRedirect} from "../hooks/useHashToPathRedirect";
import {useOldUrlRedirect} from "../hooks/useOldUrlRedirect";
import {BASE_URL} from "../lib/constants";
import {googleFontsStylesheetHref} from "../themes/typography";
import {ExplorerSettingsProvider} from "../settings";

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
      {property: "og:locale", content: "en_US"},
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
        href: googleFontsStylesheetHref,
      },
      // Favicons
      {rel: "icon", href: "/favicon-light.svg", type: "image/svg+xml"},
      {rel: "apple-touch-icon", href: "/apple-touch-icon.png"},
      {rel: "manifest", href: "/manifest.json"},
      // LLM documentation links
      {
        rel: "help",
        href: "/llms.txt",
        type: "text/plain",
        title: "LLM Documentation",
      },
      {
        rel: "alternate",
        href: "/llms.txt",
        type: "text/plain",
        title: "LLM Documentation (Summary)",
      },
      {
        rel: "alternate",
        href: "/llms-full.txt",
        type: "text/plain",
        title: "LLM Documentation (Full)",
      },
      // Language/region hints for search engines
      {rel: "alternate", href: BASE_URL, hrefLang: "en"},
      {rel: "alternate", href: BASE_URL, hrefLang: "x-default"},
    ],
  }),
  errorComponent: ({error}) => <ErrorBoundary error={error} />,
  notFoundComponent: () => <NotFoundError />,
  component: RootComponent,
});

function RootComponent() {
  const {queryClient} = Route.useRouteContext();

  // Redirect old subdomain-based URLs to the new query parameter format for backward compatibility
  // e.g., explorer.devnet.aptos.dev → explorer.aptoslabs.com?network=devnet
  useOldUrlRedirect();

  // Redirect hash-based tab URLs to path-based URLs for backward compatibility
  useHashToPathRedirect();

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
                <ExplorerSettingsProvider>
                  <GlobalConfigProvider>
                    <LocalnetUnavailableModal />
                    <GraphqlClientProvider>
                      <WalletAdapterProvider>
                        <Box
                          sx={{
                            minHeight: "100vh",
                            backgroundColor: "transparent",
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box
                            component="a"
                            href="#main-content"
                            sx={{
                              position: "absolute",
                              top: "-100%",
                              left: "50%",
                              transform: "translateX(-50%)",
                              zIndex: 9999,
                              px: 3,
                              py: 1.5,
                              borderRadius: 1,
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              textDecoration: "none",
                              color: "background.default",
                              bgcolor: "text.primary",
                              border: "2px solid",
                              borderColor: "background.default",
                              outline: "none",
                              transition: "top 0.1s",
                              "&:focus": {
                                top: "1rem",
                              },
                            }}
                          >
                            Skip to main content
                          </Box>
                          <Header />
                          <Container
                            id="main-content"
                            component="main"
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
                  </GlobalConfigProvider>
                </ExplorerSettingsProvider>
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
