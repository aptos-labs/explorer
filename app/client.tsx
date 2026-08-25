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
  void unregisterExplorerServiceWorkers(window.navigator.serviceWorker).then(
    (unregistered) => {
      // The current page can remain controlled until the next navigation.
      // Reload once after removing the old registration so dev immediately
      // runs without production cache interception.
      if (unregistered) window.location.reload();
    },
  );
}

// Hydrate the entire document since the root component renders the full HTML structure
hydrateRoot(document, <StartClient />);
