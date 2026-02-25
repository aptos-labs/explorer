import type {Network} from "@aptos-labs/ts-sdk";
import {AptosWalletAdapterProvider} from "@aptos-labs/wallet-adapter-react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import type React from "react";
import {Suspense} from "react";
import {GraphqlClientProvider} from "../../api/hooks/useGraphqlClient";
import {hiddenNetworks} from "../../constants";
import {ProvideColorMode} from "../../context";
import {
  GlobalConfigProvider,
  useNetworkName,
} from "../../global-config/GlobalConfig";
import {Fallback} from "./Fallback";
import Footer from "./Footer";
import Header from "./Header";

const AptosConnectId = "99d260d0-c69d-4c15-965f-f6f9b7b00102";

function ExplorerWalletAdapterProvider({children}: LayoutProps) {
  const networkNameFromState = useNetworkName();

  let networkName = networkNameFromState;
  if (hiddenNetworks.includes(networkName)) {
    // Other networks cause issues with the wallet adapter, so for now we can pretend it's local
    networkName = "local";
  }
  return (
    <AptosWalletAdapterProvider
      key={networkName}
      autoConnect={true}
      dappConfig={{
        aptosConnectDappId: AptosConnectId,
        network: networkName as Network,
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function ExplorerLayout({children}: LayoutProps) {
  return (
    <ProvideColorMode>
      <CssBaseline />
      <GlobalConfigProvider>
        <ExplorerWalletAdapterProvider>
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
              <Container
                maxWidth="xl"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 4,
                  paddingTop: "2rem",
                }}
              >
                <Suspense fallback={<Fallback />}>{children}</Suspense>
              </Container>
              <Footer />
            </Box>
          </GraphqlClientProvider>
        </ExplorerWalletAdapterProvider>
      </GlobalConfigProvider>
    </ProvideColorMode>
  );
}
