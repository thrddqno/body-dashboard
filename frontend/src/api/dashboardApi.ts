import { requestJson } from "@/api/httpClient";
import type { DashboardResponse } from "@/types/dashboard";

export function getDashboard(signal?: AbortSignal): Promise<DashboardResponse> {
  return requestJson<DashboardResponse>("/dashboard", { signal });
}
