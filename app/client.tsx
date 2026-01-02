import {hydrateRoot} from "react-dom/client";
import {StartClient} from "@tanstack/react-start/client";

// Hydrate the entire document since the root component renders the full HTML structure
hydrateRoot(document, <StartClient />);
