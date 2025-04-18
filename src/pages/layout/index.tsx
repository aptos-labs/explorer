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
import {BitgetWallet} from "@bitget-wallet/aptos-wallet-adapter";
import {MartianWallet} from "@martianwallet/aptos-wallet-adapter";
import {PontemWallet} from "@pontem/wallet-adapter-plugin";
import {RiseWallet} from "@rise-wallet/wallet-adapter";
import {TokenPocketWallet} from "@tp-lab/aptos-wallet-adapter";
import {TrustWallet} from "@trustwallet/aptos-wallet-adapter";
import {WelldoneWallet} from "@welldone-studio/aptos-wallet-adapter";
import {MSafeWalletAdapter} from "@msafe/aptos-wallet-adapter";
import {RimoWallet} from "rimosafe-plugin-wallet-adapter";
import {OKXWallet} from "@okwallet/aptos-wallet-adapter";
import {useMemo} from "react";
import {Network} from "@aptos-labs/ts-sdk";

const AptosConnectId = "99d260d0-c69d-4c15-965f-f6f9b7b00102";

// Statically initialize wallets that don't change for the network
const martianWallet = new MartianWallet();
const msafeWallet = new MSafeWalletAdapter();
const rimowallet = new RimoWallet();
const okxWallet = new OKXWallet();
const pontemWallet = new PontemWallet();
const riseWallet = new RiseWallet();
const tokenPocketWallet = new TokenPocketWallet();
const trustWallet = new TrustWallet();
const welldoneWallet = new WelldoneWallet();
const bitgetWallet = new BitgetWallet();

function ExplorerWalletAdapterProvider({children}: LayoutProps) {
  const [state] = useGlobalState();
  const wallets = useMemo(
    () => [
      pontemWallet,
      rimowallet,
      okxWallet,
      bitgetWallet,
      msafeWallet,
      trustWallet,
      tokenPocketWallet,
      martianWallet,
      welldoneWallet,
      riseWallet,
    ],
    [],
  );

  return (
    <AptosWalletAdapterProvider
      key={state.network_name}
      plugins={wallets}
      autoConnect={true}
      dappConfig={{
        aptosConnectDappId: AptosConnectId,
        network: state.network_name as Network,
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
