"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useLogin } from "@/context/LoginContext";
import "./style.css";

function formatDate(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

export const ProfileContainer: React.FC = () => {
  const { user } = useLogin();

  if (!user) return null;

  const isDoctor = user.role === "DOCTOR";
  const roleLabel = isDoctor ? "Doctor" : "Health worker";
  const homePath = isDoctor ? "/doctor/dashboard" : "/health-worker/dashboard";
  const initial = Array.from(user.name.trim())[0]?.toLocaleUpperCase() || "?";

  const profileItems = [
    { label: "Full name", value: user.name, icon: UserRound },
    { label: "User ID", value: user.userId, icon: UserRound },
    { label: "Email address", value: user.email, icon: Mail },
    { label: "Role", value: roleLabel, icon: ShieldCheck },
    { label: "Account status", value: user.isActive ? "Active" : "Inactive", icon: ShieldCheck },
    { label: "Last login", value: formatDate(user.lastLoginAt), icon: CalendarDays },
    { label: "Created", value: formatDate(user.createdAt), icon: CalendarDays },
    { label: "Last updated", value: formatDate(user.updatedAt), icon: CalendarDays },
    { label: "Profile ID", value: user.id, icon: UserRound },
  ];

  return (
    <div className="profile-page animate-fade-in">
      <Link className="profile-back-link" href={homePath}>
        <ArrowLeft aria-hidden="true" />
        <span>Back to dashboard</span>
      </Link>

      <section className="profile-card" aria-labelledby="profile-title">
        <div className="profile-summary">
          <span className="profile-avatar" aria-hidden="true">
            {initial}
          </span>
          <div className="profile-summary-copy">
            <span className="profile-role">{roleLabel}</span>
            <h1 id="profile-title">{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-details">
          {profileItems.map(({ label, value, icon: Icon }) => (
            <div className="profile-detail" key={label}>
              <span className="profile-detail-icon">
                <Icon aria-hidden="true" />
              </span>
              <div className="profile-detail-copy">
                <span className="profile-detail-label">{label}</span>
                <span className="profile-detail-value" title={value}>
                  {value || "Not provided"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};