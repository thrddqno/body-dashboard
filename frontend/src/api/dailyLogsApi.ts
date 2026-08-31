import { requestJson, toJsonBody } from "@/api/httpClient";
import type { DailyLog, DailyLogRequest } from "@/types/dailyLog";

export function getDailyLog(date: string, signal?: AbortSignal): Promise<DailyLog> {
  return requestJson<DailyLog>(`/daily-logs/${date}`, { signal });
}

export function saveDailyLog(
  date: string,
  request: DailyLogRequest,
): Promise<DailyLog> {
  return requestJson<DailyLog>(`/daily-logs/${date}`, {
    method: "PUT",
    body: toJsonBody(request),
  });
}
