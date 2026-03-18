import {describe, expect, it} from "vitest";
import {
  clearExplorerClientSettings,
  defaultExplorerClientSettings,
  EXPLORER_SETTINGS_STORAGE_KEY,
  loadExplorerClientSettings,
  normalizeGeomiDevApiKeyOverride,
  persistExplorerClientSettings,
  sanitizeExplorerClientSettings,
} from "./clientSettings";

function createStorageMock(initialValue?: string, shouldThrowOnWrite = false) {
  const storage = new Map<string, string>();

  if (initialValue !== undefined) {
    storage.set(EXPLORER_SETTINGS_STORAGE_KEY, initialValue);
  }

  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (shouldThrowOnWrite) {
        throw new Error("storage unavailable");
      }

      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
  };
}

function createStorageCollection({
  localValue,
  sessionValue,
  shouldThrowOnLocalWrite = false,
}: {
  localValue?: string;
  sessionValue?: string;
  shouldThrowOnLocalWrite?: boolean;
}) {
  return {
    localStorage: createStorageMock(localValue, shouldThrowOnLocalWrite),
    sessionStorage: createStorageMock(sessionValue),
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
          rememberGeomiDevApiKeyOverride: true,
        }),
      ).toEqual({
        geomiDevApiKeyOverride: "override-key",
        rememberGeomiDevApiKeyOverride: true,
      });
    });

    it("forces remember to false when the key is empty", () => {
      expect(
        sanitizeExplorerClientSettings({
          geomiDevApiKeyOverride: "   ",
          rememberGeomiDevApiKeyOverride: true,
        }),
      ).toEqual(defaultExplorerClientSettings);
    });

    it("falls back to the default settings shape", () => {
      expect(sanitizeExplorerClientSettings(undefined)).toEqual(
        defaultExplorerClientSettings,
      );
    });
  });

  describe("loadExplorerClientSettings", () => {
    it("returns defaults for malformed storage values", () => {
      const storages = createStorageCollection({sessionValue: "not-json"});
      expect(loadExplorerClientSettings(storages)).toEqual(
        defaultExplorerClientSettings,
      );
    });

    it("prefers session settings over local settings", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverride: "local-key",
          rememberGeomiDevApiKeyOverride: true,
        }),
        sessionValue: JSON.stringify({
          geomiDevApiKeyOverride: "  session-key  ",
        }),
      });

      expect(loadExplorerClientSettings(storages)).toEqual({
        geomiDevApiKeyOverride: "session-key",
        rememberGeomiDevApiKeyOverride: false,
      });
    });

    it("reads and sanitizes remembered local settings", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverride: "  saved-key  ",
        }),
      });

      expect(loadExplorerClientSettings(storages)).toEqual({
        geomiDevApiKeyOverride: "saved-key",
        rememberGeomiDevApiKeyOverride: true,
      });
    });
  });

  describe("persistExplorerClientSettings", () => {
    it("writes normalized settings to session storage by default", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        {
          geomiDevApiKeyOverride: "  persisted-key  ",
          rememberGeomiDevApiKeyOverride: false,
        },
        storages,
      );

      expect(loadExplorerClientSettings(storages)).toEqual({
        geomiDevApiKeyOverride: "persisted-key",
        rememberGeomiDevApiKeyOverride: false,
      });
    });

    it("writes remembered settings to local storage", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        {
          geomiDevApiKeyOverride: "persisted-key",
          rememberGeomiDevApiKeyOverride: true,
        },
        storages,
      );

      expect(loadExplorerClientSettings(storages)).toEqual({
        geomiDevApiKeyOverride: "persisted-key",
        rememberGeomiDevApiKeyOverride: true,
      });
    });

    it("clears stored settings when the key is emptied", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverride: "persisted-key",
        }),
        sessionValue: JSON.stringify({
          geomiDevApiKeyOverride: "session-key",
        }),
      });

      persistExplorerClientSettings(
        {
          geomiDevApiKeyOverride: "",
          rememberGeomiDevApiKeyOverride: false,
        },
        storages,
      );

      expect(loadExplorerClientSettings(storages)).toEqual(
        defaultExplorerClientSettings,
      );
    });

    it("clears keys from both local and session storage", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverride: "persisted-key",
        }),
        sessionValue: JSON.stringify({
          geomiDevApiKeyOverride: "session-key",
        }),
      });

      clearExplorerClientSettings(storages);

      expect(loadExplorerClientSettings(storages)).toEqual(
        defaultExplorerClientSettings,
      );
    });

    it("fails gracefully when storage writes throw", () => {
      const storages = createStorageCollection({shouldThrowOnLocalWrite: true});

      expect(() =>
        persistExplorerClientSettings(
          {
            geomiDevApiKeyOverride: "persisted-key",
            rememberGeomiDevApiKeyOverride: true,
          },
          storages,
        ),
      ).not.toThrow();
    });
  });
});
