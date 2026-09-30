"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, ShieldCheck, UserCheck, Stethoscope } from "lucide-react";
import { useLogin } from "@/context/LoginContext";
import "./style.css";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user } = useLogin();
  const isDoctor = user?.role === "DOCTOR";

  const getPageTitle = () => {
    if (pathname.includes("/health-worker/dashboard")) return "Health Worker Dashboard";
    if (pathname.includes("/health-worker/patients/new")) return "Register New Patient";
    if (pathname.includes("/screening/new")) return "Conduct Patient Screening";
    if (pathname.includes("/result")) return "Screening Outcome";
    if (pathname.includes("/health-worker/patients")) return "Patient Registry";
    if (pathname.includes("/health-worker/screenings")) return "My Screenings";
    if (pathname.includes("/doctor/dashboard")) return "Doctor Review Console";
    if (pathname.includes("/doctor/screenings/")) return "Screening Review & AI Summary";
    if (pathname.includes("/doctor/screenings")) return "Screening Review Queue";
    return isDoctor ? "Doctor Portal" : "Health Worker Portal";
  };

  return (
    <header className="sr-header">
      <div className="sr-header-left">
        <h1 className="sr-header-title">{getPageTitle()}</h1>
        <div className="sr-live-badge">
          <span className="sr-live-dot"></span>
          <span>{isDoctor ? "Doctor Session" : "Field Worker Session"}</span>
        </div>
      </div>

      <div className="sr-header-right">
        <div className="sr-nav-doctor-badge">
          {isDoctor ? (
            <Stethoscope className="w-4 h-4 text-[#123B8C]" />
          ) : (
            <UserCheck className="w-4 h-4 text-[#14B8A6]" />
          )}
          <span className="text-xs text-[#172B4D] font-medium">
            {user?.name || (isDoctor ? "Doctor" : "Health Worker")}
          </span>
        </div>

        <button className="sr-nav-icon-btn" title="Notifications">
          <Bell className="w-4.5 h-4.5" />
          <span className="sr-badge-ping"></span>
        </button>
      </div>
    </header>
  );
};
