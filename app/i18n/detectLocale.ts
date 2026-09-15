import {
  DEFAULT_LOCALE,
  type LocalePreference,
  type SupportedLocale,
  SUPPORTED_LOCALES,
} from "./locales";

/** Browser tags whose primary subtag should use another registered catalog. */
const BROWSER_PRIMARY_ALIASES: Record<string, SupportedLocale> = {
  tl: "fil",
  iw: "he",
};

/** Regions that use European Portuguese (including lusophone Africa). */
const EUROPEAN_PORTUGUESE_REGIONS = new Set([
  "pt",
  "ao",
  "mz",
  "cv",
  "gw",
  "st",
  "gq",
  "tl",
]);

export function canonicalSupportedLocale(
  value: string,
): SupportedLocale | undefined {
  const normalized = value.trim().toLowerCase().replaceAll("_", "-");
  return SUPPORTED_LOCALES.find(
    (locale) => locale.toLowerCase() === normalized,
  );
}

export function isSupportedLocale(value: string): value is SupportedLocale {
  return canonicalSupportedLocale(value) !== undefined;
}

export function normalizeLocalePreference(value: unknown): LocalePreference {
  if (value === "auto") {
    return "auto";
  }
  if (typeof value === "string") {
    return canonicalSupportedLocale(value) ?? "auto";
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

function portugueseCatalog(normalized: string): SupportedLocale {
  const region = normalized.split("-")[1];
  if (region && EUROPEAN_PORTUGUESE_REGIONS.has(region)) {
    return "pt-PT";
  }
  return "pt";
}

/**
 * Map a BCP 47 language tag from the browser to a registered catalog, if any.
 */
export function localeFromBrowserTag(tag: string): SupportedLocale | undefined {
  const normalized = normalizeBrowserTag(tag);
  if (!normalized) {
    return undefined;
  }

  const exact = canonicalSupportedLocale(normalized);
  if (exact) {
    return exact;
  }

  const primary = normalized.split("-")[0];
  if (!primary) {
    return undefined;
  }

  if (primary === "zh") {
    return isTraditionalChinese(normalized) ? "zh-Hant" : "zh";
  }

  if (primary === "pt") {
    return portugueseCatalog(normalized);
  }

  const aliased = BROWSER_PRIMARY_ALIASES[primary];
  if (aliased) {
    return aliased;
  }

  return canonicalSupportedLocale(primary);
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
  if (preference !== "auto") {
    const explicit = canonicalSupportedLocale(preference);
    if (explicit) {
      return explicit;
    }
  }

  for (const tag of browserLanguages) {
    const matched = localeFromBrowserTag(tag);
    if (matched) {
      return matched;
    }
  }

  return DEFAULT_LOCALE;
}
