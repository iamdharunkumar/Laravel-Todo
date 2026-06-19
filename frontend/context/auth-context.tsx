"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, AuthResponse } from "@/types";
import { apiFetch } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Initial Load: Restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("todo_api_token");
    if (storedToken) {
      setToken(storedToken);
      // Fetch profile to verify token
      apiFetch<{ user: User }>("/me")
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          // Token is expired or invalid
          localStorage.removeItem("todo_api_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // 2. Client-side Route Guards & Redirection
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === "/login" || pathname === "/register";

    if (!token && !isAuthRoute) {
      router.replace("/login");
    } else if (token && isAuthRoute) {
      router.replace("/");
    }
  }, [token, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("todo_api_token", res.token);
    setToken(res.token);
    setUser(res.user);
    router.replace("/");
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiFetch<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: password, // Laravel expects confirmation for register password rules
      }),
    });

    localStorage.setItem("todo_api_token", res.token);
    setToken(res.token);
    setUser(res.user);
    router.replace("/");
  };

  const logout = async () => {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch {
      // Ignore logout API failures, ensure local state resets
    } finally {
      localStorage.removeItem("todo_api_token");
      setToken(null);
      setUser(null);
      router.replace("/login");
    }
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
