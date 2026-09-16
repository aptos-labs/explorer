import type {DailyAnalyticsData} from "../../api/hooks/useGetAnalyticsData";
import {formatCompactNumber, formatMonthDay} from "../../i18n/format";
import {DEFAULT_LOCALE} from "../../i18n/locales";

export function numberFormatter(
  num: number,
  digits: number,
  locale: string = DEFAULT_LOCALE,
) {
  return formatCompactNumber(num, locale, digits);
}

export function getLabels(
  data: DailyAnalyticsData[],
  days: number,
  locale: string = DEFAULT_LOCALE,
): string[] {
  return data.slice(-days).map((dailyData) => {
    if (!dailyData.date) return "";
    return formatMonthDay(new Date(`${dailyData.date}T00:00:00.000Z`), locale);
  });
}
