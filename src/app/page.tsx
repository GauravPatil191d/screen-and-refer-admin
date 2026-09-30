"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/context/LoginContext";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useLogin();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      if (user.role === "HEALTH_WORKER") {
        router.replace("/health-worker/dashboard");
      } else {
        router.replace("/doctor/dashboard");
      }
    } else {
      router.replace("/login");
    }
  }, [user, isAuthenticated, isLoading, router]);

  return null;
}
