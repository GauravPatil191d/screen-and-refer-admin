import axiosClient from "@/utils/axiosClient";
import { Patient } from "./patientService";
import { RiskLevel, Screening, ScreeningStatus } from "./screeningService";

export type DoctorReviewAction = "ACCEPT" | "OVERRIDE";

export interface DoctorReviewData {
  action: DoctorReviewAction;
  systemRisk: RiskLevel;
  finalRisk: RiskLevel;
  reviewedBy: string;
  reviewedAt: string;
  overrideReason?: string;
}

export interface AiSummaryData {
  available: boolean;
  english?: string;
  marathi?: string;
  generatedAt?: string;
  model?: string;
  message?: string;
}

export interface DoctorScreeningListItem {
  screeningId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  ageAtScreening: number;
  sexAtScreening: string;
  systemRisk?: RiskLevel;
  finalRisk?: RiskLevel;
  riskLevel?: RiskLevel;
  status: ScreeningStatus;
  doctorReviewStatus: "PENDING" | "REVIEWED";
  startedAt: string;
  submittedAt?: string;
  createdBy: string;
}

export interface ScreeningAuditData {
  auditId: string;
  screeningId: string;
  doctorId: string;
  action: DoctorReviewAction;
  oldRiskLevel: RiskLevel;
  newRiskLevel: RiskLevel;
  reason?: string;
  createdAt: string;
}

export interface GetDoctorScreeningsResponse {
  success: boolean;
  data: DoctorScreeningListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DoctorScreeningDetail {
  screening: Screening;
  patient: Patient;
  review?: DoctorReviewData | null;
  aiSummary?: AiSummaryData | null;
}

export interface ReviewScreeningInput {
  action: DoctorReviewAction;
  riskLevel?: RiskLevel;
  reason?: string;
}

export const DoctorService = {
  async getScreenings(
    page = 1,
    limit = 10,
    search?: string,
    riskLevel?: RiskLevel,
    status?: ScreeningStatus
  ): Promise<GetDoctorScreeningsResponse> {
    const params: Record<string, any> = { page, limit };
    if (search && search.trim()) params.search = search.trim();
    if (riskLevel) params.riskLevel = riskLevel;
    if (status) params.status = status;

    const res = await axiosClient.get<GetDoctorScreeningsResponse>(
      "/doctor/screenings",
      { params }
    );
    return res.data;
  },

  async getScreeningById(screeningId: string): Promise<DoctorScreeningDetail> {
    const res = await axiosClient.get<{
      success: boolean;
      data: DoctorScreeningDetail;
    }>(`/doctor/screenings/${screeningId}`);
    return res.data.data;
  },

  async reviewScreening(
    screeningId: string,
    input: ReviewScreeningInput
  ): Promise<Screening> {
    const res = await axiosClient.post<{ success: boolean; data: Screening }>(
      `/doctor/screenings/${screeningId}/review`,
      input
    );
    return res.data.data;
  },

  async getAuditHistory(screeningId: string): Promise<ScreeningAuditData[]> {
    const res = await axiosClient.get<{
      success: boolean;
      data: ScreeningAuditData[];
    }>(`/doctor/screenings/${screeningId}/audit`);
    return res.data.data;
  },

  async generateAiSummary(screeningId: string): Promise<AiSummaryData> {
    const res = await axiosClient.post<{
      success: boolean;
      data: AiSummaryData;
    }>(`/doctor/screenings/${screeningId}/summary`);
    return res.data.data;
  },
};
