import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import ExplorerRoutes from "./ExplorerRoutes";

// import * as Sentry from "@sentry/react";
// import {BrowserTracing} from "@sentry/tracing";

import {AptosClient} from "aptos";
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

// Sentry.init({
//   dsn: "https://8f71927547f8ae9768d7f7baf1be7cde@o4508005503991808.ingest.us.sentry.io/4508005506547712",
//   integrations: [new BrowserTracing()],
//   environment: import.meta.env.MODE,
//   enabled: import.meta.env.PROD,

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 0.5,
// });

// inform the compiler of the existence of the window.aptos API
declare global {
  interface Window {
    aptos: AptosClient;
  }
}

const queryClient = new QueryClient();

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ExplorerRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
