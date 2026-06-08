// Central API client for School ERP
const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000/api";

const TOKEN_KEY = "erp_access_token";

export const tokenStore = {
  get: () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

type Method = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function request<T = any>(
  method: Method,
  path: string,
  body?: any,
  opts?: { params?: Record<string, any> }
): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let url = `${BASE_URL}${path}`;
  if (opts?.params) {
    const qs = new URLSearchParams();
    Object.entries(opts.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
    });
    const s = qs.toString();
    if (s) url += `?${s}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e: any) {
    throw new ApiError(e?.message || "Network error", 0);
  }

  if (res.status === 401) {
    tokenStore.clear();
    onUnauthorized?.();
    throw new ApiError("Unauthorized", 401);
  }

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(typeof msg === "string" ? msg : JSON.stringify(msg), res.status, data);
  }
  return data as T;
}

export const api = {
  get: <T = any>(path: string, params?: Record<string, any>) => request<T>("GET", path, undefined, { params }),
  post: <T = any>(path: string, body?: any) => request<T>("POST", path, body),
  patch: <T = any>(path: string, body?: any) => request<T>("PATCH", path, body),
  put: <T = any>(path: string, body?: any) => request<T>("PUT", path, body),
  delete: <T = any>(path: string) => request<T>("DELETE", path),
};
