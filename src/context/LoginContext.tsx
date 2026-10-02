"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axiosClient from "@/utils/axiosClient";

export type UserRole = "HEALTH_WORKER" | "DOCTOR";

export interface SafeUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CurrentUserResponse {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toSafeUser(profile: CurrentUserResponse, role: UserRole): SafeUser {
  return {
    id: profile.id,
    userId: profile.user_id,
    name: profile.name,
    email: profile.email,
    role,
    isActive: profile.isActive,
    lastLoginAt: profile.lastLoginAt,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function normalizeRole(role: string): UserRole | null {
  if (role === "DOCTOR" || role === "DOCTER") return "DOCTOR";
  if (role === "HEALTH_WORKER") return "HEALTH_WORKER";
  return null;
}

interface LoginContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SafeUser | null;
  loginError: string | null;
  login: (
    userId: string,
    password: string
  ) => Promise<{ success: boolean; user?: SafeUser; error?: string }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export function LoginProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Restore authenticated session on app load using GET /auth/me
  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get<{
        success: boolean;
        data: CurrentUserResponse;
      }>("/auth/me");

      if (response.data?.success && response.data.data) {
        const normalizedRole = normalizeRole(response.data.data.role);

        if (!normalizedRole) {
          setUser(null);
          return;
        }

        setUser(toSafeUser(response.data.data, normalizedRole));
      } else {
        setUser(null);
      }
    } catch {
      // 401 or network error on unauthenticated visit
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Login flow: POST /auth/login -> GET /auth/me -> store user
  const login = useCallback(
    async (
      userId: string,
      password: string
    ): Promise<{ success: boolean; user?: SafeUser; error?: string }> => {
      setLoginError(null);
      try {
        // 1. Submit credentials
        const loginRes = await axiosClient.post("/auth/login", {
          user_id: userId,
          password: password,
        });

        if (!loginRes.data?.success) {
          const errMsg = loginRes.data?.message || "Login failed";
          setLoginError(errMsg);
          return { success: false, error: errMsg };
        }

        // 2. Fetch authenticated user profile
        const meRes = await axiosClient.get<{
          success: boolean;
          data: CurrentUserResponse;
        }>("/auth/me");

        if (meRes.data?.success && meRes.data.data) {
          const normalizedRole = normalizeRole(meRes.data.data.role);

          if (!normalizedRole) {
            const message = "Your account has an unsupported role. Please contact an administrator.";
            setUser(null);
            setLoginError(message);
            return { success: false, error: message };
          }

          const safeUser = toSafeUser(meRes.data.data, normalizedRole);

          setUser(safeUser);
          return { success: true, user: safeUser };
        } else {
          throw new Error("Unable to retrieve user profile");
        }
      } catch (err: any) {
        const message =
          err.message || "Invalid credentials. Please verify your Doctor ID or Health Worker ID.";
        setLoginError(message);
        return { success: false, error: message };
      }
    },
    []
  );

  // Logout flow: clear user state & redirect
  const logout = useCallback(async () => {
    try {
      // Optional backend logout if available
      await axiosClient.post("/auth/logout").catch(() => { });
    } finally {
      setUser(null);
      setLoginError(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setLoginError(null);
  }, []);

  return (
    <LoginContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        loginError,
        login,
        logout,
        restoreSession,
        clearError,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}

export function useLogin() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLogin must be used inside LoginProvider");
  }
  return context;
}