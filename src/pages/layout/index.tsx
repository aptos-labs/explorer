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
import {BloctoWallet} from "@blocto/aptos-wallet-adapter-plugin";
import {MartianWallet} from "@martianwallet/aptos-wallet-adapter";
import {NightlyWallet} from "@nightlylabs/aptos-wallet-adapter-plugin";
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

const IdentityConnectId = "99d260d0-c69d-4c15-965f-f6f9b7b00102";
const MSafeWallet = new MSafeWalletAdapter();

function walletsForNetwork(network: string) {
  const wallets: any[] = [
    new PetraWallet(),
    new PontemWallet(),
    new MartianWallet(),
    new FewchaWallet(),
    new RiseWallet(),
    MSafeWallet,
    new NightlyWallet(),
    new OpenBlockWallet(),
    new TokenPocketWallet(),
    new TrustWallet(),
    new WelldoneWallet(),
    // Blocto supports Testnet/Mainnet for now.
    new BloctoWallet({
      network: NetworkName.Testnet,
      bloctoAppId: "6d85f56e-5f2e-46cd-b5f2-5cf9695b4d46",
    }),
  ];
  if (network === NetworkName.Mainnet) {
    wallets.unshift(
      new IdentityConnectWallet(IdentityConnectId, {
        networkName: NetworkName.Mainnet,
      }),
    );
  } else if (network === NetworkName.Testnet) {
    wallets.unshift(
      new IdentityConnectWallet(IdentityConnectId, {
        networkName: NetworkName.Testnet,
      }),
    );
  } else if (network === NetworkName.Devnet) {
    wallets.unshift(
      new IdentityConnectWallet(IdentityConnectId, {
        networkName: NetworkName.Devnet,
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
