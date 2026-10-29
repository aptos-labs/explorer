import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  appliedNonStagingEndpoints,
  setClientAppliedNonStagingEndpoints,
} from "../lib/networkEndpoints";
import {
  type ExplorerClientSettings,
  isExplorerSettingsStorageKey,
  loadExplorerClientSettings,
  persistExplorerClientSettings,
  sanitizeExplorerClientSettings,
} from "./clientSettings";

interface ExplorerSettingsContextValue {
  settings: ExplorerClientSettings;
  setExplorerSettings: (value: ExplorerClientSettings) => void;
}

const ExplorerSettingsContext = createContext<
  ExplorerSettingsContextValue | undefined
>(undefined);

/** False until the settings provider has hydrated, then stays true. */
const NonStagingHydratedContext = createContext(false);

export function ExplorerSettingsProvider({children}: {children: ReactNode}) {
  const [settings, setSettings] = useState<ExplorerClientSettings>(() =>
    loadExplorerClientSettings(),
  );
  const [endpointsHydrated, setEndpointsHydrated] = useState(false);

  useEffect(() => {
    setEndpointsHydrated(true);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!isExplorerSettingsStorageKey(event.key)) {
        return;
      }
      // jsdom StorageEvents often omit `storageArea`; the browser only fires
      // this event for local/session storage of this origin.
      const area = event.storageArea;
      if (
        area != null &&
        area !== window.localStorage &&
        area !== window.sessionStorage
      ) {
        return;
      }
      setSettings(loadExplorerClientSettings());
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setExplorerSettings = useCallback((value: ExplorerClientSettings) => {
    const nextSettings = sanitizeExplorerClientSettings(value);
    persistExplorerClientSettings(nextSettings);
    // Publish before React re-renders so the save handler's query refresh
    // already targets the host the user just chose.
    if (typeof window !== "undefined") {
      setClientAppliedNonStagingEndpoints(
        appliedNonStagingEndpoints(nextSettings.useNonStagingEndpoints, true),
      );
    }
    setSettings(nextSettings);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      setExplorerSettings,
    }),
    [settings, setExplorerSettings],
  );

  return (
    <ExplorerSettingsContext.Provider value={value}>
      <NonStagingHydratedContext.Provider value={endpointsHydrated}>
        {children}
      </NonStagingHydratedContext.Provider>
    </ExplorerSettingsContext.Provider>
  );
}

export function useExplorerSettings() {
  const context = useContext(ExplorerSettingsContext);

  if (!context) {
    throw new Error(
      "useExplorerSettings must be used within an ExplorerSettingsProvider",
    );
  }

  return context;
}

export function useDecompilationEnabled(): boolean {
  return useExplorerSettings().settings.enableDecompilation;
}

/**
 * Saved testnet/devnet host preference. False until after hydration so the
 * first client render matches SSR (staging). Also publishes that choice for
 * non-React callers such as cached SDK clients.
 */
export function useAppliedNonStagingEndpoints(): boolean {
  const enabled = useExplorerSettings().settings.useNonStagingEndpoints;
  const hydrated = useContext(NonStagingHydratedContext);
  const applied = appliedNonStagingEndpoints(enabled, hydrated);
  if (typeof window !== "undefined") {
    setClientAppliedNonStagingEndpoints(applied);
  }
  return applied;
}
