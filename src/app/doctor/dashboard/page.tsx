"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLogin } from "@/context/LoginContext";
import {
  DoctorService,
  DoctorScreeningListItem,
} from "@/service/doctorService";
import { RiskLevel, ScreeningStatus } from "@/service/screeningService";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function DoctorDashboardPage() {
  const { user } = useLogin();

  const [screenings, setScreenings] = useState<DoctorScreeningListItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [search, setSearch] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<ScreeningStatus | "ALL">("ALL");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScreenings = useCallback(
    async (currentPage: number, querySearch?: string, risk?: RiskLevel | "ALL", status?: ScreeningStatus | "ALL") => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await DoctorService.getScreenings(
          currentPage,
          10,
          querySearch,
          risk === "ALL" ? undefined : risk,
          status === "ALL" ? undefined : status
        );
        setScreenings(res.data);
        setPage(res.page);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total);
      } catch (err: any) {
        setError(err.message || "Failed to load clinical review queue");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchScreenings(page, search, riskFilter, statusFilter);
  }, [page, riskFilter, statusFilter, fetchScreenings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchScreenings(1, search, riskFilter, statusFilter);
  };

  const getRiskBadge = (risk?: RiskLevel) => {
    switch (risk) {
      case RiskLevel.HIGH:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF0F2] text-[#DC3545] border border-[#FFCCD2]">
            <AlertTriangle className="w-3 h-3" />
            <span>HIGH</span>
          </span>
        );
      case RiskLevel.MEDIUM:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF8E6] text-[#D97706] border border-[#FFE5A3]">
            <Activity className="w-3 h-3" />
            <span>MEDIUM</span>
          </span>
        );
      case RiskLevel.LOW:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EBFBF0] text-[#22C55E] border border-[#C4F1D0]">
            <CheckCircle2 className="w-3 h-3" />
            <span>LOW</span>
          </span>
        );
    }
  };

  const pendingCount = screenings.filter((s) => s.doctorReviewStatus === "PENDING").length;
  const highRiskCount = screenings.filter((s) => s.finalRisk === RiskLevel.HIGH || s.systemRisk === RiskLevel.HIGH).length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#123B8C] via-[#1A4EB5] to-[#0B255C] rounded-2xl p-7 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5 text-[#16B8D4]" />
            <span>Doctor Clinical Review Console</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome, Dr. {user?.name || "Physician"}
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Review completed screenings across all health workers, evaluate risk levels, provide clinical overrides, and generate AI summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-center">
            <span className="text-[11px] uppercase tracking-wider text-blue-200 block">Total Screenings</span>
            <span className="text-xl font-black text-white">{total}</span>
          </div>
        </div>
      </div>

      {/* Doctor Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#D9E3F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
              Pending Reviews
            </span>
            <span className="text-2xl font-extrabold text-[#F59E0B] mt-1 block">
              {isLoading ? "..." : pendingCount}
            </span>
            <span className="text-xs text-[#64748B] font-medium mt-1 block">
              Awaiting physician verification
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] text-[#F59E0B] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#D9E3F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
              High Risk Screenings
            </span>
            <span className="text-2xl font-extrabold text-[#DC3545] mt-1 block">
              {isLoading ? "..." : highRiskCount}
            </span>
            <span className="text-xs text-[#DC3545] font-medium mt-1 block">
              Priority triage required
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFF0F2] text-[#DC3545] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#D9E3F0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
              Reviewed Cases
            </span>
            <span className="text-2xl font-extrabold text-[#22C55E] mt-1 block">
              {isLoading ? "..." : screenings.filter((s) => s.doctorReviewStatus === "REVIEWED").length}
            </span>
            <span className="text-xs text-[#22C55E] font-medium mt-1 block">
              Decisions recorded in audit
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EBFBF0] text-[#22C55E] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E3F0] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by Patient Name, ID, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#F8FAFD] border border-[#D9E3F0] rounded-xl text-[#172B4D] focus:bg-white focus:outline-none focus:border-[#123B8C]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#123B8C] text-white text-xs font-bold rounded-xl hover:bg-[#0B255C] transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5" />
            <span>Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#F8FAFD] border border-[#D9E3F0] rounded-lg text-xs font-semibold text-[#172B4D]"
            >
              <option value="ALL">All Risks</option>
              <option value={RiskLevel.HIGH}>High Risk</option>
              <option value={RiskLevel.MEDIUM}>Medium Risk</option>
              <option value={RiskLevel.LOW}>Low Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span>Review:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-[#F8FAFD] border border-[#D9E3F0] rounded-lg text-xs font-semibold text-[#172B4D]"
            >
              <option value="ALL">All Statuses</option>
              <option value={ScreeningStatus.COMPLETED}>Completed</option>
              <option value={ScreeningStatus.DRAFT}>Drafts</option>
            </select>
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

      {/* Screenings Review Queue Table */}
      <div className="bg-white rounded-xl border border-[#D9E3F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
            <span className="text-xs font-semibold text-[#64748B]">Loading screening queue...</span>
          </div>
        ) : screenings.length === 0 ? (
          <div className="py-16 text-center text-[#64748B]">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#172B4D]">No screenings found in queue</p>
            <p className="text-xs mt-1">Screenings submitted by health workers will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F8FAFD] text-[#64748B] text-xs font-bold uppercase border-b border-[#D9E3F0]">
                  <th className="py-3.5 px-4">Patient Details</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Age / Sex</th>
                  <th className="py-3.5 px-4">Calculated Risk</th>
                  <th className="py-3.5 px-4">Doctor Review</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E3F0]">
                {screenings.map((s) => {
                  const effectiveRisk = s.finalRisk || s.systemRisk || s.riskLevel;
                  const isReviewed = s.doctorReviewStatus === "REVIEWED";

                  return (
                    <tr key={s.screeningId} className="hover:bg-[#F4F8FD] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#172B4D]">{s.patientName || "Patient"}</div>
                        <div className="text-[11px] font-mono text-[#64748B]">{s.screeningId}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#64748B]">
                        {s.patientPhone || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#172B4D]">
                        {s.ageAtScreening} yrs • {s.sexAtScreening}
                      </td>
                      <td className="py-3.5 px-4">
                        {getRiskBadge(effectiveRisk)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#22C55E]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F59E0B]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#64748B]">
                        {s.submittedAt
                          ? new Date(s.submittedAt).toLocaleDateString()
                          : new Date(s.startedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/doctor/screenings/${s.screeningId}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#123B8C] hover:bg-[#0B255C] text-white text-xs font-bold rounded-lg shadow-sm transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isReviewed ? "View Case" : "Review"}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-[#D9E3F0] bg-[#F8FAFD] gap-3 text-xs text-[#64748B]">
          <span>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total screenings)
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
}
