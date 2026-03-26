import {networks, type NetworkName} from "../lib/constants";

/** Per-network geomi.dev API key overrides (trimmed non-empty strings only). */
export type GeomiDevApiKeyOverridesByNetwork = Partial<
  Record<NetworkName, string>
>;

export interface ExplorerClientSettings {
  geomiDevApiKeyOverridesByNetwork: GeomiDevApiKeyOverridesByNetwork;
  rememberGeomiDevApiKeyOverride: boolean;
}

export const EXPLORER_SETTINGS_STORAGE_KEY = "aptos-explorer-settings";

const ALL_NETWORK_NAMES = Object.keys(networks) as NetworkName[];

export const defaultExplorerClientSettings: ExplorerClientSettings = {
  geomiDevApiKeyOverridesByNetwork: {},
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
    | (Partial<ExplorerClientSettings> & {
        geomiDevApiKeyOverride?: string;
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

  return {
    geomiDevApiKeyOverridesByNetwork,
    rememberGeomiDevApiKeyOverride,
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
  clearExplorerClientSettings(storages);

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
