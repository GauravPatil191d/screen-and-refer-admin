"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PatientService, Patient } from "@/service/patientService";
import {
  ArrowLeft,
  Activity,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  User,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import "./style.css";

interface PatientDetailContainerProps {
  patientId: string;
}

export const PatientDetailContainer: React.FC<PatientDetailContainerProps> = ({
  patientId,
}) => {
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    async function loadPatient() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await PatientService.getPatientById(patientId);
        setPatient(data);
      } catch (err: any) {
        setError(err.message || "Unable to load patient record");
      } finally {
        setIsLoading(false);
      }
    }
    loadPatient();
  }, [patientId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this patient record?")) return;
    setIsDeleting(true);
    try {
      await PatientService.deletePatient(patientId);
      router.push("/health-worker/patients");
    } catch (err: any) {
      alert(err.message || "Failed to delete patient");
      setIsDeleting(false);
    }
  };

  const calculateAge = (dobString: string) => {
    try {
      const dob = new Date(dobString);
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch {
      return "-";
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
        <span className="text-xs font-semibold text-[#64748B]">Loading patient profile...</span>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-[#D9E3F0] text-center">
        <AlertCircle className="w-10 h-10 text-[#DC3545] mx-auto mb-2" />
        <h2 className="text-lg font-bold text-[#172B4D]">Patient Record Not Found</h2>
        <p className="text-xs text-[#64748B] mt-1">{error || "The requested patient does not exist."}</p>
        <Link
          href="/health-worker/patients"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#123B8C] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="patient-detail-wrap animate-fade-in">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/health-worker/patients"
            className="p-2 bg-white border border-[#D9E3F0] rounded-xl text-[#64748B] hover:text-[#172B4D] hover:bg-[#F4F8FD] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#172B4D]">{patient.name}</h1>
            <p className="text-xs text-[#64748B]">
              Patient ID: <span className="font-mono">{patient.patientId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/health-worker/patients/${patient.patientId}/edit`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D9E3F0] text-[#172B4D] text-xs font-bold rounded-xl hover:bg-[#F4F8FD] transition shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FFF0F2] border border-[#FFCCD2] text-[#DC3545] text-xs font-bold rounded-xl hover:bg-[#FFE4E8] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Start Screening Banner */}
      <div className="screening-banner-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
            Clinical Screening Ready
          </span>
          <h2 className="text-xl font-bold mt-1">Ready to Screen this Patient?</h2>
          <p className="text-blue-100 text-xs mt-0.5">
            Conduct a standardized dynamic questionnaire with automated risk evaluation.
          </p>
        </div>

        <Link
          href={`/health-worker/patients/${patient.patientId}/screening/new`}
          className="screening-action-btn"
        >
          <Activity className="w-4 h-4 text-[#16B8D4]" />
          <span>Start Screening</span>
        </Link>
      </div>

      {/* Patient Demographic Details Card */}
      <div className="patient-detail-card">
        <h2 className="text-base font-bold text-[#172B4D] mb-4 pb-3 border-b border-[#D9E3F0]">
          Patient Demographics &amp; Contact Info
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#EDF4FE] rounded-xl text-[#123B8C]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#64748B] block">Full Name</span>
              <span className="text-sm font-bold text-[#172B4D]">{patient.name}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#E0F9F6] rounded-xl text-[#14B8A6]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#64748B] block">Phone Number</span>
              <span className="text-sm font-bold font-mono text-[#172B4D]">
                {patient.phone}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#E1F0FF] rounded-xl text-[#2563EB]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#64748B] block">Age &amp; Date of Birth</span>
              <span className="text-sm font-bold text-[#172B4D]">
                {calculateAge(patient.dob)} yrs ({new Date(patient.dob).toLocaleDateString()})
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#FFF4E5] rounded-xl text-[#F59E0B]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#64748B] block">Biological Sex</span>
              <span className="text-sm font-bold text-[#172B4D]">{patient.sex}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#FFF0F2] rounded-xl text-[#DC3545]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#64748B] block">Blood Group</span>
              <span className="text-sm font-bold text-[#DC3545]">{patient.bloodGroup}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#F4F8FD] rounded-xl text-[#64748B]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#64748B] block">Email Address</span>
              <span className="text-sm font-medium text-[#172B4D]">
                {patient.email || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#D9E3F0] flex justify-between items-center text-xs text-[#64748B]">
          <span>Registered on: {new Date(patient.createdAt).toLocaleDateString()}</span>
          <span>Last updated: {new Date(patient.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
