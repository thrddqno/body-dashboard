import { requestJson } from "@/api/httpClient";
import type { WeeklyAnalytics } from "@/types/analytics";

export function getWeeklyAnalytics(signal?: AbortSignal): Promise<WeeklyAnalytics> {
  return requestJson<WeeklyAnalytics>("/analytics/weekly", { signal });
}
