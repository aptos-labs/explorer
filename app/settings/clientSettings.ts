export interface ExplorerClientSettings {
  geomiDevApiKeyOverride: string;
  rememberGeomiDevApiKeyOverride: boolean;
}

export const EXPLORER_SETTINGS_STORAGE_KEY = "aptos-explorer-settings";

export const defaultExplorerClientSettings: ExplorerClientSettings = {
  geomiDevApiKeyOverride: "",
  rememberGeomiDevApiKeyOverride: false,
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

interface ExplorerSettingsStorage {
  localStorage: StorageLike | null;
  sessionStorage: StorageLike | null;
}

function getLocalStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSessionStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getAvailableStorages(): ExplorerSettingsStorage {
  return {
    localStorage: getLocalStorage(),
    sessionStorage: getSessionStorage(),
  };
}

function normalizeRememberGeomiDevApiKeyOverride(value: unknown): boolean {
  return value === true;
}

export function normalizeGeomiDevApiKeyOverride(
  value: string | null | undefined,
): string {
  return value?.trim() ?? "";
}

export function sanitizeExplorerClientSettings(
  value: Partial<ExplorerClientSettings> | null | undefined,
): ExplorerClientSettings {
  return {
    geomiDevApiKeyOverride: normalizeGeomiDevApiKeyOverride(
      value?.geomiDevApiKeyOverride,
    ),
    rememberGeomiDevApiKeyOverride: normalizeRememberGeomiDevApiKeyOverride(
      value?.rememberGeomiDevApiKeyOverride,
    ),
  };
}

function loadStoredExplorerClientSettings(
  storage: StorageLike | null,
): Partial<ExplorerClientSettings> | null {
  if (!storage) {
    return null;
  }

  try {
    const rawSettings = storage.getItem(EXPLORER_SETTINGS_STORAGE_KEY);
    if (!rawSettings) {
      return null;
    }

    return JSON.parse(rawSettings) as Partial<ExplorerClientSettings>;
  } catch {
    return null;
  }
}

function clearStoredExplorerClientSettings(storages: ExplorerSettingsStorage) {
  for (const storage of [storages.localStorage, storages.sessionStorage]) {
    if (!storage) {
      continue;
    }

    try {
      storage.removeItem(EXPLORER_SETTINGS_STORAGE_KEY);
    } catch {
      // Ignore storage removal failures so settings UI changes do not crash the app.
    }
  }
}

export function loadExplorerClientSettings(
  storages: ExplorerSettingsStorage = getAvailableStorages(),
): ExplorerClientSettings {
  const sessionSettings = loadStoredExplorerClientSettings(
    storages.sessionStorage,
  );
  if (sessionSettings) {
    return sanitizeExplorerClientSettings({
      ...sessionSettings,
      rememberGeomiDevApiKeyOverride: false,
    });
  }

  const localSettings = loadStoredExplorerClientSettings(storages.localStorage);
  if (localSettings) {
    return sanitizeExplorerClientSettings({
      ...localSettings,
      rememberGeomiDevApiKeyOverride: true,
    });
  }

  return defaultExplorerClientSettings;
}

export function persistExplorerClientSettings(
  settings: ExplorerClientSettings,
  storages: ExplorerSettingsStorage = getAvailableStorages(),
) {
  const sanitizedSettings = sanitizeExplorerClientSettings(settings);
  clearStoredExplorerClientSettings(storages);

  if (!sanitizedSettings.geomiDevApiKeyOverride) {
    return;
  }

  const targetStorage = sanitizedSettings.rememberGeomiDevApiKeyOverride
    ? storages.localStorage
    : storages.sessionStorage;

  if (!targetStorage) {
    return;
  }

  try {
    targetStorage.setItem(
      EXPLORER_SETTINGS_STORAGE_KEY,
      JSON.stringify(sanitizedSettings),
    );
  } catch {
    // Ignore storage write failures so settings UI changes do not crash the app.
  }
}

export function getGeomiDevApiKeyOverride(): string | undefined {
  const apiKeyOverride = loadExplorerClientSettings().geomiDevApiKeyOverride;
  return apiKeyOverride || undefined;
}
