type SettingsListener = () => void;

const listeners = new Set<SettingsListener>();

export function onOpenSettings(listener: SettingsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitOpenSettings(): void {
  for (const listener of listeners) {
    listener();
  }
}
