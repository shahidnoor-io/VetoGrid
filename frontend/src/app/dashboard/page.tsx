"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  Bot,
  DoorClosed,
  TrendingDown,
  KeyRound,
  UserCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

import citData from "@/data/cit_public.json";
import scheduleData from "@/data/schedule.json";

export default function DashboardPage() {
  const { user, switchPersona, personas } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      await api.resetDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 5000);
    } catch (err: any) {
      alert(`Error resetting demo: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const handleExportSchedule = () => {
    const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <PageHeader
        title="Campus Operations & Scheduling Dashboard"
        description="Chilika Institute of Technology (CIT) — Unified Academic Timetable, Venue & Exam Command Center"
        badge="CIT Week 7 (Spectra & Midsems)"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleResetDemo} disabled={resetting}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              {resetting ? "Resetting..." : "Reset Demo Data"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportSchedule}>
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              Export schedule.json
            </Button>
            <Link href="/timetable">
              <Button variant="cit" size="sm">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Open Timetable
              </Button>
            </Link>
          </div>
        }
      />

      {/* Section 4 Four-Role Quick Switcher Banner */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#236B8E]/10 border border-[#236B8E]/20 text-[#1B4D68] flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-[#236B8E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Section 4 Four-Role Access:</span>
              <Badge variant={user.badgeVariant} className="text-[10px] font-semibold">
                Active: {user.role}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Signed in as <strong className="text-slate-800">{user.name}</strong> ({user.email}). Self-approval ban strictly enforced.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => switchPersona(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                user.id === p.id
                  ? "bg-[#1B5270] text-white shadow-xs font-bold"
                  : "bg-[#F0F4F8] text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {p.role.split(" ")[0]} ({p.id})
            </button>
          ))}
          <Link
            href="/login"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#1B5270] bg-[#E2EAF1] hover:bg-[#D5E2EC] border border-[#CBD9E5] transition-colors ml-auto md:ml-1"
          >
            <span>Full Login Portal</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Demo state reset to clean official Section 5 baseline. Exports verified with 0 hard violations.</span>
          </div>
          <Badge variant="success" className="text-[10px]">Clean Baseline Ready</Badge>
        </div>
      )}

      {/* Target Dataset Metric Indicators (Section 5 Official Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Campus Venues"
          value="27 Rooms"
          subtext="Lecture halls, labs & auditoriums"
          icon={<Building2 className="w-4 h-4 text-[#236B8E]" />}
        />
        <StatCard
          label="Faculty Members"
          value="40 Faculty"
          subtext="Daily teaching capped at <= 4h"
          icon={<Users className="w-4 h-4 text-purple-600" />}
        />
        <StatCard
          label="Weekly Contact Hours"
          value="243 Hours"
          subtext="189 sessions (0 Hard Clashes)"
          icon={<Calendar className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label="Midsem Exams"
          value="41 Exams"
          subtext="Halved seating capacity enforced"
          icon={<GraduationCap className="w-4 h-4 text-amber-600" />}
        />
        <StatCard
          label="Spectra Bookings"
          value="25 Requests"
          subtext="23 Approved (+138 pts), 1 Clashed"
          icon={<Sparkles className="w-4 h-4 text-cyan-600" />}
        />
      </div>

      {/* Architectural Readiness & Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm font-semibold">Master Timetable & Constraint Verification</CardTitle>
              <CardDescription>
                Deterministic CP-SAT solver output independently validated by validator.py
              </CardDescription>
            </div>
            <Badge variant="success" className="text-xs gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              0 Hard Violations
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Scheduled Sessions</span>
                <div className="text-xl font-bold text-slate-900">189 / 189</div>
                <span className="text-[10px] font-semibold text-emerald-600">100% Curricular Coverage</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Soft Penalty Score</span>
                <div className="text-xl font-bold text-[#1B5270]">82 Points</div>
                <span className="text-[10px] font-semibold text-slate-600">Zero Student Group Gaps</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">Booking Score</span>
                <div className="text-xl font-bold text-emerald-700">138 Points</div>
                <span className="text-[10px] font-semibold text-emerald-600">23 Approved (Zero Overlaps)</span>
              </div>
            </div>

            {/* Quick Action Navigator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <Link href="/timetable" className="p-3 rounded-xl bg-[#F0F4F8] hover:bg-[#E2EEF5] border border-slate-200 text-xs text-slate-800 transition-colors flex flex-col items-center justify-center gap-1.5 text-center group">
                <Calendar className="w-4 h-4 text-[#236B8E] group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Timetable Matrix</span>
              </Link>
              <Link href="/examinations" className="p-3 rounded-xl bg-[#F0F4F8] hover:bg-[#E2EEF5] border border-slate-200 text-xs text-slate-800 transition-colors flex flex-col items-center justify-center gap-1.5 text-center group">
                <GraduationCap className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Midsem Exams</span>
              </Link>
              <Link href="/venue-bookings" className="p-3 rounded-xl bg-[#F0F4F8] hover:bg-[#E2EEF5] border border-slate-200 text-xs text-slate-800 transition-colors flex flex-col items-center justify-center gap-1.5 text-center group">
                <DoorClosed className="w-4 h-4 text-cyan-700 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Spectra Bookings</span>
              </Link>
              <Link href="/rescheduling" className="p-3 rounded-xl bg-[#F0F4F8] hover:bg-[#E2EEF5] border border-slate-200 text-xs text-slate-800 transition-colors flex flex-col items-center justify-center gap-1.5 text-center group">
                <TrendingDown className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Rescheduling Diff</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Diagnostics & Policy Enforcement */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs font-semibold text-slate-700">Platform Governance &amp; Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800">Constraint Engine</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-100">
                  0 Hard Violations
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-800">Self-Approval Ban</span>
                </div>
                <span className="text-[10px] font-bold text-purple-700 px-2 py-0.5 rounded bg-purple-100">
                  Section 4 Enforced
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#236B8E]" />
                  <span className="text-xs font-semibold text-slate-800">AI Assistant Defense</span>
                </div>
                <span className="text-[10px] font-bold text-[#1B5270] px-2 py-0.5 rounded bg-[#E2EEF5]">
                  Red-Team Guarded
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Disruption Engine</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-100">
                  Minimal Displacement
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C5DDEB] bg-[#EBF4FA]">
            <CardContent className="p-4 space-y-2">
              <div className="text-xs font-bold text-[#1B5270] flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#236B8E]" />
                <span>Multilingual AI Assistant Ready</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-normal">
                Faculty &amp; students can request venue bookings in English or Hinglish. Protected by red-team prompt injection guardrails with 100% deterministic validity checks.
              </p>
              <Link href="/assistant">
                <Button size="sm" variant="cit" className="w-full text-xs">
                  Launch Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
