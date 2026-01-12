import {hydrateRoot} from "react-dom/client";
import {StartClient} from "@tanstack/react-start/client";
import {setupModuleErrorHandler} from "./utils/moduleErrorHandler";

// Set up global error handler for module loading failures
// This catches errors when cached HTML references old chunks after a deployment
setupModuleErrorHandler();

// Hydrate the entire document since the root component renders the full HTML structure
hydrateRoot(document, <StartClient />);
