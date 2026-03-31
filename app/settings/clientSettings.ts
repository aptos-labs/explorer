import {type NetworkName, networks} from "../lib/constants";

/** Per-network geomi.dev API key overrides (trimmed non-empty strings only). */
export type GeomiDevApiKeyOverridesByNetwork = Partial<
  Record<NetworkName, string>
>;

export interface ExplorerClientSettings {
  geomiDevApiKeyOverridesByNetwork: GeomiDevApiKeyOverridesByNetwork;
  rememberGeomiDevApiKeyOverride: boolean;
  enableDecompilation: boolean;
}

export const EXPLORER_SETTINGS_STORAGE_KEY = "aptos-explorer-settings";
const DECOMPILATION_STORAGE_KEY = "aptos-explorer-enable-decompilation";

const ALL_NETWORK_NAMES = Object.keys(networks) as NetworkName[];

export const defaultExplorerClientSettings: ExplorerClientSettings = {
  geomiDevApiKeyOverridesByNetwork: {},
  rememberGeomiDevApiKeyOverride: false,
  enableDecompilation: false,
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

  const enableDecompilation = value?.enableDecompilation === true;

  return {
    geomiDevApiKeyOverridesByNetwork,
    rememberGeomiDevApiKeyOverride,
    enableDecompilation,
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
  }
}

function loadDecompilationFlag(
  storages: ExplorerSettingsStorage,
): boolean | undefined {
  const storage = storages.localStorage ?? storages.sessionStorage;
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(DECOMPILATION_STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return undefined;
  } catch {
    return undefined;
  }
}

export function loadExplorerClientSettings(
  storages: ExplorerSettingsStorage = getAvailableStorages(),
): ExplorerClientSettings {
  const decompFlag = loadDecompilationFlag(storages);

  const sessionSettings = loadStoredExplorerClientSettings(
    storages.sessionStorage,
  );
  if (sessionSettings) {
    const settings = sanitizeExplorerClientSettings({
      ...sessionSettings,
      rememberGeomiDevApiKeyOverride: false,
    });
    if (decompFlag !== undefined) {
      settings.enableDecompilation = decompFlag;
    }
    return settings;
  }

  const localSettings = loadStoredExplorerClientSettings(storages.localStorage);
  if (localSettings) {
    const settings = sanitizeExplorerClientSettings({
      ...localSettings,
      rememberGeomiDevApiKeyOverride: true,
    });
    if (decompFlag !== undefined) {
      settings.enableDecompilation = decompFlag;
    }
    return settings;
  }

  return {
    ...defaultExplorerClientSettings,
    enableDecompilation: decompFlag ?? false,
  };
}

function persistDecompilationFlag(
  enabled: boolean,
  storages: ExplorerSettingsStorage,
) {
  const storage = storages.localStorage ?? storages.sessionStorage;
  if (!storage) return;
  try {
    if (enabled) {
      storage.setItem(DECOMPILATION_STORAGE_KEY, "true");
    } else {
      storage.removeItem(DECOMPILATION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage write failures.
  }
}

export function persistExplorerClientSettings(
  settings: ExplorerClientSettings,
  storages: ExplorerSettingsStorage = getAvailableStorages(),
) {
  const sanitizedSettings = sanitizeExplorerClientSettings(settings);
  clearExplorerClientSettings(storages);

  persistDecompilationFlag(sanitizedSettings.enableDecompilation, storages);

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
