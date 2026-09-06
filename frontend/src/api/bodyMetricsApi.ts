import { requestJson, toJsonBody } from "@/api/httpClient";
import type { BodyMetric, BodyMetricRequest } from "@/types/bodyMetric";

export function listBodyMetrics(): Promise<BodyMetric[]> {
  return requestJson<BodyMetric[]>("/body-metrics");
}

export function listBodyMetricsInRange(
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<BodyMetric[]> {
  return requestJson<BodyMetric[]>(`/body-metrics?from=${from}&to=${to}`, { signal });
}

export function createBodyMetric(request: BodyMetricRequest): Promise<BodyMetric> {
  return requestJson<BodyMetric>("/body-metrics", {
    method: "POST",
    body: toJsonBody(request),
  });
}
