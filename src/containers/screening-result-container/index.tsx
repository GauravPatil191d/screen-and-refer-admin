"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ScreeningService,
  Screening,
  RiskLevel,
} from "@/service/screeningService";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  User,
  Calendar,
  Activity,
  AlertCircle,
} from "lucide-react";
import "./style.css";

export default function ScreeningResultPage({
  params,
}: {
  params: Promise<{ screeningId: string }>;
}) {
  const resolvedParams = use(params);
  const screeningId = resolvedParams.screeningId;

  const [screening, setScreening] = useState<Screening | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ScreeningService.getScreening(screeningId);
        setScreening(data);
      } catch (err: any) {
        setError(err.message || "Failed to load screening outcome");
      } finally {
        setIsLoading(false);
      }
    }
    loadResult();
  }, [screeningId]);

  if (isLoading) {
    return (
      <div className="screening-result-wrap screening-result-state py-24 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
        <span className="text-xs font-semibold text-[#64748B]">Loading screening outcome...</span>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="screening-result-wrap screening-result-state max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-[#D9E3F0] text-center">
        <AlertCircle className="w-10 h-10 text-[#DC3545] mx-auto mb-2" />
        <h2 className="text-lg font-bold text-[#172B4D]">Screening Not Found</h2>
        <p className="text-xs text-[#64748B] mt-1">{error || "Unable to display result."}</p>
        <p className="mt-4 rounded-lg border border-[#D1E2FB] bg-[#EDF4FE] p-3 text-xs text-[#123B8C]">
          Screening aid only, not a diagnosis.
        </p>
        <Link
          href="/health-worker/dashboard"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#123B8C] text-white text-xs font-bold rounded-xl"
        >
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const risk = screening.finalRisk || screening.systemRisk || screening.riskLevel;

  if (!risk || !Object.values(RiskLevel).includes(risk)) {
    return (
      <div className="screening-result-wrap screening-result-state max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-[#D9E3F0] text-center">
        <AlertCircle className="w-10 h-10 text-[#D97706] mx-auto mb-2" />
        <h2 className="text-lg font-bold text-[#172B4D]">Risk Score Unavailable</h2>
        <p className="text-xs text-[#64748B] mt-1">
          The screening was loaded, but the server did not return a valid risk level. Please retry or contact support.
        </p>
        <p className="mt-4 rounded-lg border border-[#D1E2FB] bg-[#EDF4FE] p-3 text-xs text-[#123B8C]">
          Screening aid only, not a diagnosis.
        </p>
        <Link
          href="/health-worker/dashboard"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#123B8C] text-white text-xs font-bold rounded-xl"
        >
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const getRiskBadgeStyles = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH:
        return {
          bg: "bg-[#FFF0F2]",
          border: "border-[#FFCCD2]",
          text: "text-[#DC3545]",
          badgeBg: "bg-[#DC3545]",
          label: "HIGH RISK",
          icon: <AlertTriangle className="w-8 h-8 text-[#DC3545]" />,
          desc: "Requires immediate clinical attention and priority referral.",
        };
      case RiskLevel.MEDIUM:
        return {
          bg: "bg-[#FFF8E6]",
          border: "border-[#FFE5A3]",
          text: "text-[#D97706]",
          badgeBg: "bg-[#F59E0B]",
          label: "MODERATE RISK",
          icon: <Activity className="w-8 h-8 text-[#D97706]" />,
          desc: "Requires routine clinical review by a physician.",
        };
      case RiskLevel.LOW:
      default:
        return {
          bg: "bg-[#EBFBF0]",
          border: "border-[#C4F1D0]",
          text: "text-[#22C55E]",
          badgeBg: "bg-[#22C55E]",
          label: "LOW RISK",
          icon: <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />,
          desc: "No immediate high-risk warning signs reported.",
        };
    }
  };

  const riskStyle = getRiskBadgeStyles(risk);

  return (
    <div className="screening-result-wrap max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
      {/* Top Banner */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EBFBF0] border border-[#C4F1D0] rounded-full text-xs font-bold text-[#22C55E] mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Screening Completed &amp; Recorded</span>
        </span>
        <h1 className="text-2xl font-extrabold text-[#172B4D]">Screening Outcome</h1>
        <p className="text-xs text-[#64748B]">
          Screening ID: <span className="font-mono font-semibold">{screening.screeningId}</span>
        </p>
      </div>

      {/* Main Result Card */}
      <div className="bg-white rounded-2xl border border-[#D9E3F0] shadow-sm p-6 sm:p-8 flex flex-col items-center text-center">
        <div className={`w-20 h-20 rounded-2xl ${riskStyle.bg} ${riskStyle.border} border flex items-center justify-center mb-4`}>
          {riskStyle.icon}
        </div>

        <span className={`px-4 py-1.5 rounded-full text-sm font-extrabold text-white ${riskStyle.badgeBg} shadow-md`}>
          {riskStyle.label}
        </span>

        <p className="text-sm font-medium text-[#172B4D] mt-3">
          {riskStyle.desc}
        </p>

        {/* Patient Summary Box */}
        <div className="w-full mt-6 p-4 bg-[#F8FAFD] border border-[#D9E3F0] rounded-xl text-left grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#64748B] block">Patient Name</span>
            <span className="font-bold text-[#172B4D] text-sm">
              {screening.patient?.name || "Patient"}
            </span>
          </div>

          <div>
            <span className="text-[#64748B] block">Age &amp; Sex at Screening</span>
            <span className="font-bold text-[#172B4D] text-sm">
              {screening.ageAtScreening} yrs ({screening.sexAtScreening})
            </span>
          </div>

          <div>
            <span className="text-[#64748B] block">Screening Date</span>
            <span className="font-bold text-[#172B4D]">
              {screening.submittedAt
                ? new Date(screening.submittedAt).toLocaleDateString()
                : new Date(screening.startedAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-[#64748B] block">Doctor Review Queue</span>
            <span className="font-bold text-[#123B8C]">
              Forwarded to Doctor Portal
            </span>
          </div>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="mt-6 p-4 bg-[#EDF4FE] border border-[#D1E2FB] rounded-xl w-full text-xs text-[#123B8C] text-center font-medium">
          Screening aid only, not a diagnosis.
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
          <Link
            href="/health-worker/patients"
            className="flex-1 px-4 py-3 bg-[#F4F8FD] border border-[#D9E3F0] text-[#172B4D] text-xs font-bold rounded-xl hover:bg-[#EDF4FE] transition text-center"
          >
            Patient Directory
          </Link>

          <Link
            href="/health-worker/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#123B8C] hover:bg-[#0B255C] text-white text-xs font-bold rounded-xl shadow transition"
          >
            <span>Health Worker Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
