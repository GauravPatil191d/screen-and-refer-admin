"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Stethoscope,
  LogOut,
  UserCheck,
  Activity,
} from "lucide-react";
import { useLogin } from "@/context/LoginContext";
import "./style.css";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useLogin();

  const isDoctor = user?.role === "DOCTOR";

  // Role-specific navigation items
  const healthWorkerMenuItems = [
    {
      href: "/health-worker/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: "/health-worker/patients",
      label: "Patients",
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: "/health-worker/screenings",
      label: "My Screenings",
      icon: <FileCheck className="w-5 h-5" />,
    },
  ];

  const doctorMenuItems = [
    {
      href: "/doctor/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: "/doctor/screenings",
      label: "Screenings Review",
      icon: <Activity className="w-5 h-5" />,
    },
  ];

  const menuItems = isDoctor ? doctorMenuItems : healthWorkerMenuItems;

  return (
    <aside className="sr-sidebar">
      {/* Brand Header */}
      <div className="sr-sidebar-brand">
        <img
          src="/images/full-logo.png"
          alt="Screen & Refer Logo"
          className="sr-sidebar-logo"
        />
      </div>

      {/* User Profile Mini Card */}
      <div className="sr-sidebar-profile">
        <div className="sr-profile-avatar">
          {isDoctor ? (
            <Stethoscope className="w-5 h-5 text-[#123B8C]" />
          ) : (
            <UserCheck className="w-5 h-5 text-[#14B8A6]" />
          )}
        </div>
        <div className="sr-profile-info">
          <span className="sr-profile-name" title={user?.name || user?.id}>
            {user?.name || (isDoctor ? "Doctor" : "Health Worker")}
          </span>
          <span className="sr-profile-role">
            {isDoctor ? "DOCTOR PORTAL" : "HEALTH WORKER"}
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="sr-sidebar-menu">
        <span className="sr-menu-heading">
          {isDoctor ? "CLINICAL NAVIGATION" : "FIELD NAVIGATION"}
        </span>
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/health-worker/dashboard" &&
              item.href !== "/doctor/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sr-sidebar-item ${isActive ? "active" : ""}`}
            >
              <div className="sr-item-content">
                <span className="sr-menu-icon">{item.icon}</span>
                <span className="sr-menu-label">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="sr-sidebar-footer">
        <button onClick={logout} className="sr-logout-button" title="Sign Out">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};