/**
 * Module Error Handler
 *
 * Handles errors when dynamically imported modules fail to load.
 * This commonly happens after a deployment when:
 * 1. User has cached HTML referencing old chunk hashes
 * 2. New deployment removes old chunks
 * 3. Browser tries to load non-existent chunks
 *
 * The fix is to detect these errors and reload the page to get fresh assets.
 */

// Session storage key to prevent infinite reload loops
const RELOAD_KEY = "module-fetch-reload";
const RELOAD_TIMESTAMP_KEY = "module-fetch-reload-timestamp";
const MAX_RELOAD_ATTEMPTS = 2;
const RELOAD_WINDOW_MS = 30000; // 30 seconds window for reload attempts

// Common patterns for module loading failures
export const MODULE_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Loading chunk .+ failed/i,
  /ChunkLoadError/i,
  /Loading CSS chunk .+ failed/i,
  /Unable to preload CSS/i,
  /Failed to load module script/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
];

/**
 * Checks if an error is a module/chunk loading failure
 */
export function isModuleFetchError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  return MODULE_ERROR_PATTERNS.some((pattern) => pattern.test(errorMessage));
}

/**
 * Gets the current reload attempt count within the time window
 * Exported for testing purposes
 */
export function getReloadAttempts(): number {
  if (typeof window === "undefined") return 0;

  try {
    const timestamp = sessionStorage.getItem(RELOAD_TIMESTAMP_KEY);
    const attempts = sessionStorage.getItem(RELOAD_KEY);

    // If timestamp is outside the window, reset
    if (timestamp) {
      const elapsed = Date.now() - parseInt(timestamp, 10);
      if (elapsed > RELOAD_WINDOW_MS) {
        sessionStorage.removeItem(RELOAD_KEY);
        sessionStorage.removeItem(RELOAD_TIMESTAMP_KEY);
        return 0;
      }
    }

    return attempts ? parseInt(attempts, 10) : 0;
  } catch {
    // sessionStorage might be unavailable (private browsing, storage quota, etc.)
    // Return a high number to prevent reloads when we can't track them
    return MAX_RELOAD_ATTEMPTS;
  }
}

/**
 * Increments the reload attempt counter
 * Returns true if the increment was successful
 */
function incrementReloadAttempts(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const currentAttempts = getReloadAttempts();

    // If we got MAX_RELOAD_ATTEMPTS from a sessionStorage failure, don't proceed
    if (currentAttempts >= MAX_RELOAD_ATTEMPTS) {
      return false;
    }

    // Set timestamp on first attempt
    if (currentAttempts === 0) {
      sessionStorage.setItem(RELOAD_TIMESTAMP_KEY, Date.now().toString());
    }

    sessionStorage.setItem(RELOAD_KEY, (currentAttempts + 1).toString());

    // Verify the write was successful
    const verifyAttempts = sessionStorage.getItem(RELOAD_KEY);
    return verifyAttempts === (currentAttempts + 1).toString();
  } catch {
    // sessionStorage might be unavailable
    return false;
  }
}

/**
 * Clears the reload attempt counter (call on successful page load)
 */
export function clearReloadAttempts(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(RELOAD_KEY);
    sessionStorage.removeItem(RELOAD_TIMESTAMP_KEY);
  } catch {
    // sessionStorage might be unavailable
  }
}

/**
 * Force reload with cache busting to ensure fresh assets are loaded
 */
function forceReload(): void {
  // Add a cache-busting query parameter to ensure the browser fetches fresh assets
  const url = new URL(window.location.href);
  url.searchParams.set("_reload", Date.now().toString());
  window.location.replace(url.toString());
}

/**
 * Handles a module fetch error by reloading the page if appropriate
 * Returns true if a reload was triggered
 */
export function handleModuleFetchError(error: unknown): boolean {
  if (!isModuleFetchError(error)) return false;

  if (typeof window === "undefined") return false;

  const attempts = getReloadAttempts();

  // Prevent infinite reload loops
  if (attempts >= MAX_RELOAD_ATTEMPTS) {
    console.error(
      "[ModuleErrorHandler] Max reload attempts reached, not reloading",
      error,
    );
    return false;
  }

  // Only proceed with reload if we can successfully track the attempt
  // This prevents infinite reloads when sessionStorage is unavailable
  if (!incrementReloadAttempts()) {
    console.error(
      "[ModuleErrorHandler] Could not track reload attempt, not reloading to prevent infinite loop",
      error,
    );
    return false;
  }

  console.warn(
    `[ModuleErrorHandler] Module fetch error detected, reloading page (attempt ${attempts + 1}/${MAX_RELOAD_ATTEMPTS})`,
  );

  // Force reload with cache busting
  forceReload();
  return true;
}

/**
 * Sets up a global error handler for unhandled module fetch errors
 * Should be called once during app initialization
 */
export function setupModuleErrorHandler(): void {
  if (typeof window === "undefined") return;

  // Clear reload attempts on successful page load
  // Handle case where document is already loaded (common during hydration)
  if (document.readyState === "complete") {
    // Document already loaded, clear attempts after a short delay
    setTimeout(clearReloadAttempts, 1000);
  } else {
    // Document still loading, wait for load event
    window.addEventListener("load", () => {
      setTimeout(clearReloadAttempts, 1000);
    });
  }

  // Handle unhandled promise rejections (async import failures)
  window.addEventListener("unhandledrejection", (event) => {
    if (handleModuleFetchError(event.reason)) {
      event.preventDefault();
    }
  });

  // Handle regular errors (synchronous module loading failures)
  window.addEventListener("error", (event) => {
    if (handleModuleFetchError(event.error || event.message)) {
      event.preventDefault();
    }
  });
}
