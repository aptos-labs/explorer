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

export function ExplorerSettingsProvider({children}: {children: ReactNode}) {
  const [settings, setSettings] = useState<ExplorerClientSettings>(() =>
    loadExplorerClientSettings(),
  );

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

export function useDecompilationEnabled(): boolean {
  return useExplorerSettings().settings.enableDecompilation;
}
