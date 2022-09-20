import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";
import ExplorerRoutes from "./ExplorerRoutes";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";

import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";

import ReactGA from "react-ga4";

ReactGA.initialize(process.env.GA_TRACKING_ID || "G-8XH7V50XK7");

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

const graphqlClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://profound-koala-32.hasura.app/v1/graphql",
    headers: {
      "x-hasura-admin-secret":
        "qGxSwGGtXDFExIFbdoPIregFBjbmbUc3qjwV87z70cGsaGiyXQzNu2ivrDfcRRSn",
    },
  }),
  cache: new InMemoryCache(),
});

// delay rendering the application until the window.onload event has fired when integrating with the window.aptos API
window.addEventListener("load", () => {
  ReactDOM.render(
    <React.StrictMode>
      <ApolloProvider client={graphqlClient}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ExplorerRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </ApolloProvider>
    </React.StrictMode>,
    document.getElementById("root"),
  );
});
