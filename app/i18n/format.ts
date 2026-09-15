import {LOCALE_META} from "./locales";

function intlLocale(locale: string): string {
  if (Object.hasOwn(LOCALE_META, locale)) {
    return LOCALE_META[locale as keyof typeof LOCALE_META].htmlLang;
  }
  return locale;
}

export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatInteger(value: number, locale: string): string {
  return formatNumber(value, locale, {maximumFractionDigits: 0});
}

export function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}
