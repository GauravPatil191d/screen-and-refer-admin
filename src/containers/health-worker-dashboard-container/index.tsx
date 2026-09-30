"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLogin } from "@/context/LoginContext";
import { PatientService, Patient } from "@/service/patientService";
import {
  Users,
  UserPlus,
  Activity,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import "./style.css";

export const HealthWorkerDashboardContainer: React.FC = () => {
  const { user } = useLogin();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await PatientService.getPatients(1, 5);
        setPatients(res.data);
        setTotalPatients(res.total);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="hw-dashboard-wrap animate-fade-in">
      {/* Welcome Banner */}
      <div className="hw-hero-card">
        <div>
          <div className="hw-badge-pill">
            <Activity className="w-3.5 h-3.5 text-[#16B8D4]" />
            <span>Field Health Worker Portal</span>
          </div>
          <h1 className="hw-hero-title">
            Welcome back, {user?.name || "Health Worker"}
          </h1>
          <p className="hw-hero-desc">
            Register new community members, manage patient records, and conduct standardized health screenings.
          </p>
        </div>

        <Link href="/health-worker/patients/new" className="hw-hero-btn">
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="hw-stats-grid">
        <div className="hw-stat-card">
          <div>
            <span className="hw-stat-label">Total Patients</span>
            <span className="hw-stat-val">{isLoading ? "..." : totalPatients}</span>
            <span className="hw-stat-sub text-[#22C55E]">Registered in your region</span>
          </div>
          <div className="hw-stat-icon-wrap bg-[#EDF4FE] text-[#123B8C]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="hw-stat-card">
          <div>
            <span className="hw-stat-label">Recent Patients</span>
            <span className="hw-stat-val">{isLoading ? "..." : patients.length}</span>
            <span className="hw-stat-sub text-[#64748B]">Added recently</span>
          </div>
          <div className="hw-stat-icon-wrap bg-[#E0F9F6] text-[#14B8A6]">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>

        <div className="hw-stat-card">
          <div>
            <span className="hw-stat-label">Recent Screenings</span>
            <span className="hw-stat-val">Active</span>
            <span className="hw-stat-sub text-[#16B8D4]">Standard rubric active</span>
          </div>
          <div className="hw-stat-icon-wrap bg-[#E1F0FF] text-[#2563EB]">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="hw-stat-card">
          <div>
            <span className="hw-stat-label">High-Risk Alert</span>
            <span className="hw-stat-val text-[#DC3545]">Monitored</span>
            <span className="hw-stat-sub text-[#DC3545]">Auto-flagged to doctors</span>
          </div>
          <div className="hw-stat-icon-wrap bg-[#FFF0F2] text-[#DC3545]">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Patients Table & Quick Action */}
      <div className="hw-table-card">
        <div className="hw-table-header">
          <div>
            <h2 className="hw-table-title">Recent Patients</h2>
            <p className="hw-table-sub">
              Quickly view or launch health screenings for your recent patients
            </p>
          </div>

          <Link href="/health-worker/patients" className="hw-table-link">
            <span>View All Patients ({totalPatients})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-[#64748B] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-[#172B4D]">No patients registered yet</p>
            <p className="text-xs text-[#64748B] mt-1">Get started by adding your first patient.</p>
            <Link
              href="/health-worker/patients/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#123B8C] text-white text-xs font-bold rounded-lg shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="hw-custom-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Sex</th>
                  <th>Blood Group</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.patientId}>
                    <td className="font-semibold">{p.name}</td>
                    <td className="font-mono text-xs text-[#64748B]">{p.phone}</td>
                    <td className="text-xs">{p.sex}</td>
                    <td className="text-xs font-bold text-[#123B8C]">{p.bloodGroup}</td>
                    <td className="text-right space-x-2">
                      <Link
                        href={`/health-worker/patients/${p.patientId}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-[#F4F8FD] text-[#123B8C] border border-[#D9E3F0] rounded-lg hover:bg-[#EDF4FE]"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/health-worker/patients/${p.patientId}/screening/new`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#123B8C] text-white rounded-lg hover:bg-[#0B255C] shadow-sm"
                      >
                        <Activity className="w-3 h-3" />
                        <span>Screen</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
