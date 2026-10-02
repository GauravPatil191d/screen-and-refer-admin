"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  DoctorService,
  DoctorScreeningDetail,
  ScreeningAuditData,
  AiSummaryData,
} from "@/service/doctorService";
import {
  ScreeningService,
  ScreeningConfig,
  RiskLevel,
} from "@/service/screeningService";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  History,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import "./style.css";

const normalizeAiSummary = (
  summary: AiSummaryData | null | undefined
): AiSummaryData => {
  if (summary?.available === false) {
    return {
      available: false,
      message: summary.message || "AI summary is currently unavailable.",
    };
  }

  if (
    !summary ||
    typeof summary.english !== "string" ||
    !summary.english.trim() ||
    typeof summary.marathi !== "string" ||
    !summary.marathi.trim()
  ) {
    return {
      available: false,
      message: "AI summary was incomplete and could not be displayed.",
    };
  }

  return {
    ...summary,
    available: true,
    english: summary.english.trim(),
    marathi: summary.marathi.trim(),
  };
};

export default function DoctorScreeningDetailContainer({
  params,
}: {
  params: Promise<{ screeningId: string }>;
}) {
  const resolvedParams = use(params);
  const screeningId = resolvedParams.screeningId;

  const [detail, setDetail] = useState<DoctorScreeningDetail | null>(null);
  const [config, setConfig] = useState<ScreeningConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<ScreeningAuditData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review & Override State
  const [isReviewing, setIsReviewing] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideRisk, setOverrideRisk] = useState<RiskLevel>(RiskLevel.MEDIUM);
  const [overrideReason, setOverrideReason] = useState("");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // AI Summary State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiSummaryData | null>(null);
  const [aiLanguageTab, setAiLanguageTab] = useState<"english" | "marathi">(
    "english"
  );

  // Portal mount guard (SSR-safe)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!showOverrideModal) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [showOverrideModal]);

  // Close modal on Escape
  useEffect(() => {
    if (!showOverrideModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isReviewing) setShowOverrideModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showOverrideModal, isReviewing]);

  const loadScreeningData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [screeningDetail, screeningConfig, auditData] = await Promise.all([
        DoctorService.getScreeningById(screeningId),
        ScreeningService.getConfig(),
        DoctorService.getAuditHistory(screeningId),
      ]);

      setDetail(screeningDetail);
      setConfig(screeningConfig);
      setAuditLogs(auditData);
      if (screeningDetail.aiSummary) {
        setAiSummary(normalizeAiSummary(screeningDetail.aiSummary));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load screening case details");
    } finally {
      setIsLoading(false);
    }
  }, [screeningId]);

  useEffect(() => {
    loadScreeningData();
  }, [loadScreeningData]);

  const handleAcceptRisk = async () => {
    if (!detail) return;
    setIsReviewing(true);
    setError(null);
    setReviewMessage(null);
    try {
      await DoctorService.reviewScreening(screeningId, { action: "ACCEPT" });
      setReviewMessage("Screening accepted with system risk level.");
      await loadScreeningData();
    } catch (err: any) {
      setError(err.message || "Failed to accept risk");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;

    setIsReviewing(true);
    setError(null);
    setReviewMessage(null);
    try {
      await DoctorService.reviewScreening(screeningId, {
        action: "OVERRIDE",
        riskLevel: overrideRisk,
        reason: overrideReason.trim(),
      });
      setShowOverrideModal(false);
      setOverrideReason("");
      setReviewMessage(`Risk successfully overridden to ${overrideRisk}.`);
      await loadScreeningData();
    } catch (err: any) {
      setError(err.message || "Failed to override screening risk");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await DoctorService.generateAiSummary(screeningId);
      setAiSummary(normalizeAiSummary(result));
    } catch (err: any) {
      setAiSummary({
        available: false,
        message: err.message || "AI summary is currently unavailable.",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dsd-state dsd-state--full">
        <div className="dsd-spinner" />
        <span className="dsd-state-text">Loading screening case files…</span>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="dsd-state dsd-state--card">
        <AlertCircle className="dsd-state-icon w-10 h-10" />
        <h2 className="dsd-state-title">Screening Not Found</h2>
        <p className="dsd-state-text">{error}</p>
        <Link href="/doctor/dashboard" className="dsd-btn dsd-btn--primary">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Queue</span>
        </Link>
      </div>
    );
  }

  const screening = detail!.screening;
  const patient = detail!.patient;
  const systemRisk = screening.systemRisk || screening.riskLevel || RiskLevel.LOW;
  const finalRisk = screening.finalRisk || systemRisk;
  const isReviewed = screening.doctorReviewStatus === "REVIEWED";

  const getRiskColor = (level?: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH:
        return "bg-[#FFF0F2] text-[#DC3545] border-[#FFCCD2]";
      case RiskLevel.MEDIUM:
        return "bg-[#FFF8E6] text-[#D97706] border-[#FFE5A3]";
      case RiskLevel.LOW:
      default:
        return "bg-[#EBFBF0] text-[#22C55E] border-[#C4F1D0]";
    }
  };

  return (
    <div className="doctor-screening-detail-container">
      {/* ============ Header ============ */}
      <header className="dsd-header">
        <div className="dsd-header-left">
          <Link
            href="/doctor/dashboard"
            className="dsd-back-btn"
            aria-label="Back to doctor queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="dsd-header-text">
            <h1 className="dsd-title">Clinical Screening Review</h1>
            <p className="dsd-subtitle">
              Case ID: <span className="dsd-mono">{screening.screeningId}</span>
            </p>
          </div>
        </div>

        <div className="dsd-header-right">
          {isReviewed ? (
            <span className="dsd-status dsd-status--reviewed">
              <CheckCircle2 className="w-4 h-4" />
              <span>Doctor Reviewed</span>
            </span>
          ) : (
            <span className="dsd-status dsd-status--pending">
              <Activity className="w-4 h-4" />
              <span>Pending Physician Review</span>
            </span>
          )}
        </div>
      </header>

      {/* ============ Alerts ============ */}
      {reviewMessage && (
        <div className="dsd-alert dsd-alert--success">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{reviewMessage}</span>
        </div>
      )}

      {error && (
        <div className="dsd-alert dsd-alert--error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============ Patient snapshot ============ */}
      <section className="dsd-card dsd-patient-grid">
        <div className="dsd-patient-cell">
          <span className="dsd-cell-label">Patient Name</span>
          <span className="dsd-cell-value dsd-cell-value--lg">{patient.name}</span>
          <span className="dsd-cell-sub dsd-mono">{patient.phone}</span>
        </div>

        <div className="dsd-patient-cell">
          <span className="dsd-cell-label">Age &amp; Sex (at Screening)</span>
          <span className="dsd-cell-value">
            {screening.ageAtScreening} yrs • {screening.sexAtScreening}
          </span>
          <span className="dsd-cell-sub">
            DOB: {new Date(patient.dob).toLocaleDateString()}
          </span>
        </div>

        <div className="dsd-patient-cell">
          <span className="dsd-cell-label">Blood Group</span>
          <span className="dsd-cell-value dsd-cell-value--danger">
            {patient.bloodGroup}
          </span>
          <span className="dsd-cell-sub">Field Worker: {screening.createdBy}</span>
        </div>

        <div className="dsd-patient-cell">
          <span className="dsd-cell-label">Screening Date</span>
          <span className="dsd-cell-value">
            {screening.submittedAt
              ? new Date(screening.submittedAt).toLocaleDateString()
              : new Date(screening.startedAt).toLocaleDateString()}
          </span>
          <span className="dsd-cell-sub">Protocol v{screening.configVersion}</span>
        </div>
      </section>

      {/* ============ Risk & Decision ============ */}
      <section className="dsd-card">
        <h2 className="dsd-card-title">Risk Evaluation &amp; Physician Decision</h2>

        <div className="dsd-decision-grid">
          <div className="dsd-risk-panel">
            <div className="dsd-risk-row">
              <span className="dsd-risk-label">Automated System Risk</span>
              <span className={`dsd-risk-badge ${getRiskColor(systemRisk)}`}>
                {systemRisk}
              </span>
            </div>

            <div className="dsd-risk-row">
              <span className="dsd-risk-label">Effective Final Risk</span>
              <span className={`dsd-risk-badge ${getRiskColor(finalRisk)}`}>
                {finalRisk}
                {screening.reviewAction === "OVERRIDE" && (
                  <em className="dsd-risk-em">OVERRIDDEN</em>
                )}
              </span>
            </div>

            {screening.overrideReason && (
              <div className="dsd-reason-note">
                <strong>Override Reason:</strong> {screening.overrideReason}
              </div>
            )}
          </div>

          <div className="dsd-action-panel">
            <button
              type="button"
              onClick={handleAcceptRisk}
              disabled={isReviewing}
              className="dsd-btn dsd-btn--success"
            >
              <Check className="w-4 h-4" />
              <span>Accept System Risk ({systemRisk})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOverrideModal(true)}
              disabled={isReviewing}
              className="dsd-btn dsd-btn--primary"
            >
              <Activity className="w-4 h-4" />
              <span>Override Clinical Risk</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============ AI Summary ============ */}
      <section className="dsd-card">
        <header className="dsd-card-head">
          <div className="dsd-card-head-left">
            <span className="dsd-icon-chip dsd-icon-chip--cyan">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="dsd-card-title dsd-card-title--tight">
                AI Case Summary
              </h2>
              <p className="dsd-card-sub">
                Dual-language clinical synthesis generated from reported symptoms.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiSummary}
            disabled={isGeneratingAi}
            className="dsd-btn dsd-btn--outline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isGeneratingAi
                ? "Generating…"
                : aiSummary
                ? "Regenerate"
                : "Generate Summary"}
            </span>
          </button>
        </header>

        {aiSummary ? (
          aiSummary.available === false ? (
            <div className="dsd-inline-note dsd-inline-note--warn">
              {aiSummary.message || "AI summary is currently unavailable."}
            </div>
          ) : (
            <div className="dsd-ai-body">
              <div className="dsd-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={aiLanguageTab === "english"}
                  onClick={() => setAiLanguageTab("english")}
                  className={`dsd-tab ${
                    aiLanguageTab === "english" ? "is-active" : ""
                  }`}
                >
                  English Summary
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={aiLanguageTab === "marathi"}
                  onClick={() => setAiLanguageTab("marathi")}
                  className={`dsd-tab ${
                    aiLanguageTab === "marathi" ? "is-active" : ""
                  }`}
                >
                  मराठी सारांश
                </button>
              </div>

              <div className="dsd-summary-text">
                {aiLanguageTab === "english" ? aiSummary.english : aiSummary.marathi}
              </div>

              {aiSummary.generatedAt && (
                <span className="dsd-tiny-meta">
                  Generated on {new Date(aiSummary.generatedAt).toLocaleString()}
                </span>
              )}
            </div>
          )
        ) : (
          <div className="dsd-empty">
            No AI summary generated yet. Click &quot;Generate Summary&quot; to
            synthesize clinical findings.
          </div>
        )}
      </section>

      {/* ============ Reported Responses ============ */}
      <section className="dsd-card">
        <h2 className="dsd-card-title">Reported Screening Responses</h2>

        <div className="dsd-qa-list">
          {config?.questions
            .filter((q) => !q.source)
            .map((q) => {
              const answer = screening.answers[q.id];
              const isAnswered = answer !== undefined;

              return (
                <div key={q.id} className="dsd-qa-row">
                  <div className="dsd-qa-question">
                    <span className="dsd-qa-id">[{q.id}]</span>
                    <span className="dsd-qa-text">{q.text}</span>
                  </div>

                  <div className="dsd-qa-answer">
                    {isAnswered ? (
                      <span
                        className={`dsd-answer-chip ${
                          answer === true
                            ? "dsd-answer-chip--yes"
                            : answer === false
                            ? "dsd-answer-chip--no"
                            : "dsd-answer-chip--other"
                        }`}
                      >
                        {typeof answer === "boolean"
                          ? answer
                            ? "YES"
                            : "NO"
                          : String(answer)}
                      </span>
                    ) : (
                      <span className="dsd-answer-chip dsd-answer-chip--na">
                        Not Applicable
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* ============ Audit Log ============ */}
      <section className="dsd-card">
        <header className="dsd-card-head">
          <div className="dsd-card-head-left">
            <span className="dsd-icon-chip dsd-icon-chip--blue">
              <History className="w-4 h-4" />
            </span>
            <h2 className="dsd-card-title dsd-card-title--tight">
              Clinical Audit Log
            </h2>
          </div>
        </header>

        {auditLogs.length === 0 ? (
          <p className="dsd-empty dsd-empty--sm">
            No audit decisions recorded yet.
          </p>
        ) : (
          <div className="dsd-audit-list">
            {auditLogs.map((log) => (
              <div key={log.auditId} className="dsd-audit-row">
                <div className="dsd-audit-main">
                  <span className="dsd-audit-title">
                    {log.action}{" "}
                    <em className="dsd-audit-transition">
                      ({log.oldRiskLevel} → {log.newRiskLevel})
                    </em>
                  </span>
                  {log.reason && (
                    <span className="dsd-audit-reason">
                      Reason: {log.reason}
                    </span>
                  )}
                  <span className="dsd-audit-meta">Doctor ID: {log.doctorId}</span>
                </div>
                <span className="dsd-audit-time">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ Override Modal (Portal) ============ */}
      {isMounted &&
        showOverrideModal &&
        createPortal(
          <div
            className="dsd-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dsd-override-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isReviewing) {
                setShowOverrideModal(false);
              }
            }}
          >
            <div className="dsd-modal">
              <header className="dsd-modal-head">
                <div>
                  <h3 id="dsd-override-title" className="dsd-modal-title">
                    Override Clinical Risk Level
                  </h3>
                  <p className="dsd-modal-sub">
                    Specify a revised clinical risk level and provide a medical
                    justification.
                  </p>
                </div>
                <button
                  type="button"
                  className="dsd-modal-close"
                  onClick={() => setShowOverrideModal(false)}
                  disabled={isReviewing}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </header>

              <form onSubmit={handleOverrideSubmit} className="dsd-modal-form">
                <div className="dsd-field">
                  <label htmlFor="override-risk" className="dsd-field-label">
                    New Risk Level <span className="dsd-req">*</span>
                  </label>
                  <select
                    id="override-risk"
                    value={overrideRisk}
                    onChange={(e) => setOverrideRisk(e.target.value as RiskLevel)}
                    className="dsd-field-input"
                    required
                  >
                    <option value={RiskLevel.HIGH}>HIGH RISK</option>
                    <option value={RiskLevel.MEDIUM}>MEDIUM RISK</option>
                    <option value={RiskLevel.LOW}>LOW RISK</option>
                  </select>
                </div>

                <div className="dsd-field">
                  <label htmlFor="override-reason" className="dsd-field-label">
                    Clinical Justification <span className="dsd-req">*</span>
                  </label>
                  <textarea
                    id="override-reason"
                    rows={4}
                    placeholder="Enter medical rationale for overriding the automated risk…"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="dsd-field-input dsd-field-textarea"
                    required
                  />
                  <span className="dsd-field-hint">
                    This will be recorded in the clinical audit log.
                  </span>
                </div>

                <footer className="dsd-modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowOverrideModal(false)}
                    disabled={isReviewing}
                    className="dsd-btn dsd-btn--ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!overrideReason.trim() || isReviewing}
                    className="dsd-btn dsd-btn--primary"
                  >
                    {isReviewing ? "Saving…" : "Confirm Override"}
                  </button>
                </footer>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}