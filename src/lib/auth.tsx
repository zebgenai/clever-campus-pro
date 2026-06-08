import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore, setUnauthorizedHandler } from "./api";

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  school?: { id?: string; name?: string } | null;
  schoolName?: string;
  [k: string]: any;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const data = await api.get<any>("/auth/me");
      setUser(data?.user || data?.data || data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    });
    (async () => {
      if (tokenStore.get()) {
        await fetchMe();
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<any>("/auth/login", { email, password });
    const token = res?.accessToken || res?.token || res?.data?.accessToken;
    if (!token) throw new Error("No access token returned");
    tokenStore.set(token);
    await fetchMe();
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  return (
    <Ctx.Provider value={{ user, loading, login, logout, refresh: fetchMe }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
