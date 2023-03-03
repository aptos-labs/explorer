import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";
import ExplorerRoutes from "./ExplorerRoutes";
import {AptosWalletAdapterProvider} from "@aptos-labs/wallet-adapter-react";
import {PetraWallet} from "petra-plugin-wallet-adapter";
import {PontemWallet} from "@pontem/wallet-adapter-plugin";
import {MartianWallet} from "@martianwallet/aptos-wallet-adapter";
import {RiseWallet} from "@rise-wallet/wallet-adapter";
import {SpikaWallet} from "@spika/aptos-plugin";
import {FewchaWallet} from "fewcha-plugin-wallet-adapter";

import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";

import ReactGA from "react-ga4";
import {initGTM} from "./api/hooks/useGoogleTagManager";
import {GTMEvents} from "./constants";

initGTM({
  events: {
    walletConnection: GTMEvents.WALLET_CONNECTION,
    searchStats: GTMEvents.SEARCH_STATS,
  },
});

ReactGA.initialize(process.env.GA_TRACKING_ID || "G-8XH7V50XK7");

// TODO: redirect to the new explorer domain on the domain host
if (window.location.origin.includes("explorer.devnet.aptos.dev")) {
  const new_location = window.location.href.replace(
    "explorer.devnet.aptos.dev",
    "explorer.aptoslabs.com",
  );
  window.location.replace(new_location);
}

Sentry.init({
  dsn: "https://531160c88f78483491d129c02be9f774@o1162451.ingest.sentry.io/6249755",
  integrations: [new BrowserTracing()],
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV == "production",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
});

// inform the compiler of the existence of the window.aptos API
declare global {
  interface Window {
    aptos: any;
  }
}

const queryClient = new QueryClient();

const wallets = [
  new PetraWallet(),
  new PontemWallet(),
  new MartianWallet(),
  new FewchaWallet(),
  new RiseWallet(),
  new SpikaWallet(),
];

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
        <BrowserRouter>
          <ExplorerRoutes />
        </BrowserRouter>
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
