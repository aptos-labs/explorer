export type JsonViewMode = "json" | "table";

export interface ExplorerClientSettings {
  geomiDevApiKeyOverride: string;
  rememberGeomiDevApiKeyOverride: boolean;
  defaultJsonViewMode: JsonViewMode;
}

export const EXPLORER_SETTINGS_STORAGE_KEY = "aptos-explorer-settings";
const DISPLAY_PREFS_STORAGE_KEY = "aptos-explorer-display-prefs";

export const defaultExplorerClientSettings: ExplorerClientSettings = {
  geomiDevApiKeyOverride: "",
  rememberGeomiDevApiKeyOverride: false,
  defaultJsonViewMode: "table",
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

function normalizeJsonViewMode(value: unknown): JsonViewMode {
  return value === "json" || value === "table" ? value : "table";
}

export function sanitizeExplorerClientSettings(
  value: Partial<ExplorerClientSettings> | null | undefined,
): ExplorerClientSettings {
  const geomiDevApiKeyOverride = normalizeGeomiDevApiKeyOverride(
    value?.geomiDevApiKeyOverride,
  );

  return {
    geomiDevApiKeyOverride,
    rememberGeomiDevApiKeyOverride:
      geomiDevApiKeyOverride.length > 0 &&
      normalizeRememberGeomiDevApiKeyOverride(
        value?.rememberGeomiDevApiKeyOverride,
      ),
    defaultJsonViewMode: normalizeJsonViewMode(value?.defaultJsonViewMode),
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

export function clearExplorerClientSettings(
  storages: ExplorerSettingsStorage = getAvailableStorages(),
) {
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
  const displayPrefs = loadDisplayPrefs();

  const sessionSettings = loadStoredExplorerClientSettings(
    storages.sessionStorage,
  );
  if (sessionSettings) {
    return sanitizeExplorerClientSettings({
      ...sessionSettings,
      rememberGeomiDevApiKeyOverride: false,
      defaultJsonViewMode: displayPrefs.defaultJsonViewMode,
    });
  }

  const localSettings = loadStoredExplorerClientSettings(storages.localStorage);
  if (localSettings) {
    return sanitizeExplorerClientSettings({
      ...localSettings,
      rememberGeomiDevApiKeyOverride: true,
      defaultJsonViewMode: displayPrefs.defaultJsonViewMode,
    });
  }

  return {
    ...defaultExplorerClientSettings,
    defaultJsonViewMode: displayPrefs.defaultJsonViewMode,
  };
}

export function persistExplorerClientSettings(
  settings: ExplorerClientSettings,
  storages: ExplorerSettingsStorage = getAvailableStorages(),
) {
  const sanitizedSettings = sanitizeExplorerClientSettings(settings);
  clearExplorerClientSettings(storages);

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

interface DisplayPrefs {
  defaultJsonViewMode: JsonViewMode;
}

export function loadDisplayPrefs(): DisplayPrefs {
  const ls = getLocalStorage();
  if (!ls) return {defaultJsonViewMode: "table"};

  try {
    const raw = ls.getItem(DISPLAY_PREFS_STORAGE_KEY);
    if (!raw) return {defaultJsonViewMode: "table"};
    const parsed = JSON.parse(raw) as Partial<DisplayPrefs>;
    return {
      defaultJsonViewMode: normalizeJsonViewMode(parsed.defaultJsonViewMode),
    };
  } catch {
    return {defaultJsonViewMode: "table"};
  }
}

export function persistDisplayPrefs(prefs: DisplayPrefs) {
  const ls = getLocalStorage();
  if (!ls) return;

  try {
    ls.setItem(DISPLAY_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage write failures
  }
}
