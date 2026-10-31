"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleType =
  | "Admin (Dean's office)"
  | "Department coordinator"
  | "Faculty"
  | "Club representative";

export interface Persona {
  id: string;
  name: string;
  role: RoleType;
  email: string;
  department: string;
  avatar: string;
  badge: string;
  badgeVariant: "cit" | "secondary" | "outline" | "warning";
  canApprove: boolean;
  canChangePriority: boolean;
  canGenerateTimetable: boolean;
  canMoveClasses: boolean;
  whatTheyCanDo: string;
}

export const OFFICIAL_PERSONAS: Persona[] = [
  {
    id: "DEAN-01",
    name: "Prof. S. Mohapatra",
    role: "Admin (Dean's office)",
    email: "dean@cit.edu.in",
    department: "Dean's Office (Academic Affairs)",
    avatar: "SM",
    badge: "Super Admin",
    badgeVariant: "cit",
    canApprove: true,
    canChangePriority: true,
    canGenerateTimetable: true,
    canMoveClasses: true,
    whatTheyCanDo:
      "Everything. Generates the timetable, approves timetable changes and any booking that moves a class, can change the priority order.",
  },
  {
    id: "COORD-CSE",
    name: "Dr. A. Verma",
    role: "Department coordinator",
    email: "coordinator.cse@cit.edu.in",
    department: "Computer Science & Engineering",
    avatar: "AV",
    badge: "Dept Coordinator",
    badgeVariant: "secondary",
    canApprove: true,
    canChangePriority: false,
    canGenerateTimetable: false,
    canMoveClasses: false,
    whatTheyCanDo:
      "Requests changes to their department's sessions, books rooms for department events, approves bookings of their department's labs.",
  },
  {
    id: "FAC-01",
    name: "Dr. Rajesh Sharma",
    role: "Faculty",
    email: "fac01@cit.edu.in",
    department: "Computer Science & Engineering",
    avatar: "RS",
    badge: "Faculty Member",
    badgeVariant: "outline",
    canApprove: false,
    canChangePriority: false,
    canGenerateTimetable: false,
    canMoveClasses: false,
    whatTheyCanDo:
      "Views their own timetable, marks unavailability, requests extra or moved sessions.",
  },
  {
    id: "CLUB-LIT-01",
    name: "Aarav Patel",
    role: "Club representative",
    email: "club.lit@cit.edu.in",
    department: "Literary Society (Spectra Committee)",
    avatar: "AP",
    badge: "Club Representative",
    badgeVariant: "warning",
    canApprove: false,
    canChangePriority: false,
    canGenerateTimetable: false,
    canMoveClasses: false,
    whatTheyCanDo:
      "Submits and cancels venue requests, and sees the status and reason for each.",
  },
];

interface AuthContextType {
  user: Persona;
  isAuthenticated: boolean;
  login: (idOrEmail: string) => boolean;
  logout: () => void;
  switchPersona: (id: string) => void;
  personas: Persona[];
}

const AuthContext = createContext<AuthContextType>({
  user: OFFICIAL_PERSONAS[0],
  isAuthenticated: true,
  login: () => false,
  logout: () => {},
  switchPersona: () => {},
  personas: OFFICIAL_PERSONAS,
});

const STORAGE_KEY = "campusos_current_user_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Persona>(OFFICIAL_PERSONAS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY);
      if (storedId) {
        const found = OFFICIAL_PERSONAS.find(
          (p) => p.id === storedId || p.email.toLowerCase() === storedId.toLowerCase()
        );
        if (found) {
          setUser(found);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.warn("Could not read auth state from localStorage:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const login = (idOrEmail: string): boolean => {
    const clean = idOrEmail.trim().toLowerCase();
    const found = OFFICIAL_PERSONAS.find(
      (p) => p.id.toLowerCase() === clean || p.email.toLowerCase() === clean
    );
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY, found.id);
      } catch (e) {
        console.warn("Could not persist auth to localStorage:", e);
      }
      return true;
    }
    // Fallback: if not an exact match, log in as Dean
    setUser(OFFICIAL_PERSONAS[0]);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY, OFFICIAL_PERSONAS[0].id);
    } catch {}
    return true;
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setIsAuthenticated(false);
  };

  const switchPersona = (id: string) => {
    const found = OFFICIAL_PERSONAS.find((p) => p.id === id);
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
        personas: OFFICIAL_PERSONAS,
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
