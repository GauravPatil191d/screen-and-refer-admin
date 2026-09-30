import axiosClient from "@/utils/axiosClient";

export enum PatientSex {
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHER = "OTHER",
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

export interface Patient {
  patientId: string;
  name: string;
  email?: string;
  phone: string;
  dob: string;
  sex: PatientSex;
  bloodGroup: BloodGroup;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreatePatientInput {
  name: string;
  email?: string;
  phone: string;
  dob: string;
  sex: PatientSex;
  bloodGroup: BloodGroup;
}

export interface UpdatePatientInput {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  sex?: PatientSex;
  bloodGroup?: BloodGroup;
}

export interface GetPatientsResponse {
  success: boolean;
  data: Patient[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const PatientService = {
  async getPatients(page = 1, limit = 10, search?: string): Promise<GetPatientsResponse> {
    const params: Record<string, any> = { page, limit };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const res = await axiosClient.get<GetPatientsResponse>("/patients", { params });
    return res.data;
  },

  async getPatientById(patientId: string): Promise<Patient> {
    const res = await axiosClient.get<{ success: boolean; data: Patient }>(
      `/patients/${patientId}`
    );
    return res.data.data;
  },

  async createPatient(input: CreatePatientInput): Promise<Patient> {
    const res = await axiosClient.post<{ success: boolean; data: Patient }>(
      "/patients",
      input
    );
    return res.data.data;
  },

  async updatePatient(patientId: string, input: UpdatePatientInput): Promise<Patient> {
    const res = await axiosClient.patch<{ success: boolean; data: Patient }>(
      `/patients/${patientId}`,
      input
    );
    return res.data.data;
  },

  async deletePatient(patientId: string): Promise<void> {
    await axiosClient.delete(`/patients/${patientId}`);
  },
};
