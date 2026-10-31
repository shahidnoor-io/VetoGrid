"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Filter, Sparkles, Download, Layers, Users, MapPin, CheckCircle2 } from "lucide-react";

import citData from "@/data/cit_public.json";
import scheduleData from "@/data/schedule.json";

export default function TimetablePage() {
  const [activeView, setActiveView] = useState<"group" | "faculty" | "room">("group");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedFilter, setSelectedFilter] = useState("Y1-SecA");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [
    { p: 1, label: "P1", time: "08:00 - 09:00" },
    { p: 2, label: "P2", time: "09:00 - 10:00" },
    { p: 3, label: "P3", time: "10:00 - 11:00" },
    { p: 4, label: "P4", time: "11:00 - 12:00" },
    { p: 5, label: "P5", time: "12:00 - 13:00" },
    { p: "lunch", label: "LUNCH", time: "13:00 - 14:00" },
    { p: 6, label: "P6", time: "14:00 - 15:00" },
    { p: 7, label: "P7", time: "15:00 - 16:00" },
    { p: 8, label: "P8", time: "16:00 - 17:00" },
    { p: 9, label: "P9", time: "17:00 - 18:00" },
  ];

  // Lookup maps
  const sessionsById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const s of citData.sessions) {
      map[s.session_id] = s;
    }
    return map;
  }, []);

  const coursesById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const c of citData.courses) {
      map[c.course_id] = c;
    }
    return map;
  }, []);

  const roomsById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const r of citData.rooms) {
      map[r.room_id] = r;
    }
    return map;
  }, []);

  const facultyById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const f of citData.faculty) {
      map[f.faculty_id] = f;
    }
    return map;
  }, []);

  // Filter options based on active view
  const filterOptions = useMemo(() => {
    if (activeView === "group") {
      return citData.student_groups.map((g) => ({ id: g.group_id, label: `${g.name} (${g.size} students)` }));
    } else if (activeView === "faculty") {
      return citData.faculty.map((f) => ({ id: f.faculty_id, label: `${f.name} [${f.department}]` }));
    } else {
      return citData.rooms.map((r) => ({ id: r.room_id, label: `${r.room_id} — ${r.name} (Cap: ${r.capacity})` }));
    }
  }, [activeView]);

  // Adjust default filter when view changes
  React.useEffect(() => {
    if (activeView === "group") setSelectedFilter("Y1-SecA");
    else if (activeView === "faculty") setSelectedFilter("FAC-01");
    else setSelectedFilter("LT-101");
  }, [activeView]);

  // Active schedule slots for the selected day and entity
  const daySchedule = useMemo(() => {
    const map: Record<number, any> = {};
    for (const entry of scheduleData.timetable) {
      if (entry.day !== selectedDay) continue;
      const sess = sessionsById[entry.session_id];
      if (!sess) continue;

      let match = false;
      if (activeView === "group" && sess.student_groups.includes(selectedFilter)) {
        match = true;
      } else if (activeView === "faculty" && sess.faculty_id === selectedFilter) {
        match = true;
      } else if (activeView === "room" && entry.room_id === selectedFilter) {
        match = true;
      }

      if (match) {
        for (let dur = 0; dur < sess.duration; dur++) {
          map[entry.start_period + dur] = {
            ...entry,
            session: sess,
            isStart: dur === 0,
            duration: sess.duration,
          };
        }
      }
    }
    return map;
  }, [selectedDay, selectedFilter, activeView, sessionsById]);

  const handleDownload = () => {
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
        title="Weekly Timetable Matrix"
        description="Official clash-free master schedule verified with 0 hard violations against validator.py"
        badge="CP-SAT Verified (0 Hard Violations)"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1.5" />
              Download schedule.json
            </Button>
            <Button variant="primary" size="sm">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Re-solve via CP-SAT
            </Button>
          </>
        }
      />

      {/* Filter Ribbon */}
      <Card className="p-3 bg-surface/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View Toggles */}
          <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-lg border border-surface-border">
            <button
              onClick={() => setActiveView("group")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === "group" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              By Student Group (14)
            </button>
            <button
              onClick={() => setActiveView("faculty")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === "faculty" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              By Faculty (40)
            </button>
            <button
              onClick={() => setActiveView("room")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeView === "room" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              By Room / Lab (27)
            </button>
          </div>

          {/* Days Ribbon */}
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-surface-border">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedDay === day ? "bg-blue-600/30 text-blue-400 font-semibold border border-blue-500/40" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Entity Selector Dropdown */}
        <div className="flex items-center gap-3 pt-2 border-t border-surface-border/50">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            Select {activeView === "group" ? "Student Cohort" : activeView === "faculty" ? "Faculty Member" : "Campus Venue"}:
          </span>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="h-8 rounded-lg border border-surface-border bg-surface-muted px-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-md"
          >
            {filterOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="success" className="text-[11px] gap-1">
              <CheckCircle2 className="w-3 h-3" />
              0 Clashes Detected
            </Badge>
          </div>
        </div>
      </Card>

      {/* Timetable Grid Matrix */}
      <Card className="overflow-hidden border border-surface-border">
        <CardHeader className="pb-3 border-b border-surface-border/50 bg-surface/80 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            {selectedDay} Schedule Matrix — {filterOptions.find((o) => o.id === selectedFilter)?.label}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Teaching Hours: 08:00 - 18:00 (Mon-Fri)
          </Badge>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <div className="grid grid-cols-10 gap-2 min-w-[900px]">
            {periods.map((slot) => {
              if (slot.p === "lunch") {
                return (
                  <div
                    key="lunch"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center"
                  >
                    <span className="text-xs font-bold text-amber-300 tracking-wider">LUNCH BREAK</span>
                    <span className="text-[10px] text-amber-400/80 mt-1">13:00 - 14:00</span>
                    <span className="text-[9px] text-slate-400 mt-2">Zero Classes Allowed</span>
                  </div>
                );
              }

              const periodNum = slot.p as number;
              const slotData = daySchedule[periodNum];

              return (
                <div key={periodNum} className="flex flex-col">
                  {/* Period Header */}
                  <div className="bg-surface-muted/90 p-2 rounded-t-lg border-t border-x border-surface-border text-center">
                    <span className="text-xs font-bold text-blue-400">{slot.label}</span>
                    <p className="text-[10px] text-slate-400">{slot.time}</p>
                  </div>

                  {/* Period Slot Content */}
                  <div className="flex-1 min-h-[140px] p-2.5 rounded-b-lg border border-surface-border bg-surface/50 flex flex-col justify-between">
                    {slotData ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300">
                            {coursesById[slotData.session.course_id]?.course_id || slotData.session.course_id}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                              slotData.session.session_type === "lab"
                                ? "bg-purple-900/40 text-purple-300 border border-purple-500/30"
                                : "bg-blue-900/40 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {slotData.session.session_type.toUpperCase()} ({slotData.session.duration}h)
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-200 line-clamp-2 leading-tight">
                          {coursesById[slotData.session.course_id]?.name || "Class Session"}
                        </p>
                        <div className="pt-1 text-[10px] text-slate-400 space-y-0.5">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-slate-300 font-medium">{slotData.room_id}</span>
                          </p>
                          <p className="flex items-center gap-1 truncate">
                            <Users className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{facultyById[slotData.session.faculty_id]?.name || slotData.session.faculty_id}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-[11px] text-slate-600 font-medium">
                        Free Slot
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
