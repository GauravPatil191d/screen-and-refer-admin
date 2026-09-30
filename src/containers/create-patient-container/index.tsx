"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PatientService,
  PatientSex,
  BloodGroup,
} from "@/service/patientService";
import {
  UserPlus,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User,
} from "lucide-react";
import "./style.css";

export const CreatePatientContainer: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<PatientSex>(PatientSex.FEMALE);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(BloodGroup.O_POSITIVE);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the patient's full name (English or Devanagari).");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!dob) {
      setError("Please select a valid date of birth.");
      return;
    }

    const selectedDob = new Date(dob);
    if (selectedDob > new Date()) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    setIsSubmitting(true);
    try {
      const patient = await PatientService.createPatient({
        name: name.trim(),
        email: email.trim() ? email.trim() : undefined,
        phone: phone.trim(),
        dob: dob,
        sex,
        bloodGroup,
      });

      router.push(`/health-worker/patients/${patient.patientId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create patient. Please check phone number for duplicates.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-patient-wrap animate-fade-in">
      {/* Back button & title */}
      <div className="flex items-center gap-3">
        <Link
          href="/health-worker/patients"
          className="p-2 bg-white border border-[#D9E3F0] rounded-xl text-[#64748B] hover:text-[#172B4D] hover:bg-[#F4F8FD] transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D]">Register New Patient</h1>
          <p className="text-xs text-[#64748B]">
            Add a community patient record before launching their health screening.
          </p>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="create-patient-card">
        {error && (
          <div className="mb-6 p-4 bg-[#FFF0F2] border border-[#FFCCD2] rounded-xl text-xs text-[#DC3545] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-patient-form">
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
                placeholder="e.g. सुरेखा पाटील or Rajesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="create-patient-input"
                required
              />
            </div>
            <span className="text-[11px] text-[#64748B]">
              Unicode / Devanagari script is fully supported.
            </span>
          </div>

          {/* Phone & Email Grid */}
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
                  placeholder="e.g. 9876543210 or +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="create-patient-input"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="patient-email" className="text-xs font-bold text-[#172B4D]">
                Email Address <span className="text-[#64748B] font-normal">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-[#64748B] pointer-events-none" />
                <input
                  id="patient-email"
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="create-patient-input"
                />
              </div>
            </div>
          </div>

          {/* Date of Birth, Sex & Blood Group Grid */}
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
                  className="create-patient-input"
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
                className="create-patient-select"
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
                className="create-patient-select"
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

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#D9E3F0]">
            <Link
              href="/health-worker/patients"
              className="px-5 py-2.5 bg-[#F4F8FD] text-[#64748B] text-xs font-bold rounded-xl hover:bg-[#EDF4FE] transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#123B8C] hover:bg-[#0B255C] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering Patient...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register &amp; Proceed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
