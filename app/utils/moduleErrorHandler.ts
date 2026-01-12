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

  // Common patterns for module loading failures
  const moduleErrorPatterns = [
    /Failed to fetch dynamically imported module/i,
    /Loading chunk .+ failed/i,
    /ChunkLoadError/i,
    /Loading CSS chunk .+ failed/i,
    /Unable to preload CSS/i,
    /Failed to load module script/i,
    /error loading dynamically imported module/i,
    /Importing a module script failed/i,
  ];

  return moduleErrorPatterns.some((pattern) => pattern.test(errorMessage));
}

/**
 * Gets the current reload attempt count within the time window
 */
function getReloadAttempts(): number {
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
    // sessionStorage might be unavailable
    return 0;
  }
}

/**
 * Increments the reload attempt counter
 */
function incrementReloadAttempts(): void {
  if (typeof window === "undefined") return;

  try {
    const currentAttempts = getReloadAttempts();

    // Set timestamp on first attempt
    if (currentAttempts === 0) {
      sessionStorage.setItem(RELOAD_TIMESTAMP_KEY, Date.now().toString());
    }

    sessionStorage.setItem(RELOAD_KEY, (currentAttempts + 1).toString());
  } catch {
    // sessionStorage might be unavailable
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

  console.warn(
    `[ModuleErrorHandler] Module fetch error detected, reloading page (attempt ${attempts + 1}/${MAX_RELOAD_ATTEMPTS})`,
  );

  incrementReloadAttempts();

  // Force a hard reload to bypass browser cache
  window.location.reload();
  return true;
}

/**
 * Sets up a global error handler for unhandled module fetch errors
 * Should be called once during app initialization
 */
export function setupModuleErrorHandler(): void {
  if (typeof window === "undefined") return;

  // Clear reload attempts on successful page load
  // Use a small delay to ensure the page has fully loaded
  window.addEventListener("load", () => {
    setTimeout(clearReloadAttempts, 1000);
  });

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
