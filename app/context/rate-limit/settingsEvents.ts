type SettingsListener = () => void;

const openListeners = new Set<SettingsListener>();

export function onOpenSettings(listener: SettingsListener): () => void {
  openListeners.add(listener);
  return () => {
    openListeners.delete(listener);
  };
}

export function emitOpenSettings(): void {
  for (const listener of openListeners) {
    listener();
  }
}

const apiKeySavedListeners = new Set<SettingsListener>();

export function onApiKeySaved(listener: SettingsListener): () => void {
  apiKeySavedListeners.add(listener);
  return () => {
    apiKeySavedListeners.delete(listener);
  };
}

export function emitApiKeySaved(): void {
  for (const listener of apiKeySavedListeners) {
    listener();
  }
}
