import {
  DEFAULT_LOCALE,
  type LocalePreference,
  type SupportedLocale,
  SUPPORTED_LOCALES,
} from "./locales";

/** Browser tags whose primary subtag should use another registered catalog. */
const BROWSER_PRIMARY_ALIASES: Record<string, SupportedLocale> = {
  tl: "fil",
};

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

function normalizeBrowserTag(tag: string): string {
  return tag.trim().toLowerCase().replaceAll("_", "-");
}

function isTraditionalChinese(normalized: string): boolean {
  const parts = normalized.split("-");
  if (parts[0] !== "zh") {
    return false;
  }
  return parts.some(
    (part) =>
      part === "hant" || part === "tw" || part === "hk" || part === "mo",
  );
}

/**
 * Map a BCP 47 language tag from the browser to a registered catalog, if any.
 */
export function localeFromBrowserTag(tag: string): SupportedLocale | undefined {
  const normalized = normalizeBrowserTag(tag);
  if (!normalized) {
    return undefined;
  }

  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  if (isTraditionalChinese(normalized)) {
    return undefined;
  }

  const primary = normalized.split("-")[0];
  if (!primary) {
    return undefined;
  }

  const aliased = BROWSER_PRIMARY_ALIASES[primary];
  if (aliased && isSupportedLocale(aliased)) {
    return aliased;
  }

  if (isSupportedLocale(primary)) {
    return primary;
  }

  return undefined;
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
    const matched = localeFromBrowserTag(tag);
    if (matched) {
      return matched;
    }
  }

  return DEFAULT_LOCALE;
}
