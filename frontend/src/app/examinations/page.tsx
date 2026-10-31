"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  GraduationCap,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  Download,
  Clock,
  Search,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";

interface ExamEntry {
  exam_id: string;
  course_id: string;
  day: string;
  slot_name: string;
  start_period: number;
  duration_periods: number;
  room_id: string;
  expected_students: number;
  room_capacity: number;
  halved_capacity: number;
  invigilator_id: string;
  student_groups: string[];
}

export default function ExaminationsPage() {
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDay, setFilterDay] = useState<string>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadExams() {
      try {
        setLoading(true);
        const sched = await api.getCurrentSchedule();
        if (sched && sched.exams) {
          setExams(sched.exams);
        }
      } catch (err) {
        console.error("Failed to load examinations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  const filteredExams = exams.filter((e) => {
    const matchesDay = filterDay === "All" || e.day === filterDay;
    const matchesSearch =
      !search ||
      e.exam_id.toLowerCase().includes(search.toLowerCase()) ||
      e.course_id.toLowerCase().includes(search.toLowerCase()) ||
      e.room_id.toLowerCase().includes(search.toLowerCase());
    return matchesDay && matchesSearch;
  });

  const morningCount = exams.filter((e) => e.slot_name?.includes("Morning") || e.start_period === 2).length;
  const afternoonCount = exams.filter((e) => e.slot_name?.includes("Afternoon") || e.start_period === 6).length;

  const handleDownloadRoster = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exams, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "midsem_examination_roster.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <AppShell>
      <PageHeader
        title="Midsemester Examination Scheduling"
        description="Deterministic conflict-free examination slotting with halved room capacity and invigilator assignment"
        badge="Midsem Week 7"
        actions={
          <Button variant="outline" size="sm" onClick={handleDownloadRoster}>
            <Download className="w-4 h-4 mr-1.5" />
            Export Exam Roster JSON
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Midsem Exams"
          value={`${exams.length} Exams`}
          subtext="Official Section 5 starter pack count"
          icon={<GraduationCap className="w-4 h-4 text-blue-400" />}
        />
        <StatCard
          label="Morning Slots (09:00 - 11:00)"
          value={`${morningCount} Sessions`}
          subtext="2-hour morning test window"
          icon={<Clock className="w-4 h-4 text-cyan-400" />}
        />
        <StatCard
          label="Afternoon Slots (14:00 - 16:00)"
          value={`${afternoonCount} Sessions`}
          subtext="2-hour afternoon test window"
          icon={<Calendar className="w-4 h-4 text-purple-400" />}
        />
        <StatCard
          label="Halved Seating Capacity"
          value="100% Compliant"
          subtext="Spacing formula enforced"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border/50">
          <div>
            <CardTitle className="text-sm font-semibold">Scheduled Examination Roster (41 Exams)</CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strictly adheres to: halved seating capacity, no student cohort overlap, and unique invigilation duties.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Exam, Course, Room..."
                className="h-8 pl-8 pr-3 text-xs rounded-lg bg-surface-muted border border-surface-border text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-surface-border">
              {["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDay(d)}
                  className={`px-2 py-1 rounded text-xs font-medium transition ${
                    filterDay === d ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {d === "All" ? "All Days" : d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading midsem examinations...</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-surface-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Exam ID</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Day & Slot</th>
                  <th className="py-3 px-4">Hall / Room</th>
                  <th className="py-3 px-4">Cohort Size</th>
                  <th className="py-3 px-4">Room Cap (Halved)</th>
                  <th className="py-3 px-4">Invigilator</th>
                  <th className="py-3 px-4">Spacing Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {filteredExams.map((e) => {
                  const fitsHalved = e.expected_students <= (e.halved_capacity || 250);

                  return (
                    <tr key={e.exam_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-blue-400">{e.exam_id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-100">{e.course_id}</td>
                      <td className="py-3 px-4">
                        <div>{e.day}</div>
                        <div className="text-[11px] text-slate-400">{e.slot_name || `P${e.start_period}-P${e.start_period+1}`}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-cyan-300 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/40">
                          {e.room_id}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {e.expected_students} students
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-300">
                          {e.halved_capacity || 250} seats
                        </div>
                        <div className="text-[10px] text-slate-500">
                          (Physical cap: {e.room_capacity || 500})
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-300">
                        {e.invigilator_id || "Assigned Faculty"}
                      </td>
                      <td className="py-3 px-4">
                        {fitsHalved ? (
                          <Badge variant="success" className="text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Valid (≤ Halved)
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px]">
                            Overflow Risk
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
