"use client";

import React, { useEffect, useState, use, useCallback } from "react";
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
  ShieldCheck,
  User,
  Phone,
  Calendar,
  AlertCircle,
  FileCheck,
  Check,
  X,
} from "lucide-react";

export default function DoctorScreeningDetailPage({
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
  const [aiLanguageTab, setAiLanguageTab] = useState<"english" | "marathi">("english");

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
        setAiSummary(screeningDetail.aiSummary);
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

  // Handle Accept System Risk
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

  // Handle Override System Risk
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert("A non-empty clinical justification reason is required for risk override.");
      return;
    }

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

  // Handle AI Summary Generation
  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await DoctorService.generateAiSummary(screeningId);
      setAiSummary(result);
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
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
        <span className="text-xs font-semibold text-[#64748B]">Loading screening case files...</span>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-[#D9E3F0] text-center">
        <AlertCircle className="w-10 h-10 text-[#DC3545] mx-auto mb-2" />
        <h2 className="text-lg font-bold text-[#172B4D]">Screening Not Found</h2>
        <p className="text-xs text-[#64748B] mt-1">{error}</p>
        <Link
          href="/doctor/dashboard"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#123B8C] text-white text-xs font-bold rounded-xl"
        >
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
    <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/dashboard"
            className="p-2 bg-white border border-[#D9E3F0] rounded-xl text-[#64748B] hover:text-[#172B4D] hover:bg-[#F4F8FD] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#172B4D]">
              Clinical Screening Review
            </h1>
            <p className="text-xs text-[#64748B]">
              Case ID: <span className="font-mono font-semibold">{screening.screeningId}</span>
            </p>
          </div>
        </div>

        {/* Review Status Badge */}
        <div>
          {isReviewed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBFBF0] border border-[#C4F1D0] rounded-xl text-xs font-bold text-[#22C55E]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Doctor Reviewed</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E6] border border-[#FFE5A3] rounded-xl text-xs font-bold text-[#D97706]">
              <Activity className="w-4 h-4" />
              <span>Pending Physician Review</span>
            </span>
          )}
        </div>
      </div>

      {/* Status Notice */}
      {reviewMessage && (
        <div className="p-4 bg-[#EBFBF0] border border-[#C4F1D0] rounded-xl text-xs font-bold text-[#22C55E] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{reviewMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-[#FFF0F2] border border-[#FFCCD2] rounded-xl text-xs text-[#DC3545] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Patient Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#D9E3F0] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <span className="text-xs text-[#64748B] block">Patient Name</span>
          <span className="text-base font-extrabold text-[#172B4D]">{patient.name}</span>
          <span className="text-xs font-mono text-[#64748B] block mt-0.5">{patient.phone}</span>
        </div>

        <div>
          <span className="text-xs text-[#64748B] block">Age &amp; Sex (at Screening)</span>
          <span className="text-sm font-bold text-[#172B4D]">
            {screening.ageAtScreening} yrs • {screening.sexAtScreening}
          </span>
          <span className="text-xs text-[#64748B] block mt-0.5">DOB: {new Date(patient.dob).toLocaleDateString()}</span>
        </div>

        <div>
          <span className="text-xs text-[#64748B] block">Blood Group</span>
          <span className="text-sm font-bold text-[#DC3545]">{patient.bloodGroup}</span>
          <span className="text-xs text-[#64748B] block mt-0.5">Field Worker: {screening.createdBy}</span>
        </div>

        <div>
          <span className="text-xs text-[#64748B] block">Screening Date</span>
          <span className="text-sm font-bold text-[#172B4D]">
            {screening.submittedAt
              ? new Date(screening.submittedAt).toLocaleDateString()
              : new Date(screening.startedAt).toLocaleDateString()}
          </span>
          <span className="text-xs text-[#64748B] block mt-0.5">Protocol v{screening.configVersion}</span>
        </div>
      </div>

      {/* Risk Assessment & Decision Box */}
      <div className="bg-white rounded-2xl border border-[#D9E3F0] shadow-sm p-6 sm:p-7">
        <h2 className="text-base font-bold text-[#172B4D] mb-4 pb-3 border-b border-[#D9E3F0]">
          Risk Evaluation &amp; Physician Decision
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Risk Level Badges */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3.5 bg-[#F8FAFD] rounded-xl border border-[#D9E3F0]">
              <span className="text-xs font-semibold text-[#64748B]">Automated System Risk:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getRiskColor(systemRisk)}`}>
                {systemRisk}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#F8FAFD] rounded-xl border border-[#D9E3F0]">
              <span className="text-xs font-semibold text-[#64748B]">Effective Final Risk:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getRiskColor(finalRisk)}`}>
                {finalRisk} {screening.reviewAction === "OVERRIDE" && "(OVERRIDDEN)"}
              </span>
            </div>

            {screening.overrideReason && (
              <div className="p-3 bg-[#FFF8E6] border border-[#FFE5A3] rounded-xl text-xs text-[#D97706]">
                <strong>Override Clinical Reason:</strong> {screening.overrideReason}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 justify-center">
            <button
              onClick={handleAcceptRisk}
              disabled={isReviewing}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Accept System Risk ({systemRisk})</span>
            </button>

            <button
              onClick={() => setShowOverrideModal(true)}
              disabled={isReviewing}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#123B8C] hover:bg-[#0B255C] text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Activity className="w-4 h-4" />
              <span>Override Clinical Risk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D9E3F0] shadow-2xl max-w-lg w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[#172B4D] mb-1">
              Override Clinical Risk Level
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Specify the revised clinical risk level and provide a medical justification reason.
            </p>

            <form onSubmit={handleOverrideSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#172B4D]">
                  New Risk Level <span className="text-[#DC3545]">*</span>
                </label>
                <select
                  value={overrideRisk}
                  onChange={(e) => setOverrideRisk(e.target.value as RiskLevel)}
                  className="w-full px-3.5 py-2 text-sm bg-[#F8FAFD] border border-[#D9E3F0] rounded-xl text-[#172B4D] focus:outline-none focus:border-[#123B8C]"
                  required
                >
                  <option value={RiskLevel.HIGH}>HIGH RISK</option>
                  <option value={RiskLevel.MEDIUM}>MEDIUM RISK</option>
                  <option value={RiskLevel.LOW}>LOW RISK</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#172B4D]">
                  Clinical Justification / Reason <span className="text-[#DC3545]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter medical rationale for overriding automated risk..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-3 text-sm bg-[#F8FAFD] border border-[#D9E3F0] rounded-xl text-[#172B4D] focus:outline-none focus:border-[#123B8C]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-[#D9E3F0]">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 bg-[#F4F8FD] text-[#64748B] text-xs font-bold rounded-xl hover:bg-[#EDF4FE]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!overrideReason.trim() || isReviewing}
                  className="px-5 py-2 bg-[#123B8C] text-white text-xs font-bold rounded-xl hover:bg-[#0B255C] disabled:opacity-50 shadow"
                >
                  {isReviewing ? "Saving..." : "Confirm Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Summary Section */}
      <div className="bg-white rounded-2xl border border-[#D9E3F0] shadow-sm p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-[#D9E3F0]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#16B8D4]" />
            <div>
              <h2 className="text-base font-bold text-[#172B4D]">AI Case Summary (Gemini)</h2>
              <p className="text-[11px] text-[#64748B]">
                Dual-language clinical synthesis generated from reported symptoms.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAiSummary}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#F4F8FD] border border-[#B4CEF0] text-[#123B8C] text-xs font-bold rounded-xl hover:bg-[#EDF4FE] transition shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#16B8D4]" />
            <span>{isGeneratingAi ? "Generating Summary..." : aiSummary ? "Regenerate Summary" : "Generate AI Summary"}</span>
          </button>
        </div>

        {aiSummary ? (
          aiSummary.available === false ? (
            <div className="p-4 bg-[#FFF8E6] border border-[#FFE5A3] rounded-xl text-xs text-[#D97706]">
              {aiSummary.message || "AI summary is currently unavailable."}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* English / Marathi Tab Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAiLanguageTab("english")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    aiLanguageTab === "english"
                      ? "bg-[#123B8C] text-white shadow-sm"
                      : "bg-[#F8FAFD] text-[#64748B] hover:bg-[#EDF4FE]"
                  }`}
                >
                  English Summary
                </button>
                <button
                  onClick={() => setAiLanguageTab("marathi")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    aiLanguageTab === "marathi"
                      ? "bg-[#123B8C] text-white shadow-sm"
                      : "bg-[#F8FAFD] text-[#64748B] hover:bg-[#EDF4FE]"
                  }`}
                >
                  मराठी सारांश (Marathi)
                </button>
              </div>

              {/* Summary Text Content */}
              <div className="p-4 bg-[#F8FAFD] border border-[#D9E3F0] rounded-xl text-sm leading-relaxed text-[#172B4D]">
                {aiLanguageTab === "english" ? aiSummary.english : aiSummary.marathi}
              </div>

              {aiSummary.generatedAt && (
                <span className="text-[10px] text-[#64748B]">
                  Generated on {new Date(aiSummary.generatedAt).toLocaleString()}
                </span>
              )}
            </div>
          )
        ) : (
          <div className="py-6 text-center text-[#64748B] text-xs">
            No AI summary generated yet. Click &quot;Generate AI Summary&quot; to synthesize clinical findings.
          </div>
        )}
      </div>

      {/* Complete Screening Questions & Answers Breakdown */}
      <div className="bg-white rounded-2xl border border-[#D9E3F0] shadow-sm p-6 sm:p-7">
        <h2 className="text-base font-bold text-[#172B4D] mb-4 pb-3 border-b border-[#D9E3F0]">
          Reported Screening Responses
        </h2>

        <div className="flex flex-col gap-3">
          {config?.questions
            .filter((q) => !q.source)
            .map((q) => {
              const answer = screening.answers[q.id];
              const isAnswered = typeof answer === "boolean";

              return (
                <div
                  key={q.id}
                  className="p-3.5 bg-[#F8FAFD] rounded-xl border border-[#D9E3F0] flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-2 max-w-xl">
                    <span className="font-mono font-bold text-[#64748B] uppercase">
                      [{q.id}]
                    </span>
                    <span className="text-[#172B4D] font-medium">{q.text}</span>
                  </div>

                  <div>
                    {isAnswered ? (
                      answer ? (
                        <span className="px-3 py-1 bg-[#FFF0F2] text-[#DC3545] border border-[#FFCCD2] font-bold rounded-lg">
                          YES
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[#EBFBF0] text-[#22C55E] border border-[#C4F1D0] font-bold rounded-lg">
                          NO
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[11px]">
                        Not Applicable / Inactive
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="bg-white rounded-2xl border border-[#D9E3F0] shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D9E3F0]">
          <History className="w-5 h-5 text-[#123B8C]" />
          <h2 className="text-base font-bold text-[#172B4D]">Clinical Audit Log</h2>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-[#64748B]">No audit decisions recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {auditLogs.map((log) => (
              <div
                key={log.auditId}
                className="p-3.5 bg-[#F8FAFD] rounded-xl border border-[#D9E3F0] flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-[#172B4D] block">
                    Action: {log.action} ({log.oldRiskLevel} → {log.newRiskLevel})
                  </span>
                  {log.reason && (
                    <span className="text-[#D97706] block mt-0.5">
                      Reason: {log.reason}
                    </span>
                  )}
                  <span className="text-[11px] text-[#64748B] block mt-0.5">
                    Doctor ID: {log.doctorId}
                  </span>
                </div>
                <span className="text-[11px] text-[#64748B]">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
