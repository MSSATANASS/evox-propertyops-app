import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError, apiRequest } from "../../lib/api-client";

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  ownerSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface LocalAuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
}

const LocalAuthContext = createContext<LocalAuthContextValue | null>(null);

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const result = await apiRequest<{ user: AuthUser }>("/api/auth/me");
      setUser(result.user);
      setStatus("authenticated");
      return result.user;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        setUser(null);
      } else {
        setUser(null);
      }
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(result.user);
    setStatus("authenticated");
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest<void>("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, status, login, logout, refresh }),
    [user, status, login, logout, refresh],
  );

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth(): LocalAuthContextValue {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error("useLocalAuth must be used inside LocalAuthProvider");
  }
  return context;
}
