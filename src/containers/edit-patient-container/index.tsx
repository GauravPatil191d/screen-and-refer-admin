"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PatientService,
  PatientSex,
  BloodGroup,
} from "@/service/patientService";
import {
  ArrowLeft,
  AlertCircle,
  Save,
  User,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import "./style.css";

interface EditPatientContainerProps {
  patientId: string;
}

export const EditPatientContainer: React.FC<EditPatientContainerProps> = ({
  patientId,
}) => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<PatientSex>(PatientSex.FEMALE);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(BloodGroup.O_POSITIVE);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const patient = await PatientService.getPatientById(patientId);
        setName(patient.name);
        setEmail(patient.email || "");
        setPhone(patient.phone);
        setDob(new Date(patient.dob).toISOString().split("T")[0]);
        setSex(patient.sex);
        setBloodGroup(patient.bloodGroup);
      } catch (err: any) {
        setError(err.message || "Unable to load patient record");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the patient's full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!dob) {
      setError("Please select date of birth.");
      return;
    }

    setIsSubmitting(true);
    try {
      await PatientService.updatePatient(patientId, {
        name: name.trim(),
        email: email.trim() ? email.trim() : undefined,
        phone: phone.trim(),
        dob,
        sex,
        bloodGroup,
      });

      router.push(`/health-worker/patients/${patientId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update patient profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
        <span className="text-xs font-semibold text-[#64748B]">Loading patient details...</span>
      </div>
    );
  }

  return (
    <div className="edit-patient-wrap animate-fade-in">
      {/* Back button & title */}
      <div className="flex items-center gap-3">
        <Link
          href={`/health-worker/patients/${patientId}`}
          className="p-2 bg-white border border-[#D9E3F0] rounded-xl text-[#64748B] hover:text-[#172B4D] hover:bg-[#F4F8FD] transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D]">Edit Patient Record</h1>
          <p className="text-xs text-[#64748B]">
            Update patient details. Note: Historical screening snapshots remain untouched.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="edit-patient-card">
        {error && (
          <div className="mb-6 p-4 bg-[#FFF0F2] border border-[#FFCCD2] rounded-xl text-xs text-[#DC3545] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-patient-form">
          {/* Patient Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="patient-name" className="text-xs font-bold text-[#172B4D]">
              Full Name <span className="text-[#DC3545]">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-3.5 text-[#64748B] pointer-events-none" />
              <input
                id="patient-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="edit-patient-input"
                required
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="patient-phone" className="text-xs font-bold text-[#172B4D]">
                Mobile Phone <span className="text-[#DC3545]">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 absolute left-3.5 text-[#64748B] pointer-events-none" />
                <input
                  id="patient-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="edit-patient-input"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="patient-email" className="text-xs font-bold text-[#172B4D]">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-[#64748B] pointer-events-none" />
                <input
                  id="patient-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="edit-patient-input"
                />
              </div>
            </div>
          </div>

          {/* DOB, Sex & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="patient-dob" className="text-xs font-bold text-[#172B4D]">
                Date of Birth <span className="text-[#DC3545]">*</span>
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 absolute left-3.5 text-[#64748B] pointer-events-none" />
                <input
                  id="patient-dob"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="edit-patient-input"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="patient-sex" className="text-xs font-bold text-[#172B4D]">
                Sex <span className="text-[#DC3545]">*</span>
              </label>
              <select
                id="patient-sex"
                value={sex}
                onChange={(e) => setSex(e.target.value as PatientSex)}
                className="edit-patient-select"
                required
              >
                <option value={PatientSex.FEMALE}>Female</option>
                <option value={PatientSex.MALE}>Male</option>
                <option value={PatientSex.OTHER}>Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="patient-blood" className="text-xs font-bold text-[#172B4D]">
                Blood Group <span className="text-[#DC3545]">*</span>
              </label>
              <select
                id="patient-blood"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="edit-patient-select"
                required
              >
                <option value={BloodGroup.A_POSITIVE}>A+</option>
                <option value={BloodGroup.A_NEGATIVE}>A-</option>
                <option value={BloodGroup.B_POSITIVE}>B+</option>
                <option value={BloodGroup.B_NEGATIVE}>B-</option>
                <option value={BloodGroup.AB_POSITIVE}>AB+</option>
                <option value={BloodGroup.AB_NEGATIVE}>AB-</option>
                <option value={BloodGroup.O_POSITIVE}>O+</option>
                <option value={BloodGroup.O_NEGATIVE}>O-</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#D9E3F0]">
            <Link
              href={`/health-worker/patients/${patientId}`}
              className="px-5 py-2.5 bg-[#F4F8FD] text-[#64748B] text-xs font-bold rounded-xl hover:bg-[#EDF4FE] transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#123B8C] hover:bg-[#0B255C] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
