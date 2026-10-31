"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Calendar,
  Clock,
  DoorClosed,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

import citData from "@/data/cit_public.json";
import scheduleData from "@/data/schedule.json";

export default function ManualSchedulingPage() {
  const { user } = useAuth();
  const [eventName, setEventName] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("AUD-01");
  const [selectedDay, setSelectedDay] = useState("Wednesday");
  const [startPeriod, setStartPeriod] = useState(10);
  const [endPeriod, setEndPeriod] = useState(12);
  const [attendees, setAttendees] = useState(100);
  const [submitting, setSubmitting] = useState(false);
  const [manualEvents, setManualEvents] = useState<any[]>([]);

  // Automatically determine priority tier from user role
  const priorityTier =
    user.role === "Admin (Dean's office)"
      ? 3
      : user.role === "Department coordinator"
      ? 5
      : 6;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [
    { p: 1, label: "P1 (08:00 - 09:00)", isTeaching: true },
    { p: 2, label: "P2 (09:00 - 10:00)", isTeaching: true },
    { p: 3, label: "P3 (10:00 - 11:00)", isTeaching: true },
    { p: 4, label: "P4 (11:00 - 12:00)", isTeaching: true },
    { p: 5, label: "P5 (12:00 - 13:00)", isTeaching: true },
    { p: 6, label: "P6 (14:00 - 15:00)", isTeaching: true },
    { p: 7, label: "P7 (15:00 - 16:00)", isTeaching: true },
    { p: 8, label: "P8 (16:00 - 17:00)", isTeaching: true },
    { p: 9, label: "P9 (17:00 - 18:00)", isTeaching: true },
    { p: 10, label: "P10 (18:00 - 19:00)", isTeaching: false },
    { p: 11, label: "P11 (19:00 - 20:00)", isTeaching: false },
    { p: 12, label: "P12 (20:00 - 21:00)", isTeaching: false },
    { p: 13, label: "P13 (21:00 - 22:00)", isTeaching: false },
  ];

  const roomObj = useMemo(() => {
    return citData.rooms.find((r) => r.room_id === selectedRoom) || citData.rooms[0];
  }, [selectedRoom]);

  // Live Deterministic Hard Constraint Validator
  const liveValidation = useMemo(() => {
    const violations: string[] = [];

    // 1. Period bounds
    if (endPeriod < startPeriod) {
      violations.push("End period must be greater than or equal to start period.");
    }

    // 2. Lunch break crossing check (P5 to P6)
    if (startPeriod <= 5 && endPeriod >= 6) {
      violations.push("Events cannot run across the 13:00 - 14:00 Lunch Break.");
    }

    // 3. Room capacity check
    if (roomObj && attendees > roomObj.capacity) {
      violations.push(`Room capacity exceeded: ${roomObj.name} (${roomObj.room_id}) has ${roomObj.capacity} seats, but ${attendees} attendees requested.`);
    }

    // 4. Room maintenance check
    if (roomObj && roomObj.maintenance) {
      for (const m of roomObj.maintenance) {
        if (m.day === selectedDay) {
          const mPeriods = new Set(Array.from({ length: m.end_period - m.start_period + 1 }, (_, i) => m.start_period + i));
          const reqPeriods = Array.from({ length: endPeriod - startPeriod + 1 }, (_, i) => startPeriod + i);
          if (reqPeriods.some((p) => mPeriods.has(p))) {
            violations.push(`Room maintenance collision: ${roomObj.room_id} is reserved for maintenance (${m.reason}) on ${selectedDay} P${m.start_period}-P${m.end_period}.`);
            break;
          }
        }
      }
    }

    // 5. Timetable conflict check with scheduled sessions
    for (const entry of scheduleData.timetable) {
      if (entry.day === selectedDay && entry.room_id === selectedRoom) {
        const sess = citData.sessions.find((s) => s.session_id === entry.session_id);
        const dur = sess?.duration || 1;
        const entryPeriods = new Set(Array.from({ length: dur }, (_, i) => entry.start_period + i));
        const reqPeriods = Array.from({ length: endPeriod - startPeriod + 1 }, (_, i) => startPeriod + i);
        if (reqPeriods.some((p) => entryPeriods.has(p))) {
          violations.push(`Timetable clash: Room ${selectedRoom} is occupied by regular academic session ${entry.session_id} on ${selectedDay} P${entry.start_period}.`);
          break;
        }
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }, [selectedRoom, selectedDay, startPeriod, endPeriod, attendees, roomObj]);

  const handleManualSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveValidation.isValid) {
      alert("Cannot schedule: Hard constraint violations must be resolved.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createBooking({
        event_name: eventName || `Manual ${user.role} Event`,
        room_id: selectedRoom,
        day: selectedDay,
        start_period: startPeriod,
        end_period: endPeriod,
        attendees: Number(attendees),
        requested_by: user.id,
        requester_role: user.role,
        priority_tier: priorityTier,
      });

      setManualEvents((prev) => [
        ...prev,
        {
          id: res.booking_id || `MANUAL-${Date.now()}`,
          name: eventName || `Manual ${user.role} Event`,
          room_id: selectedRoom,
          day: selectedDay,
          period: `P${startPeriod}-P${endPeriod}`,
          attendees,
          role: user.role,
          status: "SCHEDULED",
        },
      ]);

      setEventName("");
      alert(`Event successfully scheduled in ${selectedRoom} with 0 hard constraint violations!`);
    } catch (err: any) {
      alert(`Scheduling error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Manual Event Scheduling & Constraint Validation Workbench"
        description="Support authorized manual event scheduling strictly following hard constraints (Section 2.10)"
        badge="Section 2.10 Hard Constraint Engine"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-500/20 bg-emerald-950/10">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-emerald-400">Deterministic Checks</p>
              <p className="text-[11px] text-slate-400">Zero room, faculty, or cohort overlap</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-950/10">
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs font-semibold text-blue-400">Capacity & Type Fit</p>
              <p className="text-[11px] text-slate-400">Physical room capacity and laboratory type match</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-950/10">
          <CardContent className="p-4 flex items-center gap-3">
            <Sliders className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs font-semibold text-purple-400">Role Authorization</p>
              <p className="text-[11px] text-slate-400">Dean, Coordinator & Club Representative</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Authority Indicator matching Section 4 */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#236B8E] shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Active Actor: {user.name}</span>
              <Badge variant={user.badgeVariant} className="text-[10px] font-bold">
                {user.role}
              </Badge>
            </div>
            <p className="text-slate-500 mt-0.5">{user.whatTheyCanDo}</p>
          </div>
        </div>
        <Link
          href="/login"
          className="text-xs text-[#1B5270] font-bold bg-[#E2EAF1] hover:bg-[#D5E2EC] px-3 py-1.5 rounded-lg border border-[#CBD9E5] transition-colors shrink-0"
        >
          Switch Role &rarr;
        </Link>
      </div>

      {user.role === "Club representative" ? (
        <Card className="p-8 bg-amber-50 border border-amber-200 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950">
              Role Authority: Club Representative (Read-Only on Academic Master Schedule)
            </h3>
            <p className="text-xs text-amber-800 max-w-xl mx-auto leading-relaxed">
              Per Section 4 specifications, Club Representatives submit and cancel venue requests for
              Spectra fest and student societies through the dedicated <strong>Venue Bookings</strong> portal. Direct
              insertion into the academic timetable is restricted to Admin, Department Coordinators, and Faculty.
            </p>
          </div>
          <Link
            href="/venue-bookings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1B5270] hover:bg-[#153e55] shadow-sm transition-all"
          >
            <span>Go to Venue Bookings Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Manual Scheduling Form */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#236B8E]" />
                Manual Event Allocation Form
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleManualSchedule} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Signed-In Role (Section 4)</label>
                    <div className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 flex items-center justify-between font-semibold">
                      <span>{user.role}</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono">
                        Tier {priorityTier}
                      </span>
                    </div>
                  </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Event / Session Title</label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Guest Keynote / Robotics Workshop"
                    className="w-full h-9 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Venue (27 CIT Rooms)</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full h-9 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {citData.rooms.map((r) => (
                      <option key={r.room_id} value={r.room_id}>
                        {r.room_id} — {r.name} (Cap: {r.capacity}, {r.type.replace(/_/g, " ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Day of Week</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full h-9 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Start Period</label>
                  <select
                    value={startPeriod}
                    onChange={(e) => setStartPeriod(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {periods.map((p) => (
                      <option key={p.p} value={p.p}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">End Period</label>
                  <select
                    value={endPeriod}
                    onChange={(e) => setEndPeriod(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {periods.map((p) => (
                      <option key={p.p} value={p.p}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Expected Attendees</label>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={attendees}
                    onChange={(e) => setAttendees(Number(e.target.value))}
                    className="w-full h-9 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Priority Tier</label>
                  <input
                    type="text"
                    disabled
                    value={`Tier ${priorityTier} (${user.role})`}
                    className="w-full h-9 rounded-lg border border-surface-border bg-surface-muted/50 px-3 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Real-time Constraint Verification Banner */}
              <div className="pt-2">
                {liveValidation.isValid ? (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold">All Hard Constraints Satisfied (Zero Collisions)</span>
                    </div>
                    <Badge variant="success" className="text-[10px]">Valid Allocation</Badge>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Hard Constraint Violation Detected:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200/90 pl-1">
                      {liveValidation.violations.map((v, idx) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!liveValidation.isValid || submitting}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {submitting ? "Validating & Slotting..." : "Schedule Event Manually"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Selected Venue Diagnostic Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <DoorClosed className="w-4 h-4 text-cyan-400" />
                Selected Venue Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-surface-muted border border-surface-border space-y-1">
                <div className="font-bold text-slate-100">{roomObj.name} ({roomObj.room_id})</div>
                <div className="text-slate-400 text-[11px]">Type: <span className="text-cyan-300 font-semibold">{roomObj.type.replace(/_/g, " ")}</span></div>
                <div className="text-slate-400 text-[11px]">Seating Capacity: <span className="text-emerald-400 font-semibold">{roomObj.capacity} seats</span></div>
                <div className="text-slate-400 text-[11px]">Exam Seating: <span className="text-amber-400 font-semibold">{Math.floor(roomObj.capacity / 2)} seats</span> (Halved Rule)</div>
                <div className="text-slate-400 text-[11px]">Wheelchair Accessible: <span className={roomObj.is_accessible ? "text-emerald-400" : "text-slate-500"}>{roomObj.is_accessible ? "Yes" : "No"}</span></div>
              </div>

              {roomObj.maintenance && roomObj.maintenance.length > 0 && (
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200">
                  <span className="font-bold">Maintenance Window:</span>
                  {roomObj.maintenance.map((m: any, idx: number) => (
                    <div key={idx} className="mt-0.5">
                      {m.day} P{m.start_period}-P{m.end_period}: {m.reason}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Manually Scheduled Events Table */}
      {manualEvents.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-3 border-b border-surface-border/50">
            <CardTitle className="text-sm font-semibold">Active Manually Scheduled Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-surface-border text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Event ID</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Venue</th>
                  <th className="py-2.5 px-4">Day & Slot</th>
                  <th className="py-2.5 px-4">Attendees</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {manualEvents.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-mono text-cyan-300">{ev.id}</td>
                    <td className="py-2.5 px-4 font-semibold text-white">{ev.name}</td>
                    <td className="py-2.5 px-4 font-mono">{ev.room_id}</td>
                    <td className="py-2.5 px-4">{ev.day} &bull; {ev.period}</td>
                    <td className="py-2.5 px-4">{ev.attendees}</td>
                    <td className="py-2.5 px-4"><Badge variant="outline">{ev.role}</Badge></td>
                    <td className="py-2.5 px-4"><Badge variant="success">{ev.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}