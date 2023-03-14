import React, {lazy, ReactNode} from "react";
import ReactDOM from "react-dom";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";

import {AptosWalletAdapterProvider} from "@aptos-labs/wallet-adapter-react";
import {PetraWallet} from "petra-plugin-wallet-adapter";
import {PontemWallet} from "@pontem/wallet-adapter-plugin";
import {MartianWallet} from "@martianwallet/aptos-wallet-adapter";
import {RiseWallet} from "@rise-wallet/wallet-adapter";
import {SpikaWallet} from "@spika/aptos-plugin";
import {FewchaWallet} from "fewcha-plugin-wallet-adapter";
import {StatsigProvider} from "statsig-react";

import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";

import {
  Helmet,
  HelmetProvider as ReactHelmetProvider,
} from "react-helmet-async";
import {initGTM} from "./api/hooks/useGoogleTagManager";
import {GTMEvents} from "./dataConstants";

import ExplorerRoutes from "./ExplorerRoutes";

interface Props {
  children: ReactNode;
}

const HelmetProvider = ({children}: Props) => {
  React.useEffect(() => {
    initGTM({
      events: {
        walletConnection: GTMEvents.WALLET_CONNECTION,
        searchStats: GTMEvents.SEARCH_STATS,
      },
    });
  }, []);

  return <ReactHelmetProvider>{children}</ReactHelmetProvider>;
};

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

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

root.render(
  <HelmetProvider>
    <React.StrictMode>
      <StatsigProvider
        sdkKey={process.env.REACT_APP_STATSIG_SDK_KEY || ""}
        waitForInitialization={true}
        options={{
          environment: {tier: "production"},
        }}
        user={{}}
      >
        <QueryClientProvider client={queryClient}>
          <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
            <BrowserRouter>
              <Helmet>
                {/* Custom Fonts from Adobe Typekit. Please enter license key within the
                REACT_APP_ADOBE_FONTS .env variable. 

                LFT Etica Mono - Regular
                Apparat - Regular, Italic, Semibold, Semibold Italic
                Apparat SemiCond - Bold, Semibold

                TODO: Integrate fonts directly via @font-face */}
                <link
                  href={`https://use.typekit.net/${process.env.REACT_APP_ADOBE_FONTS}.css`}
                  rel="stylesheet"
                  type="text/css"
                />

                {/* Hotjar Tracking Code for https://explorer.aptoslabs.com/ */}
                <script>
                  {`
                (function(h,o,t,j,a,r){
                  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                  h._hjSettings={hjid:3271013,hjsv:6};
                  a=o.getElementsByTagName('head')[0];
                  r=o.createElement('script');r.async=1;
                  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
              `}
                </script>

                {/* Google Analytics Code */}
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING_ID}`}
                />
                <script>
                  {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${process.env.GA_TRACKING_ID}');
            `}
                </script>
              </Helmet>
              <ExplorerRoutes />
            </BrowserRouter>
          </AptosWalletAdapterProvider>
        </QueryClientProvider>
      </StatsigProvider>
    </React.StrictMode>
  </HelmetProvider>,
);
