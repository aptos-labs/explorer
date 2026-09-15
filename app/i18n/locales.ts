export const SUPPORTED_LOCALES = [
  "en",
  "zh",
  "ko",
  "ja",
  "es",
  "pt",
  "vi",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalePreference = "auto" | SupportedLocale;

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const LOCALE_META: Record<
  SupportedLocale,
  {nativeName: string; ogLocale: string; dir: "ltr" | "rtl"}
> = {
  en: {nativeName: "English", ogLocale: "en_US", dir: "ltr"},
  zh: {nativeName: "简体中文", ogLocale: "zh_CN", dir: "ltr"},
  ko: {nativeName: "한국어", ogLocale: "ko_KR", dir: "ltr"},
  ja: {nativeName: "日本語", ogLocale: "ja_JP", dir: "ltr"},
  es: {nativeName: "Español", ogLocale: "es_ES", dir: "ltr"},
  pt: {nativeName: "Português", ogLocale: "pt_BR", dir: "ltr"},
  vi: {nativeName: "Tiếng Việt", ogLocale: "vi_VN", dir: "ltr"},
};
