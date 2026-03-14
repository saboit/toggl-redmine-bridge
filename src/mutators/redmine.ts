type RequestConfig = {
  url: string;
  method: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  responseType?: string;
};

let baseURL = "";
let authorization = "";

export const configureRedmine = (options: {
  baseURL: string;
  authorization: string;
}) => {
  baseURL = options.baseURL;
  authorization = options.authorization;
};

function toQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      }
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}

export const redmineAxios = async <T>(
  config: RequestConfig,
  options?: RequestInit
): Promise<T> => {
  const { url, method, params, data, headers } = config;

  const qs = params ? toQueryString(params) : "";
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const response = await fetch(baseURL + url + qs, {
    method: method.toUpperCase(),
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(authorization ? { Authorization: authorization } : {}),
      ...headers,
    },
    body: data != null ? (isFormData ? (data as FormData) : JSON.stringify(data)) : undefined,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) return undefined as unknown as T;

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as T;
};
