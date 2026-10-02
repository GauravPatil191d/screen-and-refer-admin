"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogin } from "@/context/LoginContext";
import "./style.css";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user } = useLogin();
  const isDoctor = user?.role === "DOCTOR";
  const userName = user?.name?.trim() || (isDoctor ? "Doctor" : "Health Worker");
  const profileInitial = Array.from(userName)[0]?.toLocaleUpperCase() || "?";
  const profilePath = isDoctor ? "/doctor/profile" : "/health-worker/profile";

  const getPageTitle = () => {
    if (pathname.endsWith("/profile")) return "My Profile";
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
        {/* <div className="sr-live-badge">
          <span className="sr-live-dot"></span>
          <span>{isDoctor ? "Doctor Session" : "Field Worker Session"}</span>
        </div> */}
      </div>

      <div className="sr-header-right">
        <Link
          href={profilePath}
          className="sr-nav-doctor-badge"
          aria-label={`View ${userName}'s profile`}
          title="View profile"
        >
          <span className="sr-nav-avatar" aria-hidden="true">
            {profileInitial}
          </span>
          <span className="sr-nav-user-name">
            {userName}
          </span>
        </Link>

        {/* <button className="sr-nav-icon-btn" title="Notifications">
          <Bell className="w-4.5 h-4.5" />
          <span className="sr-badge-ping"></span>
        </button> */}
      </div>
    </header>
  );
};
