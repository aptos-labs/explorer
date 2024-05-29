import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "./Header";
import Footer from "./Footer";
import {
  GlobalStateProvider,
  useGlobalState,
} from "../../global-config/GlobalConfig";
import {ProvideColorMode} from "../../context";
import {GraphqlClientProvider} from "../../api/hooks/useGraphqlClient";
import {
  AptosWalletAdapterProvider,
  NetworkName,
} from "@aptos-labs/wallet-adapter-react";
import {BitgetWallet} from "@bitget-wallet/aptos-wallet-adapter";
// import {BloctoWallet} from "@blocto/aptos-wallet-adapter-plugin";
import {MartianWallet} from "@martianwallet/aptos-wallet-adapter";
import {OpenBlockWallet} from "@openblockhq/aptos-wallet-adapter";
import {PontemWallet} from "@pontem/wallet-adapter-plugin";
import {RiseWallet} from "@rise-wallet/wallet-adapter";
import {TokenPocketWallet} from "@tp-lab/aptos-wallet-adapter";
import {TrustWallet} from "@trustwallet/aptos-wallet-adapter";
import {WelldoneWallet} from "@welldone-studio/aptos-wallet-adapter";
import {FewchaWallet} from "fewcha-plugin-wallet-adapter";
import {MSafeWalletAdapter} from "@msafe/aptos-wallet-adapter";
import {PetraWallet} from "petra-plugin-wallet-adapter";
import {IdentityConnectWallet} from "@identity-connect/wallet-adapter-plugin";
import {OKXWallet} from "@okwallet/aptos-wallet-adapter";
import {AptosConnectWalletPlugin} from "@aptos-connect/wallet-adapter-plugin";
import {Network} from "aptos";

const IdentityConnectId = "dd1466d6-1456-4320-a98d-dc677b4dac54";

// Statically initialize wallets that don't change for the network
const fewchaWallet = new FewchaWallet();
const martianWallet = new MartianWallet();
const msafeWallet = new MSafeWalletAdapter();
const okxWallet = new OKXWallet();
const openBlockWallet = new OpenBlockWallet();
const petraWallet = new PetraWallet();
const pontemWallet = new PontemWallet();
const riseWallet = new RiseWallet();
const tokenPocketWallet = new TokenPocketWallet();
const trustWallet = new TrustWallet();
const welldoneWallet = new WelldoneWallet();
const bitgetWallet = new BitgetWallet();

function walletsForNetwork(network: string) {
  // These are currently ordered by users on the site, and are subject to change
  const wallets: any[] = [
    petraWallet,
    okxWallet,
    martianWallet,
    pontemWallet,
    bitgetWallet,
    fewchaWallet,
    // Blocto supports Testnet/Mainnet for now.
    // new BloctoWallet({
    //   network: NetworkName.Testnet,
    //   bloctoAppId: "6d85f56e-5f2e-46cd-b5f2-5cf9695b4d46",
    // }),
    riseWallet,
    msafeWallet,
    openBlockWallet,
    tokenPocketWallet,
    trustWallet,
    welldoneWallet,
    new AptosConnectWalletPlugin({
      network: Network.TESTNET,
    }),
  ];
  if (network === NetworkName.Mainnet) {
    wallets.unshift(
      new IdentityConnectWallet(IdentityConnectId, {
        networkName: NetworkName.Mainnet as unknown as Network,
      }),
    );
  } else if (network === NetworkName.Testnet) {
    wallets.unshift(
      new IdentityConnectWallet(IdentityConnectId, {
        networkName: NetworkName.Testnet as unknown as Network,
      }),
    );
  } else if (network === NetworkName.Devnet) {
    wallets.unshift(
      new IdentityConnectWallet(IdentityConnectId, {
        networkName: NetworkName.Devnet as unknown as Network,
      }),
    );
    wallets.push(
      new AptosConnectWalletPlugin({
        network: Network.DEVNET,
      }),
    );
  }
  return wallets;
}

function ExplorerWalletAdapterProvider({children}: LayoutProps) {
  const [state] = useGlobalState();
  return (
    <AptosWalletAdapterProvider
      plugins={walletsForNetwork(state.network_name)}
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
              <Container maxWidth="xl" sx={{flexGrow: 4, paddingTop: "2rem"}}>
                {children}
              </Container>
              <Footer />
            </Box>
          </GraphqlClientProvider>
        </ExplorerWalletAdapterProvider>
      </GlobalStateProvider>
    </ProvideColorMode>
  );
}
