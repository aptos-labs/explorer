import {LOCALE_META} from "./locales";

export function intlLocale(locale: string): string {
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

export function formatBigInt(
  value: bigint,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatIntegerString(value: string, locale: string): string {
  const trimmed = value.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return formatBigInt(BigInt(trimmed), locale);
  }
  const num = Number(trimmed);
  if (Number.isNaN(num)) return value;
  return formatNumber(num, locale);
}

export function formatCompactNumber(
  value: number,
  locale: string,
  fractionDigits = 1,
): string {
  return formatNumber(value, locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: fractionDigits,
  });
}

export function decimalSeparator(locale: string): string {
  const parts = new Intl.NumberFormat(intlLocale(locale)).formatToParts(1.1);
  return parts.find((part) => part.type === "decimal")?.value ?? ".";
}

export function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

const TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  timeZone: "UTC",
  timeZoneName: "short",
};

export function formatTimestamp(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(
      intlLocale(locale),
      TIMESTAMP_OPTIONS,
    ).format(date);
  } catch {
    return new Intl.DateTimeFormat(intlLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    }).format(date);
  }
}

export function formatMonthDay(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRelativeTime(
  date: Date,
  locale: string,
  now: Date = new Date(),
): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), {
    numeric: "always",
  });
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(seconds / 3600);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(seconds / 86400);
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(Math.round(days / 365), "year");
}
