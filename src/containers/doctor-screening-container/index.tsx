"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
  SlidersHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  FileText,
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import "./style.css";

export default function DoctorScreeningContainer() {
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

  /* ------------------------------------------------------------
     Data fetching
     ------------------------------------------------------------ */
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
        setError(err.message || "Failed to load screening queue");
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

  /* ------------------------------------------------------------
     Handlers
     ------------------------------------------------------------ */
  const hasActiveFilters =
    search.trim() !== "" || riskFilter !== "ALL" || statusFilter !== "ALL";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (page === 1) {
      // Effect will not re-run, fetch explicitly.
      fetchScreenings(1, search, riskFilter, statusFilter);
    } else {
      // Changing the page triggers the effect with the current query.
      setPage(1);
    }
  };

  const handleReset = () => {
    const effectWillRun =
      riskFilter !== "ALL" || statusFilter !== "ALL" || page !== 1;

    setSearch("");
    setRiskFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);

    if (!effectWillRun) {
      fetchScreenings(1, "", "ALL", "ALL");
    }
  };

  /* ------------------------------------------------------------
     Helpers
     ------------------------------------------------------------ */
  const getRiskBadge = (risk?: RiskLevel) => {
    switch (risk) {
      case RiskLevel.HIGH:
        return (
          <span className="ds-badge ds-badge--high">
            <AlertTriangle className="w-3 h-3" />
            <span>HIGH</span>
          </span>
        );
      case RiskLevel.MEDIUM:
        return (
          <span className="ds-badge ds-badge--medium">
            <Activity className="w-3 h-3" />
            <span>MEDIUM</span>
          </span>
        );
      case RiskLevel.LOW:
      default:
        return (
          <span className="ds-badge ds-badge--low">
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
    (s) => s.finalRisk === RiskLevel.HIGH || s.systemRisk === RiskLevel.HIGH
  ).length;

  const rangeFrom = total === 0 ? 0 : (page - 1) * 10 + 1;
  const rangeTo = Math.min(page * 10, total);

  /* ------------------------------------------------------------
     Render
     ------------------------------------------------------------ */
  return (
    <div className="ds-screen">
      {/* ============ Compact Screen Header ============ */}
      <header className="ds-header">
        <div className="ds-header-main">
          <span className="ds-header-icon">
            <ClipboardList className="w-5 h-5" />
          </span>
          <div className="ds-header-text">
            <h1 className="ds-title">Screening Queue</h1>
            <p className="ds-subtitle">
              Screenings submitted by health workers, ready for clinical review.
            </p>
          </div>
        </div>

        <span className="ds-count-badge">
          <strong>{total}</strong>
          <span>records</span>
        </span>
      </header>

      {/* ============ Inline Stats Strip ============ */}
      <section className="ds-stats-bar">
        <div className="ds-stat">
          <span className="ds-stat-icon ds-stat-icon--pending">
            <Clock className="w-5 h-5" />
          </span>
          <div className="ds-stat-body">
            <span className="ds-stat-value ds-stat-value--pending">
              {isLoading ? "—" : pendingCount}
            </span>
            <span className="ds-stat-label">Pending review</span>
          </div>
        </div>

        <div className="ds-stat">
          <span className="ds-stat-icon ds-stat-icon--high">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div className="ds-stat-body">
            <span className="ds-stat-value ds-stat-value--high">
              {isLoading ? "—" : highRiskCount}
            </span>
            <span className="ds-stat-label">High risk</span>
          </div>
        </div>

        <div className="ds-stat">
          <span className="ds-stat-icon ds-stat-icon--ok">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div className="ds-stat-body">
            <span className="ds-stat-value ds-stat-value--ok">
              {isLoading ? "—" : reviewedCount}
            </span>
            <span className="ds-stat-label">Reviewed</span>
          </div>
        </div>
      </section>

      {/* ============ Unified Queue Panel ============ */}
      <section className="ds-panel">
        {/* -------- Panel toolbar -------- */}
        <div className="ds-panel-head">
          <form onSubmit={handleSearchSubmit} className="ds-search">
            <div className="ds-search-field">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search patient name, ID or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ds-search-input"
              />
            </div>
            <button type="submit" className="ds-btn ds-btn--primary">
              Search
            </button>
          </form>

          <div className="ds-filters">
            <span className="ds-filters-icon" aria-hidden="true">
              <SlidersHorizontal className="w-4 h-4" />
            </span>

            <div className="ds-select-wrap">
              <select
                aria-label="Filter by risk level"
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value as RiskLevel | "ALL");
                  setPage(1);
                }}
                className="ds-select"
              >
                <option value="ALL">All Risks</option>
                <option value={RiskLevel.HIGH}>High Risk</option>
                <option value={RiskLevel.MEDIUM}>Medium Risk</option>
                <option value={RiskLevel.LOW}>Low Risk</option>
              </select>
              <ChevronDown className="ds-select-chevron w-4 h-4" />
            </div>

            <div className="ds-select-wrap">
              <select
                aria-label="Filter by screening status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ScreeningStatus | "ALL");
                  setPage(1);
                }}
                className="ds-select"
              >
                <option value="ALL">All Statuses</option>
                <option value={ScreeningStatus.COMPLETED}>Completed</option>
                <option value={ScreeningStatus.DRAFT}>Drafts</option>
              </select>
              <ChevronDown className="ds-select-chevron w-4 h-4" />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="ds-btn ds-btn--ghost"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* -------- Error -------- */}
        {error && (
          <div className="ds-alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* -------- Body -------- */}
        {isLoading ? (
          <div className="ds-state">
            <div className="ds-spinner" />
            <span className="ds-state-text">Loading screening queue…</span>
          </div>
        ) : screenings.length === 0 ? (
          <div className="ds-state">
            <FileText className="ds-state-icon w-10 h-10" />
            <p className="ds-state-title">No screenings found</p>
            <p className="ds-state-text">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Screenings submitted by health workers will appear here."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="ds-btn ds-btn--ghost ds-state-action"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="ds-table-scroll">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Age / Sex</th>
                  <th>Risk</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th className="ds-col-right">Action</th>
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
                        <div className="ds-cell-name">
                          {s.patientName || "Patient"}
                        </div>
                        <div className="ds-cell-id">{s.screeningId}</div>
                      </td>

                      <td>
                        <span className="ds-cell-mono">
                          {s.patientPhone || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="ds-cell-strong">
                          {s.ageAtScreening} yrs • {s.sexAtScreening}
                        </span>
                      </td>

                      <td>{getRiskBadge(effectiveRisk)}</td>

                      <td>
                        {isReviewed ? (
                          <span className="ds-review ds-review--done">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <span className="ds-review ds-review--pending">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="ds-cell-muted">
                          {s.submittedAt
                            ? new Date(s.submittedAt).toLocaleDateString()
                            : new Date(s.startedAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="ds-col-right">
                        <Link
                          href={`/doctor/screenings/${s.screeningId}`}
                          className="ds-action-btn"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isReviewed ? "View" : "Review"}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* -------- Pagination -------- */}
        <div className="ds-pagination">
          <span className="ds-pagination-info">
            {total === 0 ? (
              "No results"
            ) : (
              <>
                Showing <strong>{rangeFrom}</strong>–<strong>{rangeTo}</strong> of{" "}
                <strong>{total}</strong>
              </>
            )}
          </span>

          <div className="ds-pagination-controls">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="ds-page-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="ds-page-indicator">
              {page} <span className="ds-page-sep">/</span> {totalPages}
            </span>

            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="ds-page-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}