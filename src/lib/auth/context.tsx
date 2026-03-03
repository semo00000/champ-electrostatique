"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { account } from "@/lib/appwrite";
import type { Models } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    const session = await account.get();
    setUser(session);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    await account.create("unique()", email, password, name);
    await account.createEmailPasswordSession(email, password);
    const session = await account.get();
    setUser(session);
  }, []);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession("current");
    } catch {
      // Session may already be expired
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
