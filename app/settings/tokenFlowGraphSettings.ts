const STORAGE_KEY = "aptos-explorer-token-flow-graph-settings";

export type TokenFlowGraphClientSettings = {
  /** User opted in via Settings (token tracking). */
  userEnabled: boolean;
  /**
   * Last access key the user saved. Compared to `VITE_ACCOUNT_TOKEN_FLOW_TAB_ACCESS_KEY`
   * at runtime so deploys can rotate the key without stale unlock state.
   */
  storedAccessKey: string;
};

export const defaultTokenFlowGraphSettings: TokenFlowGraphClientSettings = {
  userEnabled: false,
  storedAccessKey: "",
};

function readStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadTokenFlowGraphSettings(): TokenFlowGraphClientSettings {
  const storage = readStorage();
  if (!storage) {
    return defaultTokenFlowGraphSettings;
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultTokenFlowGraphSettings;
    }
    const parsed = JSON.parse(raw) as Partial<TokenFlowGraphClientSettings>;
    return {
      userEnabled: parsed.userEnabled === true,
      storedAccessKey:
        typeof parsed.storedAccessKey === "string"
          ? parsed.storedAccessKey
          : "",
    };
  } catch {
    return defaultTokenFlowGraphSettings;
  }
}

export function persistTokenFlowGraphSettings(
  value: TokenFlowGraphClientSettings,
) {
  const storage = readStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

export function notifyTokenFlowGraphSettingsChanged() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event("aptos-explorer-token-flow-settings"));
}

export function isAccountTokenFlowTabBuildEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_ACCOUNT_TOKEN_FLOW_TAB === "true";
}

export function getAccountTokenFlowTabAccessKeyFromEnv(): string {
  return (import.meta.env.VITE_ACCOUNT_TOKEN_FLOW_TAB_ACCESS_KEY ?? "").trim();
}

export function isTokenFlowAccessSatisfied(
  settings: TokenFlowGraphClientSettings,
): boolean {
  const required = getAccountTokenFlowTabAccessKeyFromEnv();
  if (!required) {
    return true;
  }
  return settings.storedAccessKey === required;
}
