/**
 * FEAT-PWA-001 service worker registration.
 *
 * Production HTML is SSR from `app/routes/__root.tsx`, so an inline script in a
 * root `index.html` never reaches the browser. Registration has to run from the
 * hydrated client bundle instead.
 */
export const EXPLORER_SERVICE_WORKER_URL = "/sw.js";
export const EXPLORER_SERVICE_WORKER_SCOPE = "/";

export type ServiceWorkerContainerLike = {
  register: (
    scriptURL: string,
    options?: {scope?: string},
  ) => Promise<{scope: string}>;
};

export type ServiceWorkerLogger = Pick<Console, "log">;

export async function registerExplorerServiceWorker(
  serviceWorker: ServiceWorkerContainerLike | null | undefined,
  logger: ServiceWorkerLogger = console,
): Promise<void> {
  if (!serviceWorker) return;
  try {
    const registration = await serviceWorker.register(
      EXPLORER_SERVICE_WORKER_URL,
      {scope: EXPLORER_SERVICE_WORKER_SCOPE},
    );
    logger.log("SW registered:", registration.scope);
  } catch (error) {
    logger.log("SW registration failed:", error);
  }
}

type RegistrationTarget = {
  addEventListener: (type: "load", listener: () => void) => void;
  navigator?: {serviceWorker?: ServiceWorkerContainerLike};
  document?: {readyState?: string};
};

/**
 * Defer registration to `load` so the service worker never competes with
 * hydration for bandwidth. Registers immediately when hydration already
 * finished after the load event.
 */
export function scheduleExplorerServiceWorkerRegistration(
  target: RegistrationTarget | null | undefined,
  logger: ServiceWorkerLogger = console,
): void {
  const serviceWorker = target?.navigator?.serviceWorker;
  if (!target || !serviceWorker) return;
  const run = () => {
    void registerExplorerServiceWorker(serviceWorker, logger);
  };
  if (target.document?.readyState === "complete") {
    run();
    return;
  }
  target.addEventListener("load", run);
}
