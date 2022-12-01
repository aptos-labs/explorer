import {DailyAnalyticsData} from "../../api/hooks/useGetAnalyticsData";

export function getLabels(data: DailyAnalyticsData[], days: number): string[] {
  return data.slice(-days).map((dailyData) => dailyData.date.substring(5));
}
