import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import ExplorerRoutes from "./ExplorerRoutes";
import {StatsigProvider} from "statsig-react";

import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";

import ReactGA from "react-ga4";
import {initGTM} from "./api/hooks/useGoogleTagManager";
import {GTMEvents} from "./dataConstants";

initGTM({
  events: {
    walletConnection: GTMEvents.WALLET_CONNECTION,
    searchStats: GTMEvents.SEARCH_STATS,
  },
});

ReactGA.initialize(import.meta.env.GA_TRACKING_ID || "G-VS7KJG61TM");

// TODO: redirect to the new explorer domain on the domain host
// if (window.location.origin.includes("explorer.testnet.suzuka.movementlabs.xyz")) {
//   const new_location = window.location.href.replace(
//     "explorer.testnet.suzuka.movementlabs.xyz",
//     "explorer.movementlabs.xyz",
//   );
//   window.location.replace(new_location);
// }

Sentry.init({
  dsn: "https://531160c88f78483491d129c02be9f774@o1162451.ingest.sentry.io/6249755",
  integrations: [new BrowserTracing()],
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,

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

ReactDOM.render(
  <React.StrictMode>
    <StatsigProvider
      sdkKey={
        import.meta.env.REACT_APP_STATSIG_SDK_KEY ||
        "client-gQ2Zhz3hNYRf6CSVaczkQcZfK0yUBv5ln42yCDzTwbr"
      }
      waitForInitialization={false}
      options={{
        environment: {tier: import.meta.env.MODE},
      }}
      user={{}}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ExplorerRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </StatsigProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
