export const SUPPORTED_LOCALES = ["en", "zh"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalePreference = "auto" | SupportedLocale;

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const LOCALE_META: Record<
  SupportedLocale,
  {nativeName: string; ogLocale: string; dir: "ltr" | "rtl"}
> = {
  en: {nativeName: "English", ogLocale: "en_US", dir: "ltr"},
  zh: {nativeName: "简体中文", ogLocale: "zh_CN", dir: "ltr"},
};
