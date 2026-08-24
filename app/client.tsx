import {StartClient} from "@tanstack/react-start/client";
import {hydrateRoot} from "react-dom/client";
import {setupModuleErrorHandler} from "./utils/moduleErrorHandler";
import {scheduleExplorerServiceWorkerRegistration} from "./utils/registerServiceWorker";

// Set up global error handler for module loading failures
// This catches errors when cached HTML references old chunks after a deployment
setupModuleErrorHandler();

// FEAT-PWA-001: register after the hashed client bundle loads. Do not keep
// this in root `index.html` — that file is the Vite dev shell and must not
// be the production document.
scheduleExplorerServiceWorkerRegistration(window);

// Hydrate the entire document since the root component renders the full HTML structure
hydrateRoot(document, <StartClient />);
