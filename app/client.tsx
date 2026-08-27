import {StartClient} from "@tanstack/react-start/client";
import {hydrateRoot} from "react-dom/client";
import {setupModuleErrorHandler} from "./utils/moduleErrorHandler";
import {
  isExplorerServiceWorker,
  scheduleExplorerServiceWorkerRegistration,
  unregisterExplorerServiceWorkers,
} from "./utils/registerServiceWorker";

// Set up global error handler for module loading failures
// This catches errors when cached HTML references old chunks after a deployment
setupModuleErrorHandler();

function hydrateApp() {
  // Hydrate the entire document since the root component renders the full HTML
  // structure.
  hydrateRoot(document, <StartClient />);
}

if (import.meta.env.PROD) {
  scheduleExplorerServiceWorkerRegistration(window);
  hydrateApp();
} else {
  void startDevelopmentClient();
}

async function startDevelopmentClient() {
  const serviceWorker = window.navigator.serviceWorker;
  const wasControlledByExplorer = isExplorerServiceWorker(
    serviceWorker?.controller,
  );
  const unregistered = await unregisterExplorerServiceWorkers(serviceWorker);

  // A page controlled by an older service worker may have already received
  // mismatched Vite dependency chunks. Release it and reload before React
  // hydrates, rather than allowing a duplicate React runtime to render first.
  if (wasControlledByExplorer || unregistered) {
    window.location.reload();
    return;
  }

  hydrateApp();
}
