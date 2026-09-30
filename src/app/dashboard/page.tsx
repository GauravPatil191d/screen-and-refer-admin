"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/context/LoginContext";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user } = useLogin();

  useEffect(() => {
    if (user?.role === "HEALTH_WORKER") {
      router.replace("/health-worker/dashboard");
    } else {
      router.replace("/doctor/dashboard");
    }
  }, [user, router]);

  return null;
}
