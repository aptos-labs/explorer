/**
 * Registers `public/sw.js` for FEAT-PWA-001.
 *
 * Production HTML is SSR (`app/routes/__root.tsx`); the Vite `index.html`
 * shell must not ship, so registration lives in the client bundle instead
 * of an inline script in that shell.
 */
export const EXPLORER_SERVICE_WORKER_URL = "/sw.js";
export const EXPLORER_SERVICE_WORKER_SCOPE = "/";

export type ServiceWorkerContainerLike = {
  register: (
    scriptURL: string,
    options?: {scope?: string},
  ) => Promise<{scope: string}>;
};

export type ServiceWorkerLogger = {
  log: (...args: unknown[]) => void;
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

type RegistrationTarget = {
  addEventListener: (type: "load", listener: () => void) => void;
  navigator?: {serviceWorker?: ServiceWorkerContainerLike};
  document?: {readyState?: string};
};

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
