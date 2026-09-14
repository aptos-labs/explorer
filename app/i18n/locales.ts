export const SUPPORTED_LOCALES = ["en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalePreference = "auto" | SupportedLocale;

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const LOCALE_META: Record<
  SupportedLocale,
  {nativeName: string; ogLocale: string; dir: "ltr" | "rtl"}
> = {
  en: {nativeName: "English", ogLocale: "en_US", dir: "ltr"},
};
