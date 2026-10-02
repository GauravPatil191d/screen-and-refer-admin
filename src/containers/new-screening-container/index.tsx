"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ScreeningService,
  ScreeningConfig,
  ScreeningQuestion,
  ScreeningConditionRule,
  Screening,
  ScreeningAnswer,
  ScreeningAnswers,
} from "@/service/screeningService";
import { PatientService, Patient, PatientSex } from "@/service/patientService";
import { useLogin } from "@/context/LoginContext";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  HelpCircle,
  Clock,
} from "lucide-react";
import "./style.css";

interface NewScreeningContainerProps {
  patientId: string;
}

export const NewScreeningContainer: React.FC<NewScreeningContainerProps> = ({
  patientId,
}) => {
  const router = useRouter();
  const { user } = useLogin();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [config, setConfig] = useState<ScreeningConfig | null>(null);
  const [screening, setScreening] = useState<Screening | null>(null);

  const [answers, setAnswers] = useState<ScreeningAnswers>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [draftSyncState, setDraftSyncState] = useState<"synced" | "pending" | "offline">("synced");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize screening session and load config
  useEffect(() => {
    async function initSession() {
      setIsLoading(true);
      setError(null);
      try {
        const [patientData, configData] = await Promise.all([
          PatientService.getPatientById(patientId),
          ScreeningService.getConfig(),
        ]);
        setPatient(patientData);
        setConfig(configData);

        const sessionKey = `active_screening_${user?.id || "unknown"}_${patientId}`;
        let screeningData: Screening | null = null;
        let savedScreeningId: string | null = null;

        try {
          savedScreeningId = localStorage.getItem(sessionKey);
        } catch {}

        if (savedScreeningId) {
          try {
            const savedScreening = await ScreeningService.getScreening(savedScreeningId);
            if (savedScreening.status === "DRAFT") {
              screeningData = savedScreening;
            }
          } catch (err: any) {
            if (err.status !== 404) throw err;
          }
        }

        if (!screeningData) {
          screeningData = await ScreeningService.startScreening(patientId);
          try {
            localStorage.setItem(sessionKey, screeningData.screeningId);
          } catch {}
        }

        setScreening(screeningData);

        const serverAnswers = screeningData.answers || {};
        let localDraft: ScreeningAnswers = {};
        try {
          const draftKey = `screening_draft_${screeningData.screeningId}`;
          const cached = localStorage.getItem(draftKey);
          if (cached) localDraft = JSON.parse(cached);
        } catch {}

        const mergedAnswers = { ...serverAnswers, ...localDraft };
        setAnswers(mergedAnswers);
      } catch (err: any) {
        setError(err.message || "Failed to initialize screening session");
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, [patientId, user?.id]);

  // Evaluator for conditional question visibility
  const isRuleMet = useCallback(
    (
      rule: ScreeningConditionRule,
      age: number,
      sex: PatientSex,
      currentAnswers: ScreeningAnswers
    ) => {
      switch (rule.field) {
        case "ageAtScreening":
          return age >= rule.value;
        case "sexAtScreening":
          return sex === rule.value;
        case "answers":
          return currentAnswers[rule.questionId] === rule.value;
        default:
          return false;
      }
    },
    []
  );

  const isQuestionVisible = useCallback(
    (
      question: ScreeningQuestion,
      age: number,
      sex: PatientSex,
      currentAnswers: ScreeningAnswers
    ) => {
      if (!question.showWhen) return true;
      return question.showWhen.all.every((rule) =>
        isRuleMet(rule, age, sex, currentAnswers)
      );
    },
    [isRuleMet]
  );

  // Clean inactive answers whenever parent conditions change
  const cleanInactiveAnswers = useCallback(
    (
      candidateAnswers: ScreeningAnswers,
      age: number,
      sex: PatientSex
    ) => {
      if (!config) return candidateAnswers;
      const cleaned: ScreeningAnswers = {};

      for (const question of config.questions) {
        if (question.source) continue;
        if (isQuestionVisible(question, age, sex, candidateAnswers)) {
          if (candidateAnswers[question.id] !== undefined) {
            cleaned[question.id] = candidateAnswers[question.id];
          }
        }
      }
      return cleaned;
    },
    [config, isQuestionVisible]
  );

  // Save draft to backend & localStorage
  const persistDraft = useCallback(
    async (
      updatedAnswers: ScreeningAnswers,
      screeningId: string,
      silent = false
    ): Promise<boolean> => {
      if (!screeningId) return false;
      if (!silent) setIsSavingDraft(true);
      setDraftSyncState("pending");

      try {
        localStorage.setItem(
          `screening_draft_${screeningId}`,
          JSON.stringify(updatedAnswers)
        );
      } catch {}

      try {
        await ScreeningService.saveDraft(screeningId, updatedAnswers);
        setLastSavedTime(new Date().toLocaleTimeString());
        setDraftSyncState("synced");
        return true;
      } catch (err: any) {
        setDraftSyncState("offline");
        if (!silent) setError("Could not sync draft to server: " + err.message);
        return false;
      } finally {
        if (!silent) setIsSavingDraft(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!screening) return;

    const syncDraftWhenOnline = () => {
      if (Object.keys(answers).length > 0) {
        void persistDraft(answers, screening.screeningId, true);
      }
    };

    window.addEventListener("online", syncDraftWhenOnline);
    return () => window.removeEventListener("online", syncDraftWhenOnline);
  }, [answers, persistDraft, screening]);

  // Handle answering a question
  const handleAnswerChange = (questionId: string, value: ScreeningAnswer | undefined) => {
    if (!screening) return;

    const age = screening.ageAtScreening;
    const sex = screening.sexAtScreening;

    const newAnswers = { ...answers };
    if (value === undefined) {
      delete newAnswers[questionId];
    } else {
      newAnswers[questionId] = value;
    }
    const validAnswers = cleanInactiveAnswers(newAnswers, age, sex);

    setAnswers(validAnswers);
    persistDraft(validAnswers, screening.screeningId, true);
  };

  // Submit screening handler
  const handleSubmitScreening = async () => {
    if (!screening || !config) return;
    setError(null);

    const age = screening.ageAtScreening;
    const sex = screening.sexAtScreening;

    const visibleQuestions = config.questions.filter(
      (q) => !q.source && q.required && isQuestionVisible(q, age, sex, answers)
    );

    const missingQuestions = visibleQuestions.filter(
      (q) => answers[q.id] === undefined
    );

    if (missingQuestions.length > 0) {
      setError(
        `Please answer all active questions. (${missingQuestions.length} remaining)`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const draftSynced = await persistDraft(answers, screening.screeningId, true);
      if (!draftSynced) {
        setError("Your draft is saved on this device but could not sync. Reconnect and try again.");
        return;
      }

      const result = await ScreeningService.submitScreening(screening.screeningId);

      try {
        localStorage.removeItem(`screening_draft_${screening.screeningId}`);
        localStorage.removeItem(`active_screening_${user?.id || "unknown"}_${patientId}`);
      } catch {}

      router.push(`/health-worker/screenings/${result.screeningId}/result`);
    } catch (err: any) {
      setError(err.message || "Failed to submit screening");
      setIsSubmitting(false);
    }
  };

  if (isLoading || !patient || !config || !screening) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
        <span className="text-xs font-semibold text-[#64748B]">
          Initializing standardized screening rubric...
        </span>
      </div>
    );
  }

  const age = screening.ageAtScreening;
  const sex = screening.sexAtScreening;

  const activeQuestions = config.questions.filter((q) =>
    isQuestionVisible(q, age, sex, answers)
  );

  const totalActive = activeQuestions.filter((q) => !q.source).length;
  const requiredQuestions = activeQuestions.filter((q) => !q.source && q.required);
  const totalAnswered = activeQuestions.filter(
    (q) => !q.source && answers[q.id] !== undefined
  ).length;
  const totalRequiredAnswered = requiredQuestions.filter(
    (q) => answers[q.id] !== undefined
  ).length;

  const progressPercent =
    totalActive > 0 ? Math.round((totalAnswered / totalActive) * 100) : 0;

  return (
    <div className="new-screening-wrap animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/health-worker/patients/${patient.patientId}`}
            className="p-2 bg-white border border-[#D9E3F0] rounded-xl text-[#64748B] hover:text-[#172B4D] hover:bg-[#F4F8FD] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#172B4D]">
              Patient Health Screening
            </h1>
            <p className="text-xs text-[#64748B]">
              Standard Protocol: <span className="font-semibold text-[#123B8C]">{config.protocolId}</span> (v{config.version})
            </p>
          </div>
        </div>

        {/* Draft Sync Status */}
        <div className="flex items-center gap-3">
          {lastSavedTime && (
            <span className="text-[11px] text-[#64748B] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Draft synced at {lastSavedTime}</span>
            </span>
          )}
          {draftSyncState === "pending" && (
            <span className="text-[11px] text-[#64748B]">Saving draft...</span>
          )}
          {draftSyncState === "offline" && (
            <span className="text-[11px] font-semibold text-[#D97706]">
              Saved on this device; waiting to sync
            </span>
          )}

          <button
            onClick={() => persistDraft(answers, screening.screeningId)}
            disabled={isSavingDraft}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#D9E3F0] text-[#172B4D] rounded-xl hover:bg-[#F4F8FD] transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-[#123B8C]" />
            <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
          </button>
        </div>
      </div>

      {/* Patient Demographic Snapshot Card */}
      <div className="patient-info-summary-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EDF4FE] text-[#123B8C] flex items-center justify-center font-bold text-lg">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172B4D]">{patient.name}</h2>
            <div className="flex items-center gap-3 text-xs text-[#64748B] mt-0.5">
              <span>Age at Screening: <strong className="text-[#172B4D]">{age} yrs</strong></span>
              <span>•</span>
              <span>Sex: <strong className="text-[#172B4D]">{sex}</strong></span>
              <span>•</span>
              <span>Blood Group: <strong className="text-[#123B8C]">{patient.bloodGroup}</strong></span>
            </div>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-[#172B4D]">
              {totalAnswered} of {totalActive} Answered
            </span>
            <span className="text-[11px] text-[#64748B]">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-20 bg-[#E2EAF8] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#123B8C] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-[#FFF0F2] border border-[#FFCCD2] rounded-xl text-xs text-[#DC3545] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Questions Form */}
      <div className="flex flex-col gap-4">
        {activeQuestions.map((question, index) => {
          if (question.source === "patient") {
            return (
              <div
                key={question.id}
                className="bg-[#F8FAFD] border border-[#D9E3F0] rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    Derived from Patient Record
                  </span>
                  <p className="text-sm font-bold text-[#172B4D] mt-0.5">
                    {question.text}
                  </p>
                </div>
                <span className="px-3 py-1 bg-white border border-[#D9E3F0] rounded-lg text-xs font-bold text-[#123B8C]">
                  {question.id === "q1" ? `${age} years` : sex}
                </span>
              </div>
            );
          }

          const currentAnswer = answers[question.id];
          const isAnswered = currentAnswer !== undefined;

          return (
            <div
              key={question.id}
              className={`screening-question-card ${
                !isAnswered ? "active-unanswered" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#EDF4FE] text-[#123B8C] text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#64748B]">
                      Question {question.id.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#172B4D] mt-1.5 leading-snug">
                    {question.text}
                  </h3>
                </div>

                {question.type === "boolean" ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.id, true)}
                      className={`screening-pill-btn ${
                        currentAnswer === true
                          ? "bg-[#DC3545] text-white shadow-md transform scale-105"
                          : "bg-[#F8FAFD] text-[#64748B] border border-[#D9E3F0] hover:bg-[#FFF0F2] hover:text-[#DC3545]"
                      }`}
                    >
                      <span>YES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAnswerChange(question.id, false)}
                      className={`screening-pill-btn ${
                        currentAnswer === false
                          ? "bg-[#22C55E] text-white shadow-md transform scale-105"
                          : "bg-[#F8FAFD] text-[#64748B] border border-[#D9E3F0] hover:bg-[#EBFBF0] hover:text-[#22C55E]"
                      }`}
                    >
                      <span>NO</span>
                    </button>
                  </div>
                ) : question.type === "number" ? (
                  <input
                    type="number"
                    value={typeof currentAnswer === "number" ? currentAnswer : ""}
                    onChange={(event) =>
                      handleAnswerChange(
                        question.id,
                        event.target.value === "" ? undefined : Number(event.target.value)
                      )
                    }
                    className="screening-answer-control"
                    aria-label={question.text}
                    required={question.required}
                  />
                ) : (
                  <select
                    value={typeof currentAnswer === "string" ? currentAnswer : ""}
                    onChange={(event) =>
                      handleAnswerChange(question.id, event.target.value || undefined)
                    }
                    className="screening-answer-control"
                    aria-label={question.text}
                    required={question.required}
                  >
                    <option value="">Choose an answer</option>
                    {(question.options || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {question.type === "select" && !question.options?.length && (
                <p className="mt-3 text-xs text-[#DC3545]">
                  Answer options are missing from the screening configuration.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 bg-[#EDF4FE] border border-[#D1E2FB] rounded-2xl flex items-center gap-3 text-xs text-[#123B8C]">
        <HelpCircle className="w-5 h-5 flex-shrink-0 text-[#2563EB]" />
        <span>
          <strong>Notice:</strong> {config.disclaimer}
        </span>
      </div>

      {/* Submit Action Bar */}
      <div className="screening-bottom-bar">
        <div className="text-xs text-[#64748B] hidden sm:block">
          {totalRequiredAnswered === requiredQuestions.length ? (
            <span className="text-[#22C55E] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Required questions completed
            </span>
          ) : (
            <span>{requiredQuestions.length - totalRequiredAnswered} required question(s) remaining</span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link
            href={`/health-worker/patients/${patient.patientId}`}
            className="px-4 py-2.5 text-xs font-bold text-[#64748B] hover:text-[#172B4D] hover:bg-[#F4F8FD] rounded-xl transition"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleSubmitScreening}
            disabled={isSubmitting || totalRequiredAnswered < requiredQuestions.length}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2.5 bg-[#123B8C] hover:bg-[#0B255C] text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Evaluating Risk...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Screening</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
