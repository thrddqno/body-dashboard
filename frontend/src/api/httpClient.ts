import type { BackendApiError, RequestOptions } from "@/types/api";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  public readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    public readonly status: number,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

async function readErrorPayload(response: Response): Promise<BackendApiError | null> {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as BackendApiError;
  } catch {
    return null;
  }
}

export async function requestJson<T>(
  path: string,
  init?: RequestOptions,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new NetworkError("Unable to reach the API.");
  }

  if (!response.ok) {
    const payload = await readErrorPayload(response);

    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
      payload?.fieldErrors ?? {},
    );
  }

  return (await response.json()) as T;
}

export function toJsonBody<T>(value: T): string {
  return JSON.stringify(value);
}
