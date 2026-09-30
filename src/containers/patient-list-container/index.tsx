"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PatientService,
  Patient,
} from "@/service/patientService";
import {
  Search,
  UserPlus,
  Activity,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye,
} from "lucide-react";
import "./style.css";

export const PatientListContainer: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPatients = useCallback(
    async (currentPage: number, searchQuery?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await PatientService.getPatients(currentPage, 10, searchQuery);
        setPatients(res.data);
        setPage(res.page);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total);
      } catch (err: any) {
        setError(err.message || "Unable to load patient directory");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPatients(page, search);
  }, [page, fetchPatients]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatients(1, search);
  };

  const handleDelete = async (patientId: string) => {
    if (!confirm("Are you sure you want to remove this patient record?")) return;
    setDeletingId(patientId);
    try {
      await PatientService.deletePatient(patientId);
      fetchPatients(page, search);
    } catch (err: any) {
      alert(err.message || "Failed to delete patient");
    } finally {
      setDeletingId(null);
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

  return (
    <div className="patient-list-wrap animate-fade-in">
      {/* Header with Search & Register Button */}
      <div className="patient-list-header">
        <div>
          <h1 className="patient-list-title">Patient Directory</h1>
          <p className="patient-list-desc">
            Search, manage, and conduct health screenings for registered community members.
          </p>
        </div>

        <Link href="/health-worker/patients/new" className="patient-register-btn">
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="patient-search-card">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by English/Devanagari Name (e.g. सुरेखा, John) or Phone Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#F8FAFD] border border-[#D9E3F0] rounded-xl text-[#172B4D] focus:bg-white focus:outline-none focus:border-[#123B8C]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-[#123B8C] text-white text-xs font-bold rounded-xl hover:bg-[#0B255C] transition"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchPatients(1, "");
              }}
              className="px-3 py-2 bg-[#F4F8FD] text-[#64748B] text-xs font-semibold rounded-xl hover:bg-[#EDF4FE] transition"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-[#FFF0F2] border border-[#FFCCD2] rounded-xl text-xs text-[#DC3545] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Patients Table */}
      <div className="patient-table-card">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
            <span className="text-xs font-semibold text-[#64748B]">Loading patient records...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center text-[#64748B]">
            <p className="text-sm font-semibold text-[#172B4D]">No patients found</p>
            <p className="text-xs mt-1">
              {search ? "Try a different name or phone number search." : "No patients have been registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Phone Number</th>
                  <th>Age / DOB</th>
                  <th>Sex</th>
                  <th>Blood Group</th>
                  <th>Registered On</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E3F0]">
                {patients.map((p) => (
                  <tr key={p.patientId}>
                    <td className="font-semibold">{p.name}</td>
                    <td className="font-mono text-xs text-[#64748B]">{p.phone}</td>
                    <td className="text-xs">
                      <span className="font-bold">{calculateAge(p.dob)} yrs</span>
                      <span className="text-[#64748B] block text-[11px]">
                        {new Date(p.dob).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="text-xs font-medium">{p.sex}</td>
                    <td className="text-xs font-bold text-[#123B8C]">{p.bloodGroup}</td>
                    <td className="text-xs text-[#64748B]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        href={`/health-worker/patients/${p.patientId}/screening/new`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-[#123B8C] text-white rounded-lg hover:bg-[#0B255C] shadow-sm"
                        title="Start Screening"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Screen</span>
                      </Link>

                      <Link
                        href={`/health-worker/patients/${p.patientId}`}
                        className="inline-flex items-center p-1.5 text-xs font-semibold bg-[#F4F8FD] text-[#123B8C] border border-[#D9E3F0] rounded-lg hover:bg-[#EDF4FE]"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/health-worker/patients/${p.patientId}/edit`}
                        className="inline-flex items-center p-1.5 text-xs font-semibold bg-[#F4F8FD] text-[#64748B] border border-[#D9E3F0] rounded-lg hover:bg-[#EDF4FE]"
                        title="Edit Patient"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDelete(p.patientId)}
                        disabled={deletingId === p.patientId}
                        className="inline-flex items-center p-1.5 text-xs font-semibold bg-[#FFF0F2] text-[#DC3545] border border-[#FFCCD2] rounded-lg hover:bg-[#FFE4E8]"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="patient-pagination">
          <span>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total patients)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 bg-white border border-[#D9E3F0] rounded-lg hover:bg-[#F4F8FD] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[#172B4D] px-2">Page {page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 bg-white border border-[#D9E3F0] rounded-lg hover:bg-[#F4F8FD] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
