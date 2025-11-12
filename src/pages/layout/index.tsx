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
import {
  AptosWalletAdapterProvider,
  // NetworkName,
} from "@aptos-labs/wallet-adapter-react";
// import {BitgetWallet} from "@bitget-wallet/aptos-wallet-adapter";
// import {BloctoWallet} from "@blocto/aptos-wallet-adapter-plugin";
import {MartianWallet} from "@martianwallet/aptos-wallet-adapter";
import {PontemWallet} from "@pontem/wallet-adapter-plugin";
import {RiseWallet} from "@rise-wallet/wallet-adapter";
import {TokenPocketWallet} from "@tp-lab/aptos-wallet-adapter";
import {TrustWallet} from "@trustwallet/aptos-wallet-adapter";
import {MSafeWalletAdapter} from "@msafe/aptos-wallet-adapter";
// import {RimoWallet} from "rimosafe-plugin-wallet-adapter";
// import {OKXWallet} from "@okwallet/aptos-wallet-adapter";
import {PetraWallet} from "petra-plugin-wallet-adapter";
import {useMemo} from "react";
import NetworkStatus from "../../components/NetworkStatus";

// Statically initialize wallets that don't change for the network
const petraWallet = new PetraWallet();
const martianWallet = new MartianWallet();
const msafeWallet = new MSafeWalletAdapter();
// const rimowallet = new RimoWallet();
// const okxWallet = new OKXWallet();
const pontemWallet = new PontemWallet();
const riseWallet = new RiseWallet();
const tokenPocketWallet = new TokenPocketWallet();
const trustWallet = new TrustWallet();
// const welldoneWallet = new WelldoneWallet();
// const bitgetWallet = new BitgetWallet();

function ExplorerWalletAdapterProvider({children}: LayoutProps) {
  const [state] = useGlobalState();
  const wallets = useMemo(
    () => [
      petraWallet,
      pontemWallet,
      // rimowallet,
      // okxWallet,
      msafeWallet,
      trustWallet,
      tokenPocketWallet,
      martianWallet,
      // Blocto supports Testnet/Mainnet for now.
      // new BloctoWallet({
      //   network: NetworkName.Testnet,
      //   bloctoAppId: "6d85f56e-5f2e-46cd-b5f2-5cf9695b4d46",
      // }),
      riseWallet,
      // msafeWallet,
      // tokenPocketWallet,
      // trustWallet,
      // welldoneWallet,
      // riseWallet,
    ],
    [],
  );

  return (
    <AptosWalletAdapterProvider
      key={state.network_name}
      plugins={wallets}
      autoConnect={true}
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
        <NetworkStatusWrapper>
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
        </NetworkStatusWrapper>
      </GlobalStateProvider>
    </ProvideColorMode>
  );
}

function NetworkStatusWrapper({children}: LayoutProps) {
  const [state] = useGlobalState();
  
  return (
    <>
      <NetworkStatus componentName={state.network_name === "mainnet" ? "MAINNET BETA" : "BARDOCK TESTNET"} />
      {children}
    </>
  );
}
