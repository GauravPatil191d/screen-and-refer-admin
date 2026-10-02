"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLogin } from "@/context/LoginContext";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { LoginContainer } from "@/containers/login-container";
import { CreateUserContainer } from "@/containers/create-user-container";

export const CMSShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useLogin();
  const isPublicRoute = pathname === "/login" || pathname === "/create-user";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (!isPublicRoute) {
        router.replace("/login");
      }
      return;
    }

    // Role-based route guard
    if (user?.role === "HEALTH_WORKER") {
      if (isPublicRoute || pathname === "/" || pathname.startsWith("/doctor")) {
        router.replace("/health-worker/dashboard");
      }
    } else if (user?.role === "DOCTOR") {
      if (isPublicRoute || pathname === "/" || pathname.startsWith("/health-worker")) {
        router.replace("/doctor/dashboard");
      }
    }
  }, [pathname, isAuthenticated, isLoading, user, router, isPublicRoute]);

  // Loading state during initial session restoration
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F9FF] text-[#172B4D] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#D9E3F0] border-t-[#123B8C]"></div>
        <span className="text-xs font-semibold text-[#123B8C] tracking-wide">
          VERIFYING CLINICAL SESSION...
        </span>
      </div>
    );
  }

  // Unauthenticated view
  if (!isAuthenticated && pathname === "/create-user") {
    return <CreateUserContainer />;
  }

  if (!isAuthenticated || pathname === "/login") {
    return <LoginContainer />;
  }

  return (
    <div className="flex min-h-screen bg-[#F5F9FF] text-[#172B4D]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
