"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PatientService, Patient } from "@/service/patientService";
import {
  FileCheck,
  Search,
  Activity,
  ArrowRight,
  User,
  PlusCircle,
} from "lucide-react";
import "./style.css";

export default function HealthWorkerScreeningsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await PatientService.getPatients(1, 20);
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  return (
    <div className="health-worker-screenings-container flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172B4D]">My Health Screenings</h1>
          <p className="text-xs text-[#64748B]">
            Launch or review clinical health assessments for community patients.
          </p>
        </div>

        <Link
          href="/health-worker/patients"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#123B8C] hover:bg-[#0B255C] text-white text-xs font-bold rounded-xl shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch Screening from Directory</span>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-[#D9E3F0] shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Filter patient records by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[#F8FAFD] border border-[#D9E3F0] rounded-xl text-[#172B4D] focus:bg-white focus:outline-none focus:border-[#123B8C]"
          />
        </div>
      </div>

      {/* Patients Screening List */}
      <div className="bg-white rounded-xl border border-[#D9E3F0] shadow-sm overflow-hidden p-6">
        <h2 className="text-base font-bold text-[#172B4D] mb-4 pb-3 border-b border-[#D9E3F0]">
          Registered Patients Available for Screening
        </h2>

        {isLoading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#D9E3F0] border-t-[#123B8C]" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-12 text-center text-[#64748B]">
            <p className="text-sm font-semibold">No patient records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F8FAFD] text-[#64748B] text-xs font-bold uppercase border-b border-[#D9E3F0]">
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Sex</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E3F0]">
                {filteredPatients.map((p) => (
                  <tr key={p.patientId} className="hover:bg-[#F4F8FD] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#172B4D]">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#64748B]">
                      {p.phone}
                    </td>
                    <td className="py-3.5 px-4 text-xs">{p.sex}</td>
                    <td className="py-3.5 px-4 text-xs font-bold text-[#123B8C]">
                      {p.bloodGroup}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/health-worker/patients/${p.patientId}/screening/new`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#123B8C] text-white text-xs font-bold rounded-lg hover:bg-[#0B255C] shadow-sm"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Conduct Screening</span>
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
}
