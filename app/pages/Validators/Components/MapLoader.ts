// This file provides a client-only loader for the Map component
// It uses a dynamic path construction to prevent Vite SSR from analyzing the import

export async function loadMapComponent() {
  // Only run in browser
  if (typeof window === "undefined") {
    return null;
  }

  // Import the client-only Map component that contains react-simple-maps
  // The .client.tsx file is never imported during SSR
  const modulePath = "./Map.client";
  const module = await import(/* @vite-ignore */ modulePath);
  return module.default;
}
