import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

export function useApiQuery<T = any>(path: string | null, params?: Record<string, any>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<string | null>(null);

  const key = path ? path + JSON.stringify(params || {}) : "";

  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true); setError(null);
    try {
      const res = await api.get<T>(path, params);
      setData(res);
    } catch (e: any) {
      setError(e instanceof ApiError ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch, setData };
}

// Normalize list responses: accepts arrays or { data: [...] } or { items: [...] }
export function asList<T = any>(d: any): T[] {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.data)) return d.data;
  if (Array.isArray(d.items)) return d.items;
  if (Array.isArray(d.results)) return d.results;
  return [];
}

export function asObj<T = any>(d: any): T {
  if (!d) return {} as T;
  if (d.data && typeof d.data === "object" && !Array.isArray(d.data)) return d.data;
  return d;
}
