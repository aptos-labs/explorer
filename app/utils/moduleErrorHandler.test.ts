/**
 * @vitest-environment jsdom
 */
import {describe, it, expect, beforeEach, afterEach, vi} from "vitest";

describe("moduleErrorHandler", () => {
  // We need to dynamically import the module after setting up mocks
  let isModuleFetchError: typeof import("./moduleErrorHandler").isModuleFetchError;
  let clearReloadAttempts: typeof import("./moduleErrorHandler").clearReloadAttempts;
  let getReloadAttempts: typeof import("./moduleErrorHandler").getReloadAttempts;
  let handleModuleFetchError: typeof import("./moduleErrorHandler").handleModuleFetchError;
  let forceReload: typeof import("./moduleErrorHandler").forceReload;
  let MODULE_ERROR_PATTERNS: typeof import("./moduleErrorHandler").MODULE_ERROR_PATTERNS;

  // Track location.replace calls
  const replaceMock = vi.fn();

  beforeEach(async () => {
    // Clear sessionStorage
    sessionStorage.clear();

    // Mock location.replace
    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        href: "https://explorer.aptoslabs.com/",
        replace: replaceMock,
      },
      writable: true,
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Reset module cache and reimport
    vi.resetModules();
    const module = await import("./moduleErrorHandler");
    isModuleFetchError = module.isModuleFetchError;
    clearReloadAttempts = module.clearReloadAttempts;
    getReloadAttempts = module.getReloadAttempts;
    handleModuleFetchError = module.handleModuleFetchError;
    forceReload = module.forceReload;
    MODULE_ERROR_PATTERNS = module.MODULE_ERROR_PATTERNS;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe("isModuleFetchError", () => {
    it("returns false for null/undefined errors", () => {
      expect(isModuleFetchError(null)).toBe(false);
      expect(isModuleFetchError(undefined)).toBe(false);
      expect(isModuleFetchError("")).toBe(false);
    });

    it("detects module fetch errors from Error objects", () => {
      const error = new Error(
        "Failed to fetch dynamically imported module: https://example.com/chunk.js",
      );
      expect(isModuleFetchError(error)).toBe(true);
    });

    it("detects module fetch errors from string messages", () => {
      expect(
        isModuleFetchError(
          "Failed to fetch dynamically imported module: https://example.com",
        ),
      ).toBe(true);
    });

    it("detects various chunk loading error patterns", () => {
      const errorMessages = [
        "Loading chunk 123 failed",
        "ChunkLoadError: Loading chunk vendor failed",
        "Loading CSS chunk main failed",
        "Unable to preload CSS for /assets/main.css",
        "Failed to load module script: https://example.com/module.js",
        "error loading dynamically imported module",
        "Importing a module script failed",
      ];

      for (const message of errorMessages) {
        expect(isModuleFetchError(new Error(message))).toBe(true);
        expect(isModuleFetchError(message)).toBe(true);
      }
    });

    it("returns false for unrelated errors", () => {
      expect(isModuleFetchError(new Error("Network error"))).toBe(false);
      expect(isModuleFetchError(new Error("TypeError: x is undefined"))).toBe(
        false,
      );
      expect(isModuleFetchError("Some random error")).toBe(false);
    });

    it("returns false for objects without message property", () => {
      expect(isModuleFetchError({code: 500})).toBe(false);
      expect(isModuleFetchError(123)).toBe(false);
    });
  });

  describe("MODULE_ERROR_PATTERNS", () => {
    it("exports the error patterns for external use", () => {
      expect(Array.isArray(MODULE_ERROR_PATTERNS)).toBe(true);
      expect(MODULE_ERROR_PATTERNS.length).toBeGreaterThan(0);
      expect(MODULE_ERROR_PATTERNS[0]).toBeInstanceOf(RegExp);
    });
  });

  describe("clearReloadAttempts", () => {
    it("removes reload tracking from sessionStorage", () => {
      sessionStorage.setItem("module-fetch-reload", "1");
      sessionStorage.setItem(
        "module-fetch-reload-timestamp",
        Date.now().toString(),
      );

      clearReloadAttempts();

      expect(sessionStorage.getItem("module-fetch-reload")).toBeNull();
      expect(
        sessionStorage.getItem("module-fetch-reload-timestamp"),
      ).toBeNull();
    });
  });

  describe("getReloadAttempts", () => {
    it("returns 0 when no attempts recorded", () => {
      expect(getReloadAttempts()).toBe(0);
    });

    it("returns the stored attempt count", () => {
      sessionStorage.setItem("module-fetch-reload", "2");
      sessionStorage.setItem(
        "module-fetch-reload-timestamp",
        Date.now().toString(),
      );

      expect(getReloadAttempts()).toBe(2);
    });

    it("resets attempts when timestamp is outside the 30s window", () => {
      const oldTimestamp = Date.now() - 31000; // 31 seconds ago
      sessionStorage.setItem("module-fetch-reload", "2");
      sessionStorage.setItem(
        "module-fetch-reload-timestamp",
        oldTimestamp.toString(),
      );

      expect(getReloadAttempts()).toBe(0);
      expect(sessionStorage.getItem("module-fetch-reload")).toBeNull();
      expect(
        sessionStorage.getItem("module-fetch-reload-timestamp"),
      ).toBeNull();
    });

    it("handles malformed data gracefully", () => {
      sessionStorage.setItem("module-fetch-reload", "invalid");
      sessionStorage.setItem("module-fetch-reload-timestamp", "also-invalid");

      // Should return 0 for invalid attempt count and reset due to invalid timestamp
      expect(getReloadAttempts()).toBe(0);
    });
  });

  describe("forceReload", () => {
    it("calls location.replace with cache-busting parameter", () => {
      forceReload();

      expect(replaceMock).toHaveBeenCalled();
      const calledUrl = replaceMock.mock.calls[0][0];
      expect(calledUrl).toContain("_reload=");
      // Verify the cache buster contains both timestamp and random component
      const urlObj = new URL(calledUrl);
      const reloadParam = urlObj.searchParams.get("_reload");
      expect(reloadParam).toMatch(/^\d+-[0-9a-f]+$/);
    });
  });

  describe("handleModuleFetchError", () => {
    it("returns false for non-module errors", () => {
      expect(handleModuleFetchError(new Error("Regular error"))).toBe(false);
      expect(replaceMock).not.toHaveBeenCalled();
    });

    it("schedules reload for module fetch errors", async () => {
      vi.useFakeTimers();

      const error = new Error("Failed to fetch dynamically imported module");
      const result = handleModuleFetchError(error);

      expect(result).toBe(true);

      // Fast-forward timers to trigger the delayed reload
      await vi.runAllTimersAsync();

      expect(replaceMock).toHaveBeenCalled();
      // Check cache-busting parameter was added
      const calledUrl = replaceMock.mock.calls[0][0];
      expect(calledUrl).toContain("_reload=");

      vi.useRealTimers();
    });

    it("increments reload attempts on each call", () => {
      const error = new Error("Failed to fetch dynamically imported module");

      handleModuleFetchError(error);

      expect(sessionStorage.getItem("module-fetch-reload")).toBe("1");
      expect(
        sessionStorage.getItem("module-fetch-reload-timestamp"),
      ).not.toBeNull();
    });

    it("stops reloading after MAX_RELOAD_ATTEMPTS", () => {
      sessionStorage.setItem("module-fetch-reload", "2"); // MAX_RELOAD_ATTEMPTS
      sessionStorage.setItem(
        "module-fetch-reload-timestamp",
        Date.now().toString(),
      );

      const error = new Error("Failed to fetch dynamically imported module");
      const result = handleModuleFetchError(error);

      expect(result).toBe(false);
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });
});
