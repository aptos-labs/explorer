import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "react-query";
import ExplorerRoutes from "./ExplorerRoutes";
import ReactGA from "react-ga4";

ReactGA.initialize(process.env.GA_TRACKING_ID || "G-8XH7V50XK7");

// TODO: add Sentry

// inform the compiler of the existence of the window.aptos API
declare global {
  interface Window {
    aptos: any;
  }
}

const queryClient = new QueryClient();

// delay rendering the application until the window.onload event has fired when integrating with the window.aptos API
window.addEventListener("load", () => {
  ReactDOM.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ExplorerRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
    document.getElementById("root"),
  );
});
