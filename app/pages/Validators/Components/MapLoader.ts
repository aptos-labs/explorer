// This file provides a client-only loader for the Map component
// It uses a dynamic path construction to prevent Vite SSR from analyzing the import

export async function loadMapComponent() {
  // Only run in browser
  if (typeof window === "undefined") {
    return null;
  }

  // Construct the path dynamically to prevent static analysis
  const modulePath = "./Map";
  const module = await import(/* @vite-ignore */ modulePath);
  return module.default;
}
