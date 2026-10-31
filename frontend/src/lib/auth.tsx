"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  RoleType,
  Persona,
  DEMO_ROLES,
  OFFICIAL_PERSONAS,
} from "./auth-constants";

export { type RoleType, type Persona, DEMO_ROLES, OFFICIAL_PERSONAS };

interface AuthContextType {
  user: Persona;
  isAuthenticated: boolean;
  login: (idOrEmail: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchPersona: (id: string) => void;
  personas: Persona[];
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: DEMO_ROLES[0],
  isAuthenticated: true,
  login: async () => false,
  logout: async () => {},
  switchPersona: () => {},
  personas: DEMO_ROLES,
  refresh: async () => {},
});

const STORAGE_KEY = "campusos_current_user_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Persona>(DEMO_ROLES[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const refresh = async () => {
    // 1. Immediately read stored ID for instant snappy hydration
    try {
      const storedId = localStorage.getItem(STORAGE_KEY);
      if (storedId) {
        const found = DEMO_ROLES.find(
          (p) =>
            p.id.toLowerCase() === storedId.toLowerCase() ||
            p.email.toLowerCase() === storedId.toLowerCase() ||
            p.role.toLowerCase() === storedId.toLowerCase()
        );
        if (found) {
          setUser(found);
          setIsAuthenticated(true);
        }
      }
    } catch {}

    // 2. Synchronize with server session cookie
    try {
      const res = await fetch("/api/v1/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const found = DEMO_ROLES.find(
            (p) =>
              p.id === data.user.userId ||
              p.email.toLowerCase() === (data.user.email || "").toLowerCase() ||
              p.role === data.user.role
          );
          if (found) {
            setUser(found);
            setIsAuthenticated(true);
            try {
              localStorage.setItem(STORAGE_KEY, found.id);
            } catch {}
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    refresh().finally(() => setIsHydrated(true));
  }, []);

  const login = async (idOrEmail: string, password?: string): Promise<boolean> => {
    const clean = idOrEmail.trim().toLowerCase();
    const found =
      DEMO_ROLES.find(
        (p) =>
          p.id.toLowerCase() === clean ||
          p.email.toLowerCase() === clean ||
          p.role.toLowerCase() === clean ||
          p.label.toLowerCase() === clean
      ) || DEMO_ROLES[0];

    // Optimistically update React state and localStorage immediately
    setUser(found);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY, found.id);
    } catch (e) {
      console.warn("Could not persist auth to localStorage:", e);
    }

    // Synchronize session cookie with backend
    try {
      await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: found.email,
          password: password || found.password || "Coord@2026",
        }),
        credentials: "include",
      });
    } catch (err) {
      console.warn("Backend auth sync warning:", err);
    }

    return true;
  };

  const logout = async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch {}

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setIsAuthenticated(false);
  };

  const switchPersona = (id: string) => {
    const found = DEMO_ROLES.find((p) => p.id === id);
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY, found.id);
      } catch (e) {
        console.warn("Could not persist persona switch:", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        switchPersona,
        personas: DEMO_ROLES,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
