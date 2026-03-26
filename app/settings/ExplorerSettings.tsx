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
  clearExplorerClientSettings,
  EXPLORER_SETTINGS_STORAGE_KEY,
  type ExplorerClientSettings,
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

export function ExplorerSettingsProvider({children}: {children: ReactNode}) {
  const [settings, setSettings] = useState<ExplorerClientSettings>(() =>
    loadExplorerClientSettings(),
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      const isRelevantStorageArea =
        event.storageArea === window.localStorage ||
        event.storageArea === window.sessionStorage;

      if (
        isRelevantStorageArea &&
        (event.key === EXPLORER_SETTINGS_STORAGE_KEY || event.key === null)
      ) {
        setSettings(loadExplorerClientSettings());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setExplorerSettings = useCallback((value: ExplorerClientSettings) => {
    const nextSettings = sanitizeExplorerClientSettings(value);
    if (
      Object.keys(nextSettings.geomiDevApiKeyOverridesByNetwork).length === 0
    ) {
      clearExplorerClientSettings();
    } else {
      persistExplorerClientSettings(nextSettings);
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
      {children}
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
