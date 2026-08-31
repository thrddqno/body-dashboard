export interface BackendApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors: Record<string, string>;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
}
