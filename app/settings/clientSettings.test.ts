import {describe, expect, it} from "vitest";
import {
  defaultExplorerClientSettings,
  EXPLORER_SETTINGS_STORAGE_KEY,
  loadExplorerClientSettings,
  normalizeGeomiDevApiKeyOverride,
  persistExplorerClientSettings,
  sanitizeExplorerClientSettings,
} from "./clientSettings";

function createStorageMock(initialValue?: string) {
  const storage = new Map<string, string>();

  if (initialValue !== undefined) {
    storage.set(EXPLORER_SETTINGS_STORAGE_KEY, initialValue);
  }

  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
  };
}

describe("clientSettings", () => {
  describe("normalizeGeomiDevApiKeyOverride", () => {
    it("trims surrounding whitespace", () => {
      expect(normalizeGeomiDevApiKeyOverride("  test-key  ")).toBe("test-key");
    });

    it("returns an empty string for nullish values", () => {
      expect(normalizeGeomiDevApiKeyOverride(null)).toBe("");
      expect(normalizeGeomiDevApiKeyOverride(undefined)).toBe("");
    });
  });

  describe("sanitizeExplorerClientSettings", () => {
    it("normalizes the geomi override value", () => {
      expect(
        sanitizeExplorerClientSettings({
          geomiDevApiKeyOverride: "  override-key  ",
        }),
      ).toEqual({
        geomiDevApiKeyOverride: "override-key",
      });
    });

    it("falls back to the default settings shape", () => {
      expect(sanitizeExplorerClientSettings(undefined)).toEqual(
        defaultExplorerClientSettings,
      );
    });
  });

  describe("loadExplorerClientSettings", () => {
    it("returns defaults for malformed storage values", () => {
      const storage = createStorageMock("not-json");
      expect(loadExplorerClientSettings(storage)).toEqual(
        defaultExplorerClientSettings,
      );
    });

    it("reads and sanitizes persisted settings", () => {
      const storage = createStorageMock(
        JSON.stringify({
          geomiDevApiKeyOverride: "  saved-key  ",
        }),
      );

      expect(loadExplorerClientSettings(storage)).toEqual({
        geomiDevApiKeyOverride: "saved-key",
      });
    });
  });

  describe("persistExplorerClientSettings", () => {
    it("writes normalized settings to storage", () => {
      const storage = createStorageMock();

      persistExplorerClientSettings(
        {geomiDevApiKeyOverride: "  persisted-key  "},
        storage,
      );

      expect(loadExplorerClientSettings(storage)).toEqual({
        geomiDevApiKeyOverride: "persisted-key",
      });
    });

    it("fails gracefully when storage writes throw", () => {
      const storage = {
        getItem: () => null,
        setItem: () => {
          throw new Error("storage unavailable");
        },
      };

      expect(() =>
        persistExplorerClientSettings(
          {geomiDevApiKeyOverride: "persisted-key"},
          storage,
        ),
      ).not.toThrow();
    });
  });
});
