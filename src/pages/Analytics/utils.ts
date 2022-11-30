import {DailyActiveUserData} from "../../api/hooks/useGetAnalyticsData";

export function getLabels(data: DailyActiveUserData[], days: number): string[] {
  return data
    .slice(-days)
    .map((dau: DailyActiveUserData) => dau.date.substring(5));
}

export function getDataset(
  data: DailyActiveUserData[],
  days: number,
): number[] {
  return data
    .slice(-days)
    .map((dau: DailyActiveUserData) => dau.daily_active_user_count);
}
