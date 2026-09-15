import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {useExplorerSettings} from "../settings/ExplorerSettings";
import {resolveLocale} from "./detectLocale";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  type LocalePreference,
  type SupportedLocale,
} from "./locales";
import {messageCatalogs} from "./messages";
import {type MessageCatalog, translate, translateList} from "./translate";

export type TranslateVars = Record<string, string | number>;

export type TFunction = (key: string, vars?: TranslateVars) => string;

export type TListFunction = (key: string, vars?: TranslateVars) => string[];

export interface I18nContextValue {
  locale: SupportedLocale;
  localePreference: LocalePreference;
  t: TFunction;
  tList: TListFunction;
}

function catalogsFor(locale: SupportedLocale): MessageCatalog[] {
  const primary: MessageCatalog = {
    locale,
    messages: messageCatalogs[locale],
  };
  if (locale === DEFAULT_LOCALE) {
    return [primary];
  }
  return [
    primary,
    {locale: DEFAULT_LOCALE, messages: messageCatalogs[DEFAULT_LOCALE]},
  ];
}

export function createTranslator(locale: SupportedLocale): {
  t: TFunction;
  tList: TListFunction;
} {
  const catalogs = catalogsFor(locale);
  return {
    t: (key, vars) => translate(catalogs, key, vars),
    tList: (key, vars) => translateList(catalogs, key, vars),
  };
}

const englishTranslator = createTranslator(DEFAULT_LOCALE);

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const fallbackValue: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  localePreference: "auto",
  t: englishTranslator.t,
  tList: englishTranslator.tList,
};

function readBrowserLanguages(): string[] {
  if (typeof navigator === "undefined") {
    return [];
  }
  if (navigator.languages && navigator.languages.length > 0) {
    return [...navigator.languages];
  }
  if (navigator.language) {
    return [navigator.language];
  }
  return [];
}

export function I18nProvider({children}: {children: ReactNode}) {
  const {settings} = useExplorerSettings();
  const [browserLanguages, setBrowserLanguages] = useState<string[]>([]);

  useEffect(() => {
    setBrowserLanguages(readBrowserLanguages());
  }, []);

  const locale = useMemo(
    () => resolveLocale(settings.localePreference, browserLanguages),
    [settings.localePreference, browserLanguages],
  );

  const translator = useMemo(() => createTranslator(locale), [locale]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.lang = LOCALE_META[locale].htmlLang;
    document.documentElement.dir = LOCALE_META[locale].dir;
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute("content", LOCALE_META[locale].ogLocale);
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      localePreference: settings.localePreference,
      t: translator.t,
      tList: translator.tList,
    }),
    [locale, settings.localePreference, translator],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  return useContext(I18nContext) ?? fallbackValue;
}
