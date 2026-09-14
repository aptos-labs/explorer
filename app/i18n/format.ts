export function formatInteger(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}
