import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const data = await api.me();

        if (!active) {
          return;
        }

        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user || null);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        if (!active) {
          return;
        }

        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(credentials) {
    const data = await api.login(credentials);
    setIsAuthenticated(true);
    setUser(data.user || null);
    return data;
  }

  async function logout() {
    await api.logout();
    setIsAuthenticated(false);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      login,
      logout,
    }),
    [isLoading, isAuthenticated, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
