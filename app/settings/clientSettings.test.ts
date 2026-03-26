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
    it("normalizes per-network override values", () => {
      expect(
        sanitizeExplorerClientSettings({
          geomiDevApiKeyOverridesByNetwork: {
            mainnet: "  override-key  ",
            testnet: "",
          },
          rememberGeomiDevApiKeyOverride: true,
        }),
      ).toEqual({
        geomiDevApiKeyOverridesByNetwork: {mainnet: "override-key"},
        rememberGeomiDevApiKeyOverride: true,
      });
    });

    it("forces remember to false when no keys are set", () => {
      expect(
        sanitizeExplorerClientSettings({
          geomiDevApiKeyOverridesByNetwork: {},
          rememberGeomiDevApiKeyOverride: true,
        }),
      ).toEqual(defaultExplorerClientSettings);
    });

    it("migrates legacy single key to all networks", () => {
      expect(
        sanitizeExplorerClientSettings({
          geomiDevApiKeyOverride: "  legacy  ",
          rememberGeomiDevApiKeyOverride: true,
        }),
      ).toEqual({
        geomiDevApiKeyOverridesByNetwork: {
          mainnet: "legacy",
          testnet: "legacy",
          devnet: "legacy",
          decibel: "legacy",
          shelbynet: "legacy",
          local: "legacy",
        },
        rememberGeomiDevApiKeyOverride: true,
      });
    });

    it("does not use legacy key when per-network map is present", () => {
      expect(
        sanitizeExplorerClientSettings({
          geomiDevApiKeyOverride: "ignored",
          geomiDevApiKeyOverridesByNetwork: {mainnet: "only-main"},
          rememberGeomiDevApiKeyOverride: true,
        }),
      ).toEqual({
        geomiDevApiKeyOverridesByNetwork: {mainnet: "only-main"},
        rememberGeomiDevApiKeyOverride: true,
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
      const storages = createStorageCollection({sessionValue: "not-json"});
      expect(loadExplorerClientSettings(storages)).toEqual(
        defaultExplorerClientSettings,
      );
    });

    it("prefers session settings over local settings", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "local-key"},
          rememberGeomiDevApiKeyOverride: true,
        }),
        sessionValue: JSON.stringify({
          geomiDevApiKeyOverridesByNetwork: {testnet: "  session-key  "},
        }),
      });

      expect(loadExplorerClientSettings(storages)).toEqual({
        geomiDevApiKeyOverridesByNetwork: {testnet: "session-key"},
        rememberGeomiDevApiKeyOverride: false,
      });
    });

    it("reads and sanitizes remembered local settings", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverridesByNetwork: {devnet: "  saved-key  "},
        }),
      });

      expect(loadExplorerClientSettings(storages)).toEqual({
        geomiDevApiKeyOverridesByNetwork: {devnet: "saved-key"},
        rememberGeomiDevApiKeyOverride: true,
      });
    });

    it("migrates legacy persisted shape on load", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverride: "one-key",
          rememberGeomiDevApiKeyOverride: true,
        }),
      });

      const loaded = loadExplorerClientSettings(storages);
      expect(loaded.geomiDevApiKeyOverridesByNetwork.mainnet).toBe("one-key");
      expect(loaded.geomiDevApiKeyOverridesByNetwork.local).toBe("one-key");
      expect(loaded.rememberGeomiDevApiKeyOverride).toBe(true);
    });
  });

  describe("persistExplorerClientSettings", () => {
    it("writes normalized settings to session storage by default", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        {
          geomiDevApiKeyOverridesByNetwork: {mainnet: "  persisted-key  "},
          rememberGeomiDevApiKeyOverride: false,
        },
        storages,
      );

      expect(loadExplorerClientSettings(storages)).toEqual({
        geomiDevApiKeyOverridesByNetwork: {mainnet: "persisted-key"},
        rememberGeomiDevApiKeyOverride: false,
      });
    });

    it("writes remembered settings to local storage", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        {
          geomiDevApiKeyOverridesByNetwork: {testnet: "persisted-key"},
          rememberGeomiDevApiKeyOverride: true,
        },
        storages,
      );

      expect(loadExplorerClientSettings(storages)).toEqual({
        geomiDevApiKeyOverridesByNetwork: {testnet: "persisted-key"},
        rememberGeomiDevApiKeyOverride: true,
      });
    });

    it("clears stored settings when all keys are emptied", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "persisted-key"},
        }),
        sessionValue: JSON.stringify({
          geomiDevApiKeyOverridesByNetwork: {testnet: "session-key"},
        }),
      });

      persistExplorerClientSettings(
        {
          geomiDevApiKeyOverridesByNetwork: {},
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
          geomiDevApiKeyOverridesByNetwork: {mainnet: "persisted-key"},
        }),
        sessionValue: JSON.stringify({
          geomiDevApiKeyOverridesByNetwork: {testnet: "session-key"},
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
            geomiDevApiKeyOverridesByNetwork: {mainnet: "persisted-key"},
            rememberGeomiDevApiKeyOverride: true,
          },
          storages,
        ),
      ).not.toThrow();
    });
  });
});
