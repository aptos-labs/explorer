import {type NetworkName, networks} from "../lib/constants";
import {type AiProviderId, isAiProviderId} from "../lib/ai/providers";

/** Per-network geomi.dev API key overrides (trimmed non-empty strings only). */
export type GeomiDevApiKeyOverridesByNetwork = Partial<
  Record<NetworkName, string>
>;

export interface ExplorerClientSettings {
  geomiDevApiKeyOverridesByNetwork: GeomiDevApiKeyOverridesByNetwork;
  rememberGeomiDevApiKeyOverride: boolean;
  enableDecompilation: boolean;
  /** Experimental BYOK AI descriptions. Off by default. */
  enableAiTransactionDescriptions: boolean;
  aiProvider: AiProviderId;
  aiModel: string;
  /** Optional override; empty uses the provider default endpoint. */
  aiBaseUrl: string;
  /** Provider API key. Stored only in the browser; never sent to explorer SSR. */
  aiApiKey: string;
  rememberAiApiKey: boolean;
}

export const EXPLORER_SETTINGS_STORAGE_KEY = "aptos-explorer-settings";
export const DECOMPILATION_STORAGE_KEY = "aptos-explorer-enable-decompilation";
/** Non-secret AI prefs (provider, model, enable). Never contains the API key. */
export const AI_PREFS_STORAGE_KEY = "aptos-explorer-ai-settings";
/** AI provider API key. Session or local storage only — never the geomi blob. */
export const AI_API_KEY_STORAGE_KEY = "aptos-explorer-ai-api-key";

export const EXPLORER_CLIENT_STORAGE_KEYS = [
  EXPLORER_SETTINGS_STORAGE_KEY,
  DECOMPILATION_STORAGE_KEY,
  AI_PREFS_STORAGE_KEY,
  AI_API_KEY_STORAGE_KEY,
] as const;

const ALL_NETWORK_NAMES = Object.keys(networks) as NetworkName[];

export const defaultExplorerClientSettings: ExplorerClientSettings = {
  geomiDevApiKeyOverridesByNetwork: {},
  rememberGeomiDevApiKeyOverride: false,
  enableDecompilation: false,
  enableAiTransactionDescriptions: false,
  aiProvider: "openai_compatible",
  aiModel: "",
  aiBaseUrl: "",
  aiApiKey: "",
  rememberAiApiKey: false,
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

interface ExplorerSettingsStorage {
  localStorage: StorageLike | null;
  sessionStorage: StorageLike | null;
}

interface StoredAiPrefs {
  enableAiTransactionDescriptions: boolean;
  aiProvider: AiProviderId;
  aiModel: string;
  aiBaseUrl: string;
  rememberAiApiKey: boolean;
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

function normalizeOptionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

function sanitizeAiProvider(value: unknown): AiProviderId {
  return isAiProviderId(value)
    ? value
    : defaultExplorerClientSettings.aiProvider;
}

export function isExplorerClientStorageKey(key: string | null): boolean {
  if (key === null) {
    return true;
  }
  return (EXPLORER_CLIENT_STORAGE_KEYS as readonly string[]).includes(key);
}

export function isAiTransactionDescriptionConfigured(
  settings: ExplorerClientSettings,
): boolean {
  if (!settings.enableAiTransactionDescriptions) {
    return false;
  }
  if (!settings.aiApiKey || !settings.aiModel) {
    return false;
  }
  if (settings.aiProvider === "openai_compatible" && !settings.aiBaseUrl) {
    return false;
  }
  return true;
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
  const aiApiKey = normalizeOptionalString(value?.aiApiKey);
  const rememberAiApiKey =
    aiApiKey.length > 0 && value?.rememberAiApiKey === true;

  return {
    geomiDevApiKeyOverridesByNetwork,
    rememberGeomiDevApiKeyOverride,
    enableDecompilation,
    enableAiTransactionDescriptions:
      value?.enableAiTransactionDescriptions === true,
    aiProvider: sanitizeAiProvider(value?.aiProvider),
    aiModel: normalizeOptionalString(value?.aiModel),
    aiBaseUrl: normalizeOptionalString(value?.aiBaseUrl),
    aiApiKey,
    rememberAiApiKey,
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

function removeStorageItem(storage: StorageLike | null, key: string) {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage removal failures so settings UI changes do not crash the app.
  }
}

export function clearExplorerClientSettings(
  storages: ExplorerSettingsStorage = getAvailableStorages(),
) {
  for (const storage of [storages.localStorage, storages.sessionStorage]) {
    for (const key of EXPLORER_CLIENT_STORAGE_KEYS) {
      removeStorageItem(storage, key);
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

function loadStoredAiPrefs(
  storages: ExplorerSettingsStorage,
): Partial<StoredAiPrefs> | null {
  const storage = storages.localStorage ?? storages.sessionStorage;
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(AI_PREFS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed as Partial<StoredAiPrefs>;
  } catch {
    return null;
  }
}

function loadStoredAiApiKey(
  storages: ExplorerSettingsStorage,
  rememberAiApiKey: boolean,
): string {
  const storage = rememberAiApiKey
    ? storages.localStorage
    : storages.sessionStorage;
  if (!storage) {
    return "";
  }
  try {
    return normalizeOptionalString(storage.getItem(AI_API_KEY_STORAGE_KEY));
  } catch {
    return "";
  }
}

function applyAiSettings(
  settings: ExplorerClientSettings,
  storages: ExplorerSettingsStorage,
): ExplorerClientSettings {
  const storedPrefs = loadStoredAiPrefs(storages);
  const rememberAiApiKey = storedPrefs?.rememberAiApiKey === true;
  const aiApiKey = loadStoredAiApiKey(storages, rememberAiApiKey);
  // AI fields come only from dedicated storage keys — never from the geomi JSON blob.
  return sanitizeExplorerClientSettings({
    ...settings,
    enableAiTransactionDescriptions:
      storedPrefs?.enableAiTransactionDescriptions === true,
    aiProvider:
      storedPrefs?.aiProvider ?? defaultExplorerClientSettings.aiProvider,
    aiModel: storedPrefs?.aiModel ?? "",
    aiBaseUrl: storedPrefs?.aiBaseUrl ?? "",
    rememberAiApiKey,
    aiApiKey,
  });
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
      aiApiKey: "",
    });
    if (decompFlag !== undefined) {
      settings.enableDecompilation = decompFlag;
    }
    return applyAiSettings(settings, storages);
  }

  const localSettings = loadStoredExplorerClientSettings(storages.localStorage);
  if (localSettings) {
    const settings = sanitizeExplorerClientSettings({
      ...localSettings,
      rememberGeomiDevApiKeyOverride: true,
      aiApiKey: "",
    });
    if (decompFlag !== undefined) {
      settings.enableDecompilation = decompFlag;
    }
    return applyAiSettings(settings, storages);
  }

  return applyAiSettings(
    {
      ...defaultExplorerClientSettings,
      enableDecompilation: decompFlag ?? false,
    },
    storages,
  );
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

function hasNonDefaultAiPrefs(settings: ExplorerClientSettings): boolean {
  return (
    settings.enableAiTransactionDescriptions ||
    settings.aiProvider !== defaultExplorerClientSettings.aiProvider ||
    settings.aiModel.length > 0 ||
    settings.aiBaseUrl.length > 0 ||
    settings.rememberAiApiKey ||
    settings.aiApiKey.length > 0
  );
}

function persistAiSettings(
  settings: ExplorerClientSettings,
  storages: ExplorerSettingsStorage,
) {
  const prefsStorage = storages.localStorage ?? storages.sessionStorage;
  if (prefsStorage && hasNonDefaultAiPrefs(settings)) {
    const prefs: StoredAiPrefs = {
      enableAiTransactionDescriptions: settings.enableAiTransactionDescriptions,
      aiProvider: settings.aiProvider,
      aiModel: settings.aiModel,
      aiBaseUrl: settings.aiBaseUrl,
      rememberAiApiKey: settings.rememberAiApiKey,
    };
    try {
      prefsStorage.setItem(AI_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage write failures.
    }
  }

  if (!settings.aiApiKey) {
    return;
  }

  const keyStorage = settings.rememberAiApiKey
    ? storages.localStorage
    : storages.sessionStorage;
  if (!keyStorage) {
    return;
  }
  try {
    keyStorage.setItem(AI_API_KEY_STORAGE_KEY, settings.aiApiKey);
  } catch {
    // Ignore storage write failures.
  }
}

/** Fields that may be written to the geomi settings blob — never the AI API key. */
function geomiStoragePayload(settings: ExplorerClientSettings) {
  return {
    geomiDevApiKeyOverridesByNetwork: settings.geomiDevApiKeyOverridesByNetwork,
    rememberGeomiDevApiKeyOverride: settings.rememberGeomiDevApiKeyOverride,
    enableDecompilation: settings.enableDecompilation,
  };
}

export function persistExplorerClientSettings(
  settings: ExplorerClientSettings,
  storages: ExplorerSettingsStorage = getAvailableStorages(),
) {
  const sanitizedSettings = sanitizeExplorerClientSettings(settings);
  clearExplorerClientSettings(storages);

  persistDecompilationFlag(sanitizedSettings.enableDecompilation, storages);
  persistAiSettings(sanitizedSettings, storages);

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
      JSON.stringify(geomiStoragePayload(sanitizedSettings)),
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
