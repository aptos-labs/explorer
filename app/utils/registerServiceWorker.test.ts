import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it, vi} from "vitest";
import {
  EXPLORER_SERVICE_WORKER_SCOPE,
  EXPLORER_SERVICE_WORKER_URL,
  isExplorerServiceWorker,
  registerExplorerServiceWorker,
  scheduleExplorerServiceWorkerRegistration,
  unregisterExplorerServiceWorkers,
} from "./registerServiceWorker";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

describe("registerExplorerServiceWorker", () => {
  // Covers FEAT-PWA-001
  it("registers /sw.js at the root scope and logs it", async () => {
    const register = vi
      .fn()
      .mockResolvedValue({scope: "https://explorer.aptoslabs.com/"});
    const log = vi.fn();

    await registerExplorerServiceWorker({register}, {log});

    expect(register).toHaveBeenCalledWith(EXPLORER_SERVICE_WORKER_URL, {
      scope: EXPLORER_SERVICE_WORKER_SCOPE,
    });
    expect(log).toHaveBeenCalledWith(
      "SW registered:",
      "https://explorer.aptoslabs.com/",
    );
  });

  it("swallows registration failures", async () => {
    const error = new Error("denied");
    const log = vi.fn();

    await expect(
      registerExplorerServiceWorker(
        {register: vi.fn().mockRejectedValue(error)},
        {log},
      ),
    ).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith("SW registration failed:", error);
  });

  it("is a no-op where service workers are unavailable", async () => {
    const log = vi.fn();
    await registerExplorerServiceWorker(undefined, {log});
    expect(log).not.toHaveBeenCalled();
  });
});

describe("scheduleExplorerServiceWorkerRegistration", () => {
  // Covers FEAT-PWA-001
  it("waits for the load event before registering", async () => {
    const register = vi.fn().mockResolvedValue({scope: "https://example/"});
    const listeners = new Map<string, () => void>();

    scheduleExplorerServiceWorkerRegistration(
      {
        addEventListener: (type, listener) => listeners.set(type, listener),
        navigator: {serviceWorker: {register}},
      },
      {log: vi.fn()},
    );

    expect(register).not.toHaveBeenCalled();
    listeners.get("load")?.();
    await vi.waitFor(() => expect(register).toHaveBeenCalledOnce());
  });

  it("registers immediately when the document already loaded", async () => {
    const register = vi.fn().mockResolvedValue({scope: "https://example/"});
    const addEventListener = vi.fn();

    scheduleExplorerServiceWorkerRegistration(
      {
        addEventListener,
        navigator: {serviceWorker: {register}},
        document: {readyState: "complete"},
      },
      {log: vi.fn()},
    );

    expect(addEventListener).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(register).toHaveBeenCalledOnce());
  });

  it("does nothing when the target has no service worker container", () => {
    const addEventListener = vi.fn();
    scheduleExplorerServiceWorkerRegistration(
      {addEventListener},
      {log: vi.fn()},
    );
    expect(addEventListener).not.toHaveBeenCalled();
  });
});

describe("unregisterExplorerServiceWorkers", () => {
  // Covers FEAT-PWA-001
  it("unregisters only Explorer service workers", async () => {
    const unregisterExplorer = vi.fn().mockResolvedValue(true);
    const unregisterOther = vi.fn().mockResolvedValue(true);
    const log = vi.fn();

    await unregisterExplorerServiceWorkers(
      {
        getRegistrations: vi.fn().mockResolvedValue([
          {
            scope: "http://localhost:3000/",
            active: {scriptURL: "http://localhost:3000/sw.js"},
            unregister: unregisterExplorer,
          },
          {
            scope: "http://localhost:3000/other/",
            active: {scriptURL: "http://localhost:3000/other-sw.js"},
            unregister: unregisterOther,
          },
        ]),
      },
      {log},
    );

    expect(unregisterExplorer).toHaveBeenCalledOnce();
    expect(unregisterOther).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      "SW unregistered:",
      "http://localhost:3000/",
    );
  });
});

describe("isExplorerServiceWorker", () => {
  // Covers FEAT-PWA-001
  it("recognizes only the Explorer worker", () => {
    expect(
      isExplorerServiceWorker({scriptURL: "http://localhost:3030/sw.js"}),
    ).toBe(true);
    expect(
      isExplorerServiceWorker({scriptURL: "http://localhost:3030/other-sw.js"}),
    ).toBe(false);
  });
});

describe("FEAT-PWA-001 — registration site", () => {
  it("registers from the hydrated client entry", () => {
    const clientEntry = readFileSync(join(repoRoot, "app/client.tsx"), "utf8");
    expect(clientEntry).toContain(
      "scheduleExplorerServiceWorkerRegistration(window)",
    );
    expect(clientEntry).toContain("await unregisterExplorerServiceWorkers");
    expect(clientEntry).toContain("hydrateApp();");
  });
});
