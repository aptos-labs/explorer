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
  getRegistrations?: () => Promise<
    ReadonlyArray<ServiceWorkerRegistrationLike>
  >;
};

export type ServiceWorkerLogger = Pick<Console, "log">;

type ServiceWorkerVersionLike = {scriptURL: string};

export type ServiceWorkerRegistrationLike = {
  scope: string;
  active?: ServiceWorkerVersionLike | null;
  installing?: ServiceWorkerVersionLike | null;
  waiting?: ServiceWorkerVersionLike | null;
  unregister: () => Promise<boolean>;
};

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

/**
 * Development builds must not be controlled by the production service worker.
 * Remove an older Explorer registration left behind by a previous local run.
 */
export async function unregisterExplorerServiceWorkers(
  serviceWorker:
    | Pick<ServiceWorkerContainerLike, "getRegistrations">
    | null
    | undefined,
  logger: ServiceWorkerLogger = console,
): Promise<boolean> {
  if (!serviceWorker?.getRegistrations) return false;

  try {
    const registrations = await serviceWorker.getRegistrations();
    let unregistered = false;
    await Promise.all(
      registrations
        .filter((registration) => {
          const version =
            registration.active ??
            registration.waiting ??
            registration.installing;
          return version?.scriptURL.endsWith(EXPLORER_SERVICE_WORKER_URL);
        })
        .map(async (registration) => {
          if (await registration.unregister()) {
            unregistered = true;
            logger.log("SW unregistered:", registration.scope);
          }
        }),
    );
    return unregistered;
  } catch (error) {
    logger.log("SW unregister failed:", error);
    return false;
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
