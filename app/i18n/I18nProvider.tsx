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
  formatBigInt as formatBigIntForLocale,
  formatCompactNumber as formatCompactNumberForLocale,
  formatDateTime as formatDateTimeForLocale,
  formatInteger as formatIntegerForLocale,
  formatIntegerString as formatIntegerStringForLocale,
  formatMonthDay as formatMonthDayForLocale,
  formatNumber as formatNumberForLocale,
  formatRelativeTime as formatRelativeTimeForLocale,
  formatTimestamp as formatTimestampForLocale,
} from "./format";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  type LocalePreference,
  type SupportedLocale,
} from "./locales";
import {en} from "./messages/en";
import {loadMessageCatalog} from "./messages/loaders";
import {useResolvedTimestampTimeZone} from "./timestampTimeZone";
import {
  type MessageCatalog,
  type MessageTree,
  translate,
  translateList,
} from "./translate";

export type TranslateVars = Record<string, string | number>;

export type TFunction = (key: string, vars?: TranslateVars) => string;

export type TListFunction = (key: string, vars?: TranslateVars) => string[];

export interface I18nFormatters {
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatInteger: (value: number) => string;
  formatBigInt: (value: bigint) => string;
  formatIntegerString: (value: string) => string;
  formatCompactNumber: (value: number, fractionDigits?: number) => string;
  formatDateTime: (date: Date) => string;
  formatTimestamp: (date: Date) => string;
  formatMonthDay: (date: Date) => string;
  formatRelativeTime: (date: Date, now?: Date) => string;
}

export interface I18nContextValue extends I18nFormatters {
  locale: SupportedLocale;
  localePreference: LocalePreference;
  /** `UTC` until hydration, then the browser zone when local timestamps are on. */
  timestampTimeZone: string;
  t: TFunction;
  tList: TListFunction;
}

type Translator = {t: TFunction; tList: TListFunction} & I18nFormatters;

function catalogsFor(
  locale: SupportedLocale,
  messages: MessageTree,
): MessageCatalog[] {
  const primary: MessageCatalog = {locale, messages};
  if (locale === DEFAULT_LOCALE) {
    return [primary];
  }
  return [primary, {locale: DEFAULT_LOCALE, messages: en}];
}

export function createTranslator(locale: typeof DEFAULT_LOCALE): Translator;
export function createTranslator(
  locale: SupportedLocale,
  messages: MessageTree,
): Translator;
export function createTranslator(
  locale: SupportedLocale,
  messages: MessageTree = en,
): Translator {
  const catalogs = catalogsFor(locale, messages);
  return {
    t: (key, vars) => translate(catalogs, key, vars),
    tList: (key, vars) => translateList(catalogs, key, vars),
    formatNumber: (value, options) =>
      formatNumberForLocale(value, locale, options),
    formatInteger: (value) => formatIntegerForLocale(value, locale),
    formatBigInt: (value) => formatBigIntForLocale(value, locale),
    formatIntegerString: (value) => formatIntegerStringForLocale(value, locale),
    formatCompactNumber: (value, fractionDigits) =>
      formatCompactNumberForLocale(value, locale, fractionDigits),
    formatDateTime: (date) => formatDateTimeForLocale(date, locale),
    formatTimestamp: (date) => formatTimestampForLocale(date, locale),
    formatMonthDay: (date) => formatMonthDayForLocale(date, locale),
    formatRelativeTime: (date, now) =>
      formatRelativeTimeForLocale(date, locale, now),
  };
}

const englishTranslator = createTranslator(DEFAULT_LOCALE);

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const fallbackValue: I18nContextValue = {
  locale: DEFAULT_LOCALE,
  localePreference: "auto",
  timestampTimeZone: "UTC",
  t: englishTranslator.t,
  tList: englishTranslator.tList,
  formatNumber: englishTranslator.formatNumber,
  formatInteger: englishTranslator.formatInteger,
  formatBigInt: englishTranslator.formatBigInt,
  formatIntegerString: englishTranslator.formatIntegerString,
  formatCompactNumber: englishTranslator.formatCompactNumber,
  formatDateTime: englishTranslator.formatDateTime,
  formatTimestamp: englishTranslator.formatTimestamp,
  formatMonthDay: englishTranslator.formatMonthDay,
  formatRelativeTime: englishTranslator.formatRelativeTime,
};

type ActiveCatalog = {locale: SupportedLocale; messages: MessageTree};

const englishCatalog: ActiveCatalog = {locale: DEFAULT_LOCALE, messages: en};

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

  const requestedLocale = useMemo(
    () => resolveLocale(settings.localePreference, browserLanguages),
    [settings.localePreference, browserLanguages],
  );

  // Stays on the previous catalog until the requested one has loaded, so text
  // and number/date formatting always switch together.
  const [activeCatalog, setActiveCatalog] =
    useState<ActiveCatalog>(englishCatalog);

  useEffect(() => {
    let cancelled = false;
    loadMessageCatalog(requestedLocale).then(
      (messages) => {
        if (cancelled) return;
        setActiveCatalog((current) =>
          current.locale === requestedLocale
            ? current
            : {locale: requestedLocale, messages},
        );
      },
      () => {
        if (!cancelled) setActiveCatalog(englishCatalog);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [requestedLocale]);

  const {locale} = activeCatalog;
  const translator = useMemo(
    () => createTranslator(activeCatalog.locale, activeCatalog.messages),
    [activeCatalog],
  );
  const timestampTimeZone = useResolvedTimestampTimeZone(
    settings.displayLocalTimestamps,
  );

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
      timestampTimeZone,
      t: translator.t,
      tList: translator.tList,
      formatNumber: translator.formatNumber,
      formatInteger: translator.formatInteger,
      formatBigInt: translator.formatBigInt,
      formatIntegerString: translator.formatIntegerString,
      formatCompactNumber: translator.formatCompactNumber,
      formatDateTime: (date) =>
        formatDateTimeForLocale(date, locale, timestampTimeZone),
      formatTimestamp: (date) =>
        formatTimestampForLocale(date, locale, timestampTimeZone),
      // Chart day labels are UTC calendar dates, not instants to shift.
      formatMonthDay: translator.formatMonthDay,
      formatRelativeTime: translator.formatRelativeTime,
    }),
    [locale, settings.localePreference, timestampTimeZone, translator],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  return useContext(I18nContext) ?? fallbackValue;
}
