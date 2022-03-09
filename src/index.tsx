import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import ExplorerRoutes from "./ExplorerRoutes";

import * as Sentry from "@sentry/react";
import {BrowserTracing} from "@sentry/tracing";

Sentry.init({
  dsn: "https://531160c88f78483491d129c02be9f774@o1162451.ingest.sentry.io/6249755",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ExplorerRoutes/>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);