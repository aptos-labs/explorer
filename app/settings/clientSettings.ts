import {normalizeLocalePreference} from "../i18n/detectLocale";
import type {LocalePreference} from "../i18n/locales";
import {type NetworkName, networks} from "../lib/constants";

/** Per-network geomi.dev API key overrides (trimmed non-empty strings only). */
export type GeomiDevApiKeyOverridesByNetwork = Partial<
  Record<NetworkName, string>
>;

export interface ExplorerClientSettings {
  geomiDevApiKeyOverridesByNetwork: GeomiDevApiKeyOverridesByNetwork;
  rememberGeomiDevApiKeyOverride: boolean;
  enableDecompilation: boolean;
  /** When true, chain timestamps render in the browser time zone after hydration. */
  displayLocalTimestamps: boolean;
  localePreference: LocalePreference;
}

export const EXPLORER_SETTINGS_STORAGE_KEY = "aptos-explorer-settings";
export const DECOMPILATION_STORAGE_KEY = "aptos-explorer-enable-decompilation";
export const LOCAL_TIMESTAMPS_STORAGE_KEY = "aptos-explorer-local-timestamps";
export const LOCALE_STORAGE_KEY = "aptos-explorer-locale";

const ALL_NETWORK_NAMES = Object.keys(networks) as NetworkName[];

export const defaultExplorerClientSettings: ExplorerClientSettings = {
  geomiDevApiKeyOverridesByNetwork: {},
  rememberGeomiDevApiKeyOverride: false,
  enableDecompilation: false,
  displayLocalTimestamps: false,
  localePreference: "auto",
};

/** Keys that `ExplorerSettingsProvider` reloads on cross-tab `storage` events. */
export function isExplorerSettingsStorageKey(key: string | null): boolean {
  return (
    key === null ||
    key === EXPLORER_SETTINGS_STORAGE_KEY ||
    key === DECOMPILATION_STORAGE_KEY ||
    key === LOCAL_TIMESTAMPS_STORAGE_KEY ||
    key === LOCALE_STORAGE_KEY
  );
}

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

function sanitizeOverrides(value: unknown): GeomiDevApiKeyOverridesByNetwork {
  const out: GeomiDevApiKeyOverridesByNetwork = {};
  if (!value || typeof value !== "object") {
    return out;
  }

  const raw = value as Record<string, unknown>;
  for (const network of ALL_NETWORK_NAMES) {
    const entry = raw[network];
    const trimmed = normalizeGeomiDevApiKeyOverride(
      typeof entry === "string" ? entry : "",
    );
    if (trimmed) {
      out[network] = trimmed;
    }
  }
  return out;
}

function hasStoredPerNetworkOverrides(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  const raw = (value as {geomiDevApiKeyOverridesByNetwork?: unknown})
    .geomiDevApiKeyOverridesByNetwork;
  return typeof raw === "object" && raw !== null && Object.keys(raw).length > 0;
}

function migrateLegacySingleKey(
  legacyKey: string,
): GeomiDevApiKeyOverridesByNetwork {
  const out: GeomiDevApiKeyOverridesByNetwork = {};
  for (const network of ALL_NETWORK_NAMES) {
    out[network] = legacyKey;
  }
  return out;
}

function hasAnyApiKeyOverride(
  overrides: GeomiDevApiKeyOverridesByNetwork,
): boolean {
  return Object.keys(overrides).length > 0;
}

export function sanitizeExplorerClientSettings(
  value:
    | (Partial<Omit<ExplorerClientSettings, "localePreference">> & {
        geomiDevApiKeyOverride?: string;
        localePreference?: unknown;
      })
    | null
    | undefined,
): ExplorerClientSettings {
  let geomiDevApiKeyOverridesByNetwork = sanitizeOverrides(
    value?.geomiDevApiKeyOverridesByNetwork,
  );

  const legacyKey = normalizeGeomiDevApiKeyOverride(
    value?.geomiDevApiKeyOverride,
  );

  if (!hasStoredPerNetworkOverrides(value) && legacyKey.length > 0) {
    geomiDevApiKeyOverridesByNetwork = migrateLegacySingleKey(legacyKey);
  }

  const rememberGeomiDevApiKeyOverride =
    hasAnyApiKeyOverride(geomiDevApiKeyOverridesByNetwork) &&
    normalizeRememberGeomiDevApiKeyOverride(
      value?.rememberGeomiDevApiKeyOverride,
    );

  const enableDecompilation = value?.enableDecompilation === true;
  const displayLocalTimestamps = value?.displayLocalTimestamps === true;
  const localePreference = normalizeLocalePreference(value?.localePreference);

  return {
    geomiDevApiKeyOverridesByNetwork,
    rememberGeomiDevApiKeyOverride,
    enableDecompilation,
    displayLocalTimestamps,
    localePreference,
  };
}

function loadStoredExplorerClientSettings(
  storage: StorageLike | null,
):
  | (Partial<ExplorerClientSettings> & {geomiDevApiKeyOverride?: string})
  | null {
  if (!storage) {
    return null;
  }

  try {
    const rawSettings = storage.getItem(EXPLORER_SETTINGS_STORAGE_KEY);
    if (!rawSettings) {
      return null;
    }

    return JSON.parse(rawSettings) as Partial<ExplorerClientSettings> & {
      geomiDevApiKeyOverride?: string;
    };
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

    try {
      storage.removeItem(DECOMPILATION_STORAGE_KEY);
    } catch {
      // Ignore storage removal failures.
    }

    try {
      storage.removeItem(LOCAL_TIMESTAMPS_STORAGE_KEY);
    } catch {
      // Ignore storage removal failures.
    }

    try {
      storage.removeItem(LOCALE_STORAGE_KEY);
    } catch {
      // Ignore storage removal failures.
    }
  }
}

function loadLocalePreference(
  storages: ExplorerSettingsStorage,
): LocalePreference | undefined {
  const storage = storages.localStorage ?? storages.sessionStorage;
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(LOCALE_STORAGE_KEY);
    if (raw === null) return undefined;
    return normalizeLocalePreference(raw);
  } catch {
    return undefined;
  }
}

function persistLocalePreference(
  preference: LocalePreference,
  storages: ExplorerSettingsStorage,
) {
  const storage = storages.localStorage ?? storages.sessionStorage;
  if (!storage) return;
  try {
    storage.setItem(LOCALE_STORAGE_KEY, preference);
  } catch {
    // Ignore storage write failures.
  }
}

function loadStoredBooleanFlag(
  storages: ExplorerSettingsStorage,
  key: string,
): boolean | undefined {
  const storage = storages.localStorage ?? storages.sessionStorage;
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(key);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return undefined;
  } catch {
    return undefined;
  }
}

function loadDecompilationFlag(
  storages: ExplorerSettingsStorage,
): boolean | undefined {
  return loadStoredBooleanFlag(storages, DECOMPILATION_STORAGE_KEY);
}

function loadLocalTimestampsFlag(
  storages: ExplorerSettingsStorage,
): boolean | undefined {
  return loadStoredBooleanFlag(storages, LOCAL_TIMESTAMPS_STORAGE_KEY);
}

export function loadExplorerClientSettings(
  storages: ExplorerSettingsStorage = getAvailableStorages(),
): ExplorerClientSettings {
  const decompFlag = loadDecompilationFlag(storages);
  const localTimestampsFlag = loadLocalTimestampsFlag(storages);
  const localePreference = loadLocalePreference(storages);

  const applyIndependentFlags = (settings: ExplorerClientSettings) => {
    if (decompFlag !== undefined) {
      settings.enableDecompilation = decompFlag;
    }
    if (localTimestampsFlag !== undefined) {
      settings.displayLocalTimestamps = localTimestampsFlag;
    }
    if (localePreference !== undefined) {
      settings.localePreference = localePreference;
    }
    return settings;
  };

  const sessionSettings = loadStoredExplorerClientSettings(
    storages.sessionStorage,
  );
  if (sessionSettings) {
    return applyIndependentFlags(
      sanitizeExplorerClientSettings({
        ...sessionSettings,
        rememberGeomiDevApiKeyOverride: false,
      }),
    );
  }

  const localSettings = loadStoredExplorerClientSettings(storages.localStorage);
  if (localSettings) {
    return applyIndependentFlags(
      sanitizeExplorerClientSettings({
        ...localSettings,
        rememberGeomiDevApiKeyOverride: true,
      }),
    );
  }

  return {
    ...defaultExplorerClientSettings,
    enableDecompilation: decompFlag ?? false,
    displayLocalTimestamps: localTimestampsFlag ?? false,
    localePreference: localePreference ?? "auto",
  };
}

function persistBooleanFlag(
  key: string,
  enabled: boolean,
  storages: ExplorerSettingsStorage,
) {
  const storage = storages.localStorage ?? storages.sessionStorage;
  if (!storage) return;
  try {
    if (enabled) {
      storage.setItem(key, "true");
    } else {
      storage.removeItem(key);
    }
  } catch {
    // Ignore storage write failures.
  }
}

function persistDecompilationFlag(
  enabled: boolean,
  storages: ExplorerSettingsStorage,
) {
  persistBooleanFlag(DECOMPILATION_STORAGE_KEY, enabled, storages);
}

function persistLocalTimestampsFlag(
  enabled: boolean,
  storages: ExplorerSettingsStorage,
) {
  persistBooleanFlag(LOCAL_TIMESTAMPS_STORAGE_KEY, enabled, storages);
}

export function persistExplorerClientSettings(
  settings: ExplorerClientSettings,
  storages: ExplorerSettingsStorage = getAvailableStorages(),
) {
  const sanitizedSettings = sanitizeExplorerClientSettings(settings);
  clearExplorerClientSettings(storages);

  persistDecompilationFlag(sanitizedSettings.enableDecompilation, storages);
  persistLocalTimestampsFlag(
    sanitizedSettings.displayLocalTimestamps,
    storages,
  );
  persistLocalePreference(sanitizedSettings.localePreference, storages);

  if (
    !hasAnyApiKeyOverride(sanitizedSettings.geomiDevApiKeyOverridesByNetwork)
  ) {
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

export function getGeomiDevApiKeyOverride(
  networkName: NetworkName,
): string | undefined {
  const key =
    loadExplorerClientSettings().geomiDevApiKeyOverridesByNetwork[networkName];
  return key || undefined;
}
