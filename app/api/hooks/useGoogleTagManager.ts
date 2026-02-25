/**
 * Lightweight GTM integration replacing react-gtm-module.
 * Uses native script injection (~15 lines vs ~8KB package).
 */

// Extend Window to include dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

type GTMParams = {
  events: object;
};

let initialized = false;

export const initGTM = ({events}: GTMParams) => {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  const gtmId = import.meta.env.REACT_APP_GTM_ID || "GTM-ND9VTF4";

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": Date.now(),
    event: "gtm.js",
    ...events,
  });

  // Inject GTM script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
};

export interface DataLayerArgs {
  dataLayer: Record<string, unknown>;
}

export const sendToGTM = (dataLayer: DataLayerArgs): void => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(dataLayer.dataLayer);
};
