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
  ArrowRight,
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
      <div className="sr-page sr-state sr-state--full">
        <div className="sr-spinner" />
        <span className="sr-state-text">Loading screening outcome…</span>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="sr-page sr-state sr-state--card">
        <AlertCircle className="w-10 h-10 text-[#DC3545]" />
        <h2 className="sr-state-title">Screening Not Found</h2>
        <p className="sr-state-text">
          {error || "Unable to display result."}
        </p>
        <p className="sr-note">
          Screening aid only, not a diagnosis.
        </p>
        <Link href="/health-worker/dashboard" className="sr-state-link">
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const risk =
    screening.finalRisk || screening.systemRisk || screening.riskLevel;

  if (!risk || !Object.values(RiskLevel).includes(risk)) {
    return (
      <div className="sr-page sr-state sr-state--card">
        <AlertCircle className="w-10 h-10 text-[#B45309]" />
        <h2 className="sr-state-title">Risk Score Unavailable</h2>
        <p className="sr-state-text">
          The screening was loaded, but the server did not return a valid risk
          level. Please retry or contact support.
        </p>
        <p className="sr-note">
          Screening aid only, not a diagnosis.
        </p>
        <Link href="/health-worker/dashboard" className="sr-state-link">
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  /* --------------------------------------------------------------
     Risk presentation. `tone` drives every colour in CSS.
     Badge backgrounds are the 600/700 shades so white text passes
     WCAG AA (≥ 4.5:1) against the badge fill.
     -------------------------------------------------------------- */
  const getRiskPresentation = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH:
        return {
          tone: "high" as const,
          label: "HIGH RISK",
          desc: "Requires immediate clinical attention and priority referral.",
          Icon: AlertTriangle,
        };
      case RiskLevel.MEDIUM:
        return {
          tone: "medium" as const,
          label: "MODERATE RISK",
          desc: "Requires routine clinical review by a physician.",
          Icon: Activity,
        };
      case RiskLevel.LOW:
      default:
        return {
          tone: "low" as const,
          label: "LOW RISK",
          desc: "No immediate high-risk warning signs reported.",
          Icon: CheckCircle2,
        };
    }
  };

  const rp = getRiskPresentation(risk);
  const RiskIcon = rp.Icon;

  return (
    <div className="sr-page">
      {/* ============ Top banner ============ */}
      <header className="sr-page-header">
        <span className="sr-completed-chip">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Screening Completed &amp; Recorded</span>
        </span>
        <h1 className="sr-page-title">Screening Outcome</h1>
        <p className="sr-page-id">
          Screening ID:{" "}
          <span className="sr-mono">{screening.screeningId}</span>
        </p>
      </header>

      {/* ============ Result card ============ */}
      <section className="sr-result-card">
        <div className={`sr-risk-icon sr-risk-icon--${rp.tone}`}>
          <RiskIcon className="w-8 h-8" />
        </div>

        <span className={`sr-risk-badge sr-risk-badge--${rp.tone}`}>
          {rp.label}
        </span>

        <p className="sr-risk-desc">{rp.desc}</p>

        {/* Patient summary */}
        <div className="sr-summary">
          <div className="sr-summary-cell">
            <span className="sr-summary-label">Patient Name</span>
            <span className="sr-summary-value">
              {screening.patient?.name || "Patient"}
            </span>
          </div>

          <div className="sr-summary-cell">
            <span className="sr-summary-label">Age &amp; Sex at Screening</span>
            <span className="sr-summary-value">
              {screening.ageAtScreening} yrs ({screening.sexAtScreening})
            </span>
          </div>

          <div className="sr-summary-cell">
            <span className="sr-summary-label">Screening Date</span>
            <span className="sr-summary-value">
              {screening.submittedAt
                ? new Date(screening.submittedAt).toLocaleDateString()
                : new Date(screening.startedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="sr-summary-cell">
            <span className="sr-summary-label">Doctor Review Queue</span>
            <span className="sr-summary-value sr-summary-value--accent">
              Forwarded to Doctor Portal
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="sr-disclaimer">
          Screening aid only, not a diagnosis.
        </div>

        {/* Actions */}
        <div className="sr-actions">
          <Link
            href="/health-worker/patients"
            className="sr-action sr-action--ghost"
          >
            Patient Directory
          </Link>
          <Link
            href="/health-worker/dashboard"
            className="sr-action sr-action--primary"
          >
            <span>Health Worker Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};