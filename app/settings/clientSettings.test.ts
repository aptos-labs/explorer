import {describe, expect, it} from "vitest";
import type {ExplorerClientSettings} from "./clientSettings";
import {
  AI_API_KEY_STORAGE_KEY,
  AI_PREFS_STORAGE_KEY,
  clearExplorerClientSettings,
  defaultExplorerClientSettings,
  EXPLORER_SETTINGS_STORAGE_KEY,
  isAiTransactionDescriptionConfigured,
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

function settingsOf(
  overrides: Partial<ExplorerClientSettings>,
): ExplorerClientSettings {
  return {...defaultExplorerClientSettings, ...overrides};
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
      ).toEqual(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "override-key"},
          rememberGeomiDevApiKeyOverride: true,
        }),
      );
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
      ).toEqual(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {
            mainnet: "legacy",
            testnet: "legacy",
            devnet: "legacy",
            decibel: "legacy",
            shelbynet: "legacy",
            local: "legacy",
          },
          rememberGeomiDevApiKeyOverride: true,
        }),
      );
    });

    it("does not use legacy key when per-network map is present", () => {
      expect(
        sanitizeExplorerClientSettings({
          geomiDevApiKeyOverride: "ignored",
          geomiDevApiKeyOverridesByNetwork: {mainnet: "only-main"},
          rememberGeomiDevApiKeyOverride: true,
        }),
      ).toEqual(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "only-main"},
          rememberGeomiDevApiKeyOverride: true,
        }),
      );
    });

    it("falls back to the default settings shape", () => {
      expect(sanitizeExplorerClientSettings(undefined)).toEqual(
        defaultExplorerClientSettings,
      );
    });

    it("sanitizes experimental AI fields", () => {
      // Covers FEAT-SETTINGS-003
      expect(
        sanitizeExplorerClientSettings({
          enableAiTransactionDescriptions: true,
          aiProvider: "anthropic",
          aiModel: "  claude-sonnet-4-5  ",
          aiBaseUrl: "  https://api.anthropic.com/  ",
          aiApiKey: "  sk-ant-test  ",
          rememberAiApiKey: true,
        }),
      ).toEqual(
        settingsOf({
          enableAiTransactionDescriptions: true,
          aiProvider: "anthropic",
          aiModel: "claude-sonnet-4-5",
          aiBaseUrl: "https://api.anthropic.com/",
          aiApiKey: "sk-ant-test",
          rememberAiApiKey: true,
        }),
      );
    });

    it("rejects unknown AI providers and empty-key remember flags", () => {
      expect(
        sanitizeExplorerClientSettings({
          aiProvider: "not-a-provider" as never,
          rememberAiApiKey: true,
          aiApiKey: "   ",
        }),
      ).toEqual(defaultExplorerClientSettings);
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

      expect(loadExplorerClientSettings(storages)).toEqual(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {testnet: "session-key"},
          rememberGeomiDevApiKeyOverride: false,
        }),
      );
    });

    it("reads and sanitizes remembered local settings", () => {
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverridesByNetwork: {devnet: "  saved-key  "},
        }),
      });

      expect(loadExplorerClientSettings(storages)).toEqual(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {devnet: "saved-key"},
          rememberGeomiDevApiKeyOverride: true,
        }),
      );
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

    it("ignores an AI API key stuffed into the geomi settings blob", () => {
      // Covers FEAT-SETTINGS-003 — credentials stay on the dedicated key only
      const storages = createStorageCollection({
        localValue: JSON.stringify({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "geomi-key"},
          aiApiKey: "should-not-load",
          enableAiTransactionDescriptions: true,
        }),
      });

      const loaded = loadExplorerClientSettings(storages);
      expect(loaded.aiApiKey).toBe("");
      expect(loaded.enableAiTransactionDescriptions).toBe(false);
      expect(loaded.geomiDevApiKeyOverridesByNetwork.mainnet).toBe("geomi-key");
    });
  });

  describe("persistExplorerClientSettings", () => {
    it("writes normalized settings to session storage by default", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "  persisted-key  "},
        }),
        storages,
      );

      expect(loadExplorerClientSettings(storages)).toEqual(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "persisted-key"},
        }),
      );
    });

    it("writes remembered settings to local storage", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {testnet: "persisted-key"},
          rememberGeomiDevApiKeyOverride: true,
        }),
        storages,
      );

      expect(loadExplorerClientSettings(storages)).toEqual(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {testnet: "persisted-key"},
          rememberGeomiDevApiKeyOverride: true,
        }),
      );
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

      persistExplorerClientSettings(defaultExplorerClientSettings, storages);

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

    it("persists enableDecompilation without API keys", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        settingsOf({enableDecompilation: true}),
        storages,
      );

      expect(loadExplorerClientSettings(storages)).toEqual(
        settingsOf({enableDecompilation: true}),
      );
    });

    it("persists enableDecompilation in localStorage across sessions", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        settingsOf({enableDecompilation: true}),
        storages,
      );

      const freshStorages = {
        localStorage: storages.localStorage,
        sessionStorage: createStorageMock(),
      };

      expect(loadExplorerClientSettings(freshStorages)).toEqual(
        settingsOf({enableDecompilation: true}),
      );
    });

    it("preserves enableDecompilation independently from session-only API keys", () => {
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "session-key"},
          enableDecompilation: true,
        }),
        storages,
      );

      const freshStorages = {
        localStorage: storages.localStorage,
        sessionStorage: createStorageMock(),
      };

      const loaded = loadExplorerClientSettings(freshStorages);
      expect(loaded.enableDecompilation).toBe(true);
      expect(loaded.geomiDevApiKeyOverridesByNetwork).toEqual({});
    });

    it("fails gracefully when storage writes throw", () => {
      const storages = createStorageCollection({shouldThrowOnLocalWrite: true});

      expect(() =>
        persistExplorerClientSettings(
          settingsOf({
            geomiDevApiKeyOverridesByNetwork: {mainnet: "persisted-key"},
            rememberGeomiDevApiKeyOverride: true,
          }),
          storages,
        ),
      ).not.toThrow();
    });

    it("persists AI prefs without putting the API key in the geomi blob", () => {
      // Covers FEAT-SETTINGS-003
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        settingsOf({
          geomiDevApiKeyOverridesByNetwork: {mainnet: "geomi-key"},
          rememberGeomiDevApiKeyOverride: true,
          enableAiTransactionDescriptions: true,
          aiProvider: "anthropic",
          aiModel: "claude-sonnet-4-5",
          aiApiKey: "sk-ant-secret",
          rememberAiApiKey: true,
        }),
        storages,
      );

      const geomiBlob = storages.localStorage.getItem(
        EXPLORER_SETTINGS_STORAGE_KEY,
      );
      expect(geomiBlob).toBeTruthy();
      expect(geomiBlob).not.toContain("sk-ant-secret");
      expect(geomiBlob).not.toContain("aiApiKey");

      const prefs = JSON.parse(
        storages.localStorage.getItem(AI_PREFS_STORAGE_KEY) ?? "{}",
      ) as Record<string, unknown>;
      expect(prefs.aiApiKey).toBeUndefined();
      expect(prefs.enableAiTransactionDescriptions).toBe(true);
      expect(prefs.aiProvider).toBe("anthropic");
      expect(storages.localStorage.getItem(AI_API_KEY_STORAGE_KEY)).toBe(
        "sk-ant-secret",
      );

      expect(loadExplorerClientSettings(storages).aiApiKey).toBe(
        "sk-ant-secret",
      );
    });

    it("keeps a session-only AI key out of a new session while retaining prefs", () => {
      // Covers FEAT-SETTINGS-003
      const storages = createStorageCollection({});

      persistExplorerClientSettings(
        settingsOf({
          enableAiTransactionDescriptions: true,
          aiProvider: "openai",
          aiModel: "gpt-4o-mini",
          aiApiKey: "sk-test",
          rememberAiApiKey: false,
        }),
        storages,
      );

      expect(storages.sessionStorage.getItem(AI_API_KEY_STORAGE_KEY)).toBe(
        "sk-test",
      );
      expect(storages.localStorage.getItem(AI_API_KEY_STORAGE_KEY)).toBeNull();

      const freshStorages = {
        localStorage: storages.localStorage,
        sessionStorage: createStorageMock(),
      };
      const loaded = loadExplorerClientSettings(freshStorages);
      expect(loaded.enableAiTransactionDescriptions).toBe(true);
      expect(loaded.aiModel).toBe("gpt-4o-mini");
      expect(loaded.aiApiKey).toBe("");
    });
  });

  describe("isAiTransactionDescriptionConfigured", () => {
    it("requires opt-in, model, key, and a base URL for compatible providers", () => {
      // Covers FEAT-SETTINGS-003
      expect(
        isAiTransactionDescriptionConfigured(defaultExplorerClientSettings),
      ).toBe(false);
      expect(
        isAiTransactionDescriptionConfigured(
          settingsOf({
            enableAiTransactionDescriptions: true,
            aiProvider: "anthropic",
            aiModel: "claude-sonnet-4-5",
            aiApiKey: "sk-ant",
          }),
        ),
      ).toBe(true);
      expect(
        isAiTransactionDescriptionConfigured(
          settingsOf({
            enableAiTransactionDescriptions: true,
            aiProvider: "openai_compatible",
            aiModel: "llama3",
            aiApiKey: "key",
          }),
        ),
      ).toBe(false);
      expect(
        isAiTransactionDescriptionConfigured(
          settingsOf({
            enableAiTransactionDescriptions: true,
            aiProvider: "openai_compatible",
            aiModel: "llama3",
            aiBaseUrl: "http://127.0.0.1:11434/v1",
            aiApiKey: "key",
          }),
        ),
      ).toBe(true);
    });
  });
});
