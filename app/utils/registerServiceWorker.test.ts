import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it, vi} from "vitest";
import {
  EXPLORER_SERVICE_WORKER_SCOPE,
  EXPLORER_SERVICE_WORKER_URL,
  registerExplorerServiceWorker,
  scheduleExplorerServiceWorkerRegistration,
} from "./registerServiceWorker";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

describe("registerExplorerServiceWorker", () => {
  // Covers FEAT-PWA-001 — SW registration lives in the client bundle
  it("registers /sw.js at scope / and logs the scope", async () => {
    const register = vi.fn().mockResolvedValue({
      scope: "https://explorer.aptoslabs.com/",
    });
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

  it("logs registration failure without throwing", async () => {
    const err = new Error("denied");
    const register = vi.fn().mockRejectedValue(err);
    const log = vi.fn();

    await expect(
      registerExplorerServiceWorker({register}, {log}),
    ).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith("SW registration failed:", err);
  });

  it("is a no-op when serviceWorker is missing", async () => {
    const log = vi.fn();
    await registerExplorerServiceWorker(undefined, {log});
    expect(log).not.toHaveBeenCalled();
  });
});

describe("scheduleExplorerServiceWorkerRegistration", () => {
  it("registers on window load", async () => {
    const register = vi.fn().mockResolvedValue({scope: "https://example/"});
    const listeners = new Map<string, () => void>();
    const target = {
      addEventListener: (type: "load", listener: () => void) => {
        listeners.set(type, listener);
      },
      navigator: {serviceWorker: {register}},
    };

    scheduleExplorerServiceWorkerRegistration(target, {log: vi.fn()});
    expect(register).not.toHaveBeenCalled();
    listeners.get("load")?.();
    await vi.waitFor(() => {
      expect(register).toHaveBeenCalledOnce();
    });
  });

  it("registers immediately when the document is already loaded", async () => {
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
    await vi.waitFor(() => {
      expect(register).toHaveBeenCalledOnce();
    });
  });
});

describe("FEAT-PWA-001 — registration site", () => {
  it("does not register the service worker from the Vite HTML shell", () => {
    const html = readFileSync(join(repoRoot, "index.html"), "utf8");
    expect(html).not.toMatch(/serviceWorker/);
    expect(html).toContain("/app/client.tsx");
  });

  it("registers from the hashed client entry", () => {
    const source = readFileSync(join(repoRoot, "app/client.tsx"), "utf8");
    expect(source).toContain("scheduleExplorerServiceWorkerRegistration");
  });
});
