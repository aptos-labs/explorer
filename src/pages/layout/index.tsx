import React, {Suspense} from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "./Header";
import Footer from "./Footer";
import {Fallback} from "./Fallback";
import {
  GlobalStateProvider,
  useGlobalState,
} from "../../global-config/GlobalConfig";
import {ProvideColorMode} from "../../context";
import {GraphqlClientProvider} from "../../api/hooks/useGraphqlClient";
import {AptosWalletAdapterProvider} from "@aptos-labs/wallet-adapter-react";
import {MSafeWalletAdapter} from "@msafe/aptos-wallet-adapter";
import {OKXWallet} from "@okwallet/aptos-wallet-adapter";
import {Network} from "@aptos-labs/ts-sdk";
import {hiddenNetworks} from "../../constants";

const AptosConnectId = "99d260d0-c69d-4c15-965f-f6f9b7b00102";

function ExplorerWalletAdapterProvider({children}: LayoutProps) {
  const [state] = useGlobalState();

  const okxWalletAdapter = new OKXWallet();
  const msafeWalletAdapter = new MSafeWalletAdapter();
  let networkName = state.network_name;
  if (hiddenNetworks.includes(networkName)) {
    // Exoctic networks cause issues with the wallet adapter so for now we can pretend it's local
    networkName = "local";
  }
  return (
    <AptosWalletAdapterProvider
      key={networkName}
      plugins={[okxWalletAdapter, msafeWalletAdapter]}
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
      <GlobalStateProvider>
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
      </GlobalStateProvider>
    </ProvideColorMode>
  );
}
