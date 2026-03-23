import {useCallback, useSyncExternalStore} from "react";

let hasConsented = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return hasConsented;
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function grantDecompilationConsent() {
  if (!hasConsented) {
    hasConsented = true;
    emitChange();
  }
}

export function useDecompilationConsent() {
  const consented = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const grant = useCallback(grantDecompilationConsent, []);
  return {consented, grant} as const;
}
