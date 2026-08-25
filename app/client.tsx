import {StartClient} from "@tanstack/react-start/client";
import {hydrateRoot} from "react-dom/client";
import {setupModuleErrorHandler} from "./utils/moduleErrorHandler";
import {
  scheduleExplorerServiceWorkerRegistration,
  unregisterExplorerServiceWorkers,
} from "./utils/registerServiceWorker";

// Set up global error handler for module loading failures
// This catches errors when cached HTML references old chunks after a deployment
setupModuleErrorHandler();

if (import.meta.env.PROD) {
  scheduleExplorerServiceWorkerRegistration(window);
} else {
  void unregisterExplorerServiceWorkers(window.navigator.serviceWorker);
}

// Hydrate the entire document since the root component renders the full HTML structure
hydrateRoot(document, <StartClient />);
