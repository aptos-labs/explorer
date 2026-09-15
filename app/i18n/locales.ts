export const SUPPORTED_LOCALES = [
  "en",
  "zh",
  "fil",
  "es",
  "fr",
  "de",
  "ja",
  "ko",
  "ru",
  "pt",
  "ar",
  "hi",
  "th",
  "id",
  "vi",
  "tr",
  "bn",
  "sw",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalePreference = "auto" | SupportedLocale;

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const LOCALE_META: Record<
  SupportedLocale,
  {
    nativeName: string;
    ogLocale: string;
    htmlLang: string;
    dir: "ltr" | "rtl";
  }
> = {
  en: {
    nativeName: "English",
    ogLocale: "en_US",
    htmlLang: "en",
    dir: "ltr",
  },
  zh: {
    nativeName: "简体中文",
    ogLocale: "zh_CN",
    htmlLang: "zh-CN",
    dir: "ltr",
  },
  fil: {
    nativeName: "Filipino",
    ogLocale: "fil_PH",
    htmlLang: "fil",
    dir: "ltr",
  },
  es: {
    nativeName: "Español",
    ogLocale: "es_ES",
    htmlLang: "es",
    dir: "ltr",
  },
  fr: {
    nativeName: "Français",
    ogLocale: "fr_FR",
    htmlLang: "fr",
    dir: "ltr",
  },
  de: {
    nativeName: "Deutsch",
    ogLocale: "de_DE",
    htmlLang: "de",
    dir: "ltr",
  },
  ja: {
    nativeName: "日本語",
    ogLocale: "ja_JP",
    htmlLang: "ja",
    dir: "ltr",
  },
  ko: {
    nativeName: "한국어",
    ogLocale: "ko_KR",
    htmlLang: "ko",
    dir: "ltr",
  },
  ru: {
    nativeName: "Русский",
    ogLocale: "ru_RU",
    htmlLang: "ru",
    dir: "ltr",
  },
  pt: {
    nativeName: "Português (Brasil)",
    ogLocale: "pt_BR",
    htmlLang: "pt-BR",
    dir: "ltr",
  },
  ar: {
    nativeName: "العربية",
    ogLocale: "ar_SA",
    htmlLang: "ar",
    dir: "rtl",
  },
  hi: {
    nativeName: "हिन्दी",
    ogLocale: "hi_IN",
    htmlLang: "hi",
    dir: "ltr",
  },
  th: {
    nativeName: "ไทย",
    ogLocale: "th_TH",
    htmlLang: "th",
    dir: "ltr",
  },
  id: {
    nativeName: "Bahasa Indonesia",
    ogLocale: "id_ID",
    htmlLang: "id",
    dir: "ltr",
  },
  vi: {
    nativeName: "Tiếng Việt",
    ogLocale: "vi_VN",
    htmlLang: "vi",
    dir: "ltr",
  },
  tr: {
    nativeName: "Türkçe",
    ogLocale: "tr_TR",
    htmlLang: "tr",
    dir: "ltr",
  },
  bn: {
    nativeName: "বাংলা",
    ogLocale: "bn_BD",
    htmlLang: "bn",
    dir: "ltr",
  },
  sw: {
    nativeName: "Kiswahili",
    ogLocale: "sw_KE",
    htmlLang: "sw",
    dir: "ltr",
  },
};
