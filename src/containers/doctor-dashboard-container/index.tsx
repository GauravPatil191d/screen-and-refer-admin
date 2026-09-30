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
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  FileText,
} from "lucide-react";
import "./style.css";

export default function DoctorDashboardContainer() {
  const { user } = useLogin();

  const [screenings, setScreenings] = useState<DoctorScreeningListItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [search, setSearch] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<ScreeningStatus | "ALL">(
    "ALL"
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScreenings = useCallback(
    async (
      currentPage: number,
      querySearch?: string,
      risk?: RiskLevel | "ALL",
      status?: ScreeningStatus | "ALL"
    ) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <span className="dd-badge dd-badge--high">
            <AlertTriangle className="w-3 h-3" />
            <span>HIGH</span>
          </span>
        );
      case RiskLevel.MEDIUM:
        return (
          <span className="dd-badge dd-badge--medium">
            <Activity className="w-3 h-3" />
            <span>MEDIUM</span>
          </span>
        );
      case RiskLevel.LOW:
      default:
        return (
          <span className="dd-badge dd-badge--low">
            <CheckCircle2 className="w-3 h-3" />
            <span>LOW</span>
          </span>
        );
    }
  };

  const pendingCount = screenings.filter(
    (s) => s.doctorReviewStatus === "PENDING"
  ).length;
  const reviewedCount = screenings.filter(
    (s) => s.doctorReviewStatus === "REVIEWED"
  ).length;
  const highRiskCount = screenings.filter(
    (s) =>
      s.finalRisk === RiskLevel.HIGH || s.systemRisk === RiskLevel.HIGH
  ).length;

  return (
    <div className="doctor-dashboard-container">
      {/* ================= Welcome Banner ================= */}
      <section className="dd-banner">
        <div className="dd-banner-content">
          <span className="dd-banner-badge">
            <Activity className="w-3.5 h-3.5" />
            <span>Doctor Clinical Review Console</span>
          </span>
          <h1 className="dd-banner-title">
            Welcome, Dr. {user?.name || "Physician"}
          </h1>
          <p className="dd-banner-desc">
            Review completed screenings across all health workers, evaluate risk
            levels, provide clinical overrides, and generate AI summaries.
          </p>
        </div>

        <div className="dd-banner-stat">
          <span className="dd-banner-stat-label">Total Screenings</span>
          <span className="dd-banner-stat-value">{total}</span>
        </div>
      </section>

      {/* ================= Metric Cards ================= */}
      <section className="dd-metrics">
        <div className="dd-metric-card">
          <div className="dd-metric-body">
            <span className="dd-metric-label">Pending Reviews</span>
            <span className="dd-metric-value dd-metric-value--pending">
              {isLoading ? "—" : pendingCount}
            </span>
            <span className="dd-metric-hint">
              Awaiting physician verification
            </span>
          </div>
          <div className="dd-metric-icon dd-metric-icon--pending">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="dd-metric-card">
          <div className="dd-metric-body">
            <span className="dd-metric-label">High Risk Screenings</span>
            <span className="dd-metric-value dd-metric-value--high">
              {isLoading ? "—" : highRiskCount}
            </span>
            <span className="dd-metric-hint dd-metric-hint--high">
              Priority triage required
            </span>
          </div>
          <div className="dd-metric-icon dd-metric-icon--high">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="dd-metric-card">
          <div className="dd-metric-body">
            <span className="dd-metric-label">Reviewed Cases</span>
            <span className="dd-metric-value dd-metric-value--ok">
              {isLoading ? "—" : reviewedCount}
            </span>
            <span className="dd-metric-hint dd-metric-hint--ok">
              Decisions recorded in audit
            </span>
          </div>
          <div className="dd-metric-icon dd-metric-icon--ok">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* ================= Search & Filters ================= */}
      <section className="dd-toolbar">
        <form onSubmit={handleSearchSubmit} className="dd-search-form">
          <div className="dd-search-field">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Patient Name, ID, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dd-search-input"
            />
          </div>
          <button type="submit" className="dd-btn dd-btn--primary">
            Search
          </button>
        </form>

        <div className="dd-filters">
          <div className="dd-filter">
            <span className="dd-filter-label">
              <Filter className="w-3.5 h-3.5" />
              Risk
            </span>
            <div className="dd-select-wrap">
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value as RiskLevel | "ALL");
                  setPage(1);
                }}
                className="dd-select"
              >
                <option value="ALL">All Risks</option>
                <option value={RiskLevel.HIGH}>High Risk</option>
                <option value={RiskLevel.MEDIUM}>Medium Risk</option>
                <option value={RiskLevel.LOW}>Low Risk</option>
              </select>
              <ChevronDown className="dd-select-chevron w-4 h-4" />
            </div>
          </div>

          <div className="dd-filter">
            <span className="dd-filter-label">Screening</span>
            <div className="dd-select-wrap">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ScreeningStatus | "ALL");
                  setPage(1);
                }}
                className="dd-select"
              >
                <option value="ALL">All Statuses</option>
                <option value={ScreeningStatus.COMPLETED}>Completed</option>
                <option value={ScreeningStatus.DRAFT}>Drafts</option>
              </select>
              <ChevronDown className="dd-select-chevron w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= Error Banner ================= */}
      {error && (
        <div className="dd-alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ================= Review Queue Table ================= */}
      <section className="dd-table-card">
        {isLoading ? (
          <div className="dd-state">
            <div className="dd-spinner" />
            <span className="dd-state-text">Loading screening queue...</span>
          </div>
        ) : screenings.length === 0 ? (
          <div className="dd-state">
            <FileText className="dd-state-icon w-10 h-10" />
            <p className="dd-state-title">No screenings found in queue</p>
            <p className="dd-state-text">
              Screenings submitted by health workers will appear here.
            </p>
          </div>
        ) : (
          <div className="dd-table-scroll">
            <table className="dd-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Phone</th>
                  <th>Age / Sex</th>
                  <th>Calculated Risk</th>
                  <th>Doctor Review</th>
                  <th>Date</th>
                  <th className="dd-col-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {screenings.map((s) => {
                  const effectiveRisk =
                    s.finalRisk || s.systemRisk || s.riskLevel;
                  const isReviewed = s.doctorReviewStatus === "REVIEWED";

                  return (
                    <tr key={s.screeningId}>
                      <td>
                        <div className="dd-cell-name">
                          {s.patientName || "Patient"}
                        </div>
                        <div className="dd-cell-id">{s.screeningId}</div>
                      </td>

                      <td>
                        <span className="dd-cell-mono">
                          {s.patientPhone || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="dd-cell-strong">
                          {s.ageAtScreening} yrs • {s.sexAtScreening}
                        </span>
                      </td>

                      <td>{getRiskBadge(effectiveRisk)}</td>

                      <td>
                        {isReviewed ? (
                          <span className="dd-review dd-review--done">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <span className="dd-review dd-review--pending">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="dd-cell-muted">
                          {s.submittedAt
                            ? new Date(s.submittedAt).toLocaleDateString()
                            : new Date(s.startedAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="dd-col-right">
                        <Link
                          href={`/doctor/screenings/${s.screeningId}`}
                          className="dd-action-btn"
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

        {/* ================= Pagination ================= */}
        <div className="dd-pagination">
          <span className="dd-pagination-info">
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>{" "}
            &nbsp;•&nbsp; <strong>{total}</strong> total screenings
          </span>

          <div className="dd-pagination-controls">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="dd-page-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="dd-page-indicator">
              Page {page} / {totalPages}
            </span>

            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="dd-page-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}