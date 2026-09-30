import axiosClient from "@/utils/axiosClient";
import { Patient, PatientSex } from "./patientService";

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum ScreeningStatus {
  DRAFT = "DRAFT",
  COMPLETED = "COMPLETED",
}

export type ScreeningConditionRule =
  | { field: "ageAtScreening"; operator: "gte"; value: number }
  | { field: "sexAtScreening"; operator: "equals"; value: string }
  | { field: "answers"; questionId: string; operator: "equals"; value: boolean };

export interface ScreeningCondition {
  all: ScreeningConditionRule[];
}

export interface ScreeningQuestion {
  id: string;
  text: string;
  type: "number" | "select" | "boolean";
  source?: "patient";
  required: boolean;
  showWhen?: ScreeningCondition;
}

export interface ScreeningConfig {
  protocolId: string;
  version: string;
  disclaimer: string;
  questions: ScreeningQuestion[];
  riskRules: {
    highRiskConditions: ScreeningCondition[];
    moderateRiskQuestionIds: string[];
    scoreBands: { minimumScore: number; riskLevel: RiskLevel }[];
  };
}

export interface Screening {
  screeningId: string;
  patientId: string;
  createdBy: string;
  ageAtScreening: number;
  sexAtScreening: PatientSex;
  status: ScreeningStatus;
  configVersion: string;
  answers: Record<string, boolean>;
  inactiveAnswers?: Record<
    string,
    {
      value: boolean;
      status: "INACTIVE";
      inactiveReason: string;
      recordedAt: string;
    }
  >;
  startedAt: string;
  updatedAt: string;
  submittedAt?: string;
  riskLevel?: RiskLevel;
  systemRisk?: RiskLevel;
  finalRisk?: RiskLevel;
  reviewAction?: string;
  overrideReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  doctorReviewStatus?: "PENDING" | "REVIEWED";
  patient?: Patient;
}

export interface SubmitScreeningResponse {
  screeningId: string;
  riskLevel: RiskLevel;
  status: ScreeningStatus;
  disclaimer: string;
}

export const ScreeningService = {
  async getConfig(): Promise<ScreeningConfig> {
    const res = await axiosClient.get<{ success: boolean; data: ScreeningConfig }>(
      "/screenings/config"
    );
    return res.data.data;
  },

  async startScreening(patientId: string): Promise<Screening> {
    const res = await axiosClient.post<{ success: boolean; data: Screening }>(
      `/screenings/patients/${patientId}`
    );
    return res.data.data;
  },

  async getScreening(screeningId: string): Promise<Screening> {
    const res = await axiosClient.get<{ success: boolean; data: Screening }>(
      `/screenings/${screeningId}`
    );
    return res.data.data;
  },

  async saveDraft(
    screeningId: string,
    answers: Record<string, boolean>
  ): Promise<Screening> {
    const res = await axiosClient.patch<{ success: boolean; data: Screening }>(
      `/screenings/${screeningId}`,
      { answers }
    );
    return res.data.data;
  },

  async submitScreening(screeningId: string): Promise<SubmitScreeningResponse> {
    const res = await axiosClient.post<{
      success: boolean;
      data: SubmitScreeningResponse;
    }>(`/screenings/${screeningId}/submit`);
    return res.data.data;
  },
};
