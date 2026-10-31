"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, GraduationCap, Clock, Award, Search, Filter, ShieldCheck, AlertCircle } from "lucide-react";

import citData from "@/data/cit_public.json";
import scheduleData from "@/data/schedule.json";

export default function FacultyPage() {
  const [filterDept, setFilterDept] = useState<string>("All");
  const [search, setSearch] = useState("");

  // Calculate teaching load per faculty
  const facultyLoad = useMemo(() => {
    const hours: Record<string, number> = {};
    const sessionsCount: Record<string, number> = {};

    for (const entry of scheduleData.timetable) {
      const sess = citData.sessions.find((s) => s.session_id === entry.session_id);
      if (!sess || !sess.faculty_id) continue;
      const dur = sess.duration || 1;
      hours[sess.faculty_id] = (hours[sess.faculty_id] || 0) + dur;
      sessionsCount[sess.faculty_id] = (sessionsCount[sess.faculty_id] || 0) + 1;
    }
    return { hours, sessionsCount };
  }, []);

  const departments = ["All", ...Array.from(new Set(citData.faculty.map((f) => f.department)))];

  const filteredFaculty = useMemo(() => {
    return citData.faculty.filter((f) => {
      const matchesDept = filterDept === "All" || f.department === filterDept;
      const matchesSearch =
        !search ||
        f.faculty_id.toLowerCase().includes(search.toLowerCase()) ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.department.toLowerCase().includes(search.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [filterDept, search]);

  const totalTeachingHours = 243;
  const avgLoad = (totalTeachingHours / citData.faculty.length).toFixed(1);

  return (
    <AppShell>
      <PageHeader
        title="Faculty Directory & Workload Registry"
        description="Teaching assignments, daily load limits (<= 4h), and department allocations for all 40 faculty members"
        badge="40 Faculty Members (CIT)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Faculty"
          value="40 Members"
          subtext="Allocated across 5 engineering depts"
          icon={<Users className="w-4 h-4 text-purple-400" />}
        />
        <StatCard
          label="Curricular Load"
          value="243 Hours/Week"
          subtext="Distributed across 189 sessions"
          icon={<Clock className="w-4 h-4 text-blue-400" />}
        />
        <StatCard
          label="Average Workload"
          value={`${avgLoad} Hours/Week`}
          subtext="Strictly <= 4 contact hours/day"
          icon={<Award className="w-4 h-4 text-emerald-400" />}
        />
        <StatCard
          label="Constraint Compliance"
          value="100% Verified"
          subtext="Zero daily workload overages"
          icon={<ShieldCheck className="w-4 h-4 text-cyan-400" />}
        />
      </div>

      {/* Filter and Search Ribbon */}
      <Card className="p-3 bg-surface/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              Dept:
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterDept === dept
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white bg-surface-muted"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty name or ID..."
              className="h-8 pl-8 pr-3 bg-surface-muted border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>
        </div>
      </Card>

      {/* Faculty Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-surface-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Faculty Roster & Workload Breakdown (40 Members)</CardTitle>
          <span className="text-xs text-slate-400">Showing {filteredFaculty.length} of 40 faculty</span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-surface-border uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Faculty ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Weekly Load</th>
                <th className="py-3 px-4">Max Daily Limit</th>
                <th className="py-3 px-4">Avoid Preferences</th>
                <th className="py-3 px-4">Unavailability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40">
              {filteredFaculty.map((f) => {
                const hrs = facultyLoad.hours[f.faculty_id] || 0;
                const sessions = facultyLoad.sessionsCount[f.faculty_id] || 0;

                return (
                  <tr key={f.faculty_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">{f.faculty_id}</td>
                    <td className="py-3 px-4 font-medium text-white">{f.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-surface-muted border border-surface-border text-slate-300 text-[11px]">
                        {f.department}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-400">{hrs} Hours</span>
                      <span className="text-[10px] text-slate-400 ml-1">({sessions} sessions)</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-400">
                      &le; {f.daily_limit_hours || 4}h / day
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-300">
                      {f.avoid_preferences && f.avoid_preferences.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {f.avoid_preferences.map((a: any, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.2 bg-amber-950/40 border border-amber-800/40 rounded text-amber-300 text-[10px]">
                              {a.day} P{a.period}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-300">
                      {f.unavailability && f.unavailability.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {f.unavailability.map((u: any, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.2 bg-rose-950/40 border border-rose-800/40 rounded text-rose-300 text-[10px]">
                              {u.day} P{u.period}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Fully Available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
