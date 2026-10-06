import {useEffect, useState} from "react";

/**
 * Chain timestamps stay in UTC until the client has hydrated. That keeps SSR
 * HTML identical to the first client render. After hydration, a saved
 * preference can switch the clock to the browser time zone.
 */
export function resolveTimestampTimeZone(
  displayLocalTimestamps: boolean,
  hydrated: boolean,
  browserTimeZone: string | undefined,
): string {
  if (!hydrated || !displayLocalTimestamps) {
    return "UTC";
  }
  const zone = browserTimeZone?.trim();
  return zone ? zone : "UTC";
}

export function readBrowserTimeZone(): string | undefined {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone?.trim() ? zone : undefined;
  } catch {
    return undefined;
  }
}

export function useResolvedTimestampTimeZone(
  displayLocalTimestamps: boolean,
): string {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return resolveTimestampTimeZone(
    displayLocalTimestamps,
    hydrated,
    hydrated ? readBrowserTimeZone() : undefined,
  );
}
