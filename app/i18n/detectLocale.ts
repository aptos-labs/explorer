import {
  DEFAULT_LOCALE,
  type LocalePreference,
  type SupportedLocale,
  SUPPORTED_LOCALES,
} from "./locales";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLocalePreference(value: unknown): LocalePreference {
  if (value === "auto") {
    return "auto";
  }
  if (typeof value === "string" && isSupportedLocale(value)) {
    return value;
  }
  return "auto";
}

/**
 * Pick a catalog locale from an explicit preference or the browser language
 * list (`navigator.languages`). Unknown languages fall back to English so the
 * UI always has a complete catalog.
 */
export function resolveLocale(
  preference: LocalePreference,
  browserLanguages: readonly string[] = [],
): SupportedLocale {
  if (preference !== "auto" && isSupportedLocale(preference)) {
    return preference;
  }

  for (const tag of browserLanguages) {
    const primary = tag.trim().toLowerCase().split("-")[0];
    if (primary && isSupportedLocale(primary)) {
      return primary;
    }
  }

  return DEFAULT_LOCALE;
}
