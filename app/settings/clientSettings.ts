export interface ExplorerClientSettings {
  geomiDevApiKeyOverride: string;
}

export const EXPLORER_SETTINGS_STORAGE_KEY = "aptos-explorer-settings";

export const defaultExplorerClientSettings: ExplorerClientSettings = {
  geomiDevApiKeyOverride: "",
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function getStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
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
  };
}

export function loadExplorerClientSettings(
  storage: StorageLike | null = getStorage(),
): ExplorerClientSettings {
  if (!storage) {
    return defaultExplorerClientSettings;
  }

  try {
    const rawSettings = storage.getItem(EXPLORER_SETTINGS_STORAGE_KEY);
    if (!rawSettings) {
      return defaultExplorerClientSettings;
    }

    const parsedSettings = JSON.parse(
      rawSettings,
    ) as Partial<ExplorerClientSettings>;
    return sanitizeExplorerClientSettings(parsedSettings);
  } catch {
    return defaultExplorerClientSettings;
  }
}

export function persistExplorerClientSettings(
  settings: ExplorerClientSettings,
  storage: StorageLike | null = getStorage(),
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      EXPLORER_SETTINGS_STORAGE_KEY,
      JSON.stringify(sanitizeExplorerClientSettings(settings)),
    );
  } catch {
    // Ignore storage write failures so settings UI changes do not crash the app.
  }
}

export function getGeomiDevApiKeyOverride(): string | undefined {
  const apiKeyOverride = loadExplorerClientSettings().geomiDevApiKeyOverride;
  return apiKeyOverride || undefined;
}
