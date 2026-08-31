import { requestJson, toJsonBody } from "@/api/httpClient";
import type { WeeklyAiAnalysis } from "@/types/aiAnalysis";

export function generateWeeklyAiAnalysis(): Promise<WeeklyAiAnalysis> {
  return requestJson<WeeklyAiAnalysis>("/ai-analysis/weekly", {
    method: "POST",
    body: toJsonBody({}),
  });
}

export function getLatestWeeklyAiAnalysis(signal?: AbortSignal): Promise<WeeklyAiAnalysis> {
  return requestJson<WeeklyAiAnalysis>("/ai-analysis/weekly/latest", { signal });
}
