"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/shared/AppShell";
import {
  Calendar,
  Sparkles,
  SlidersHorizontal,
  Accessibility,
  Check,
  AlertTriangle,
  X,
  Edit2,
  CalendarPlus,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import citData from "@/data/cit_public.json";
import scheduleData from "@/data/schedule.json";

// Realistic Room SVG Thumbnail Renderers
function RoomThumbnail({ type, roomId }: { type: string; roomId: string }) {
  if (roomId.includes("AUD") || type === "auditorium") {
    return (
      <div className="w-full h-32 rounded-lg bg-gradient-to-b from-slate-900 to-[#1A2536] overflow-hidden relative border border-slate-200/40">
        <svg viewBox="0 0 300 120" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="audStage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A7599" />
              <stop offset="100%" stopColor="#1B334B" />
            </linearGradient>
            <linearGradient id="seatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8C2D35" />
              <stop offset="100%" stopColor="#4A181C" />
            </linearGradient>
          </defs>
          <rect width="300" height="120" fill="#0F172A" />
          {/* Stage Glow */}
          <polygon points="100,0 200,0 250,55 50,55" fill="url(#audStage)" opacity="0.8" />
          <line x1="80" y1="40" x2="220" y2="40" stroke="#FDE047" strokeWidth="2" strokeOpacity="0.8" />
          {/* Auditorium Tiered Seats */}
          {[60, 75, 90, 105].map((y, rowIdx) => (
            <g key={y} opacity={0.9 + rowIdx * 0.02}>
              {Array.from({ length: 16 + rowIdx * 2 }).map((_, i) => (
                <rect
                  key={i}
                  x={20 + i * (260 / (16 + rowIdx * 2))}
                  y={y}
                  width="10"
                  height="9"
                  rx="2"
                  fill="url(#seatGrad)"
                />
              ))}
            </g>
          ))}
        </svg>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium tracking-wide">
          Main Hall
        </span>
      </div>
    );
  }

  if (roomId.includes("CS") || roomId.includes("LAB-CS")) {
    return (
      <div className="w-full h-32 rounded-lg bg-gradient-to-b from-[#0F1E2E] to-[#1E3347] overflow-hidden relative border border-slate-200/40">
        <svg viewBox="0 0 300 120" className="w-full h-full object-cover">
          <rect width="300" height="120" fill="#0A141E" />
          {/* Workstation Benches */}
          {[30, 75].map((y, row) => (
            <g key={y}>
              <rect x="20" y={y} width="260" height="8" rx="2" fill="#334155" />
              {/* Dual Monitors */}
              {Array.from({ length: 7 }).map((_, i) => (
                <g key={i}>
                  <rect
                    x={35 + i * 36}
                    y={y - 18}
                    width="22"
                    height="16"
                    rx="1.5"
                    fill="#1E293B"
                    stroke="#0284C7"
                    strokeWidth="1.2"
                  />
                  <rect x={37 + i * 36} y={y - 16} width="18" height="12" fill="#0284C7" opacity="0.35" />
                  <rect x={44 + i * 36} y={y - 2} width="4" height="4" fill="#64748B" />
                </g>
              ))}
            </g>
          ))}
        </svg>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-cyan-300 text-[9px] font-medium tracking-wide">
          Gigabit Network
        </span>
      </div>
    );
  }

  if (roomId.includes("OAT") || type === "open_air_theatre") {
    return (
      <div className="w-full h-32 rounded-lg bg-gradient-to-b from-[#606E7A] to-[#2B3A48] overflow-hidden relative border border-slate-200/40">
        <svg viewBox="0 0 300 120" className="w-full h-full object-cover">
          <rect width="300" height="120" fill="#3B4856" />
          {/* Sunlit Sky Arc */}
          <ellipse cx="150" cy="130" rx="140" ry="85" fill="#475569" stroke="#94A3B8" strokeWidth="3" />
          <ellipse cx="150" cy="130" rx="110" ry="65" fill="#334155" stroke="#64748B" strokeWidth="2.5" />
          <ellipse cx="150" cy="130" rx="80" ry="45" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <ellipse cx="150" cy="130" rx="50" ry="25" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
          {/* Center Stage Marker */}
          <circle cx="150" cy="120" r="14" fill="#F59E0B" opacity="0.85" />
        </svg>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-amber-300 text-[9px] font-medium tracking-wide">
          Open Air
        </span>
      </div>
    );
  }

  if (roomId.includes("PHY") || roomId.includes("CHM") || type.includes("lab")) {
    return (
      <div className="w-full h-32 rounded-lg bg-gradient-to-b from-[#16363B] to-[#254F55] overflow-hidden relative border border-slate-200/40">
        <svg viewBox="0 0 300 120" className="w-full h-full object-cover">
          <rect width="300" height="120" fill="#11292D" />
          {/* Lab counters and scientific glass/hoods */}
          <rect x="20" y="70" width="260" height="40" fill="#335960" rx="3" />
          {/* Apparatus */}
          {[50, 110, 170, 230].map((x) => (
            <g key={x}>
              <rect x={x} y="40" width="20" height="30" rx="2" fill="#E2E8F0" opacity="0.8" />
              <polygon points={`${x + 5},40 ${x + 15},40 ${x + 18},25 ${x + 2},25`} fill="#0EA5E9" opacity="0.6" />
              <circle cx={x + 10} cy="55" r="5" fill="#10B981" opacity="0.7" />
            </g>
          ))}
        </svg>
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-emerald-300 text-[9px] font-medium tracking-wide">
          Lab Setup
        </span>
      </div>
    );
  }

  // Default Classroom / Seminar Hall
  return (
    <div className="w-full h-32 rounded-lg bg-gradient-to-b from-[#2E3C4D] to-[#1C2735] overflow-hidden relative border border-slate-200/40">
      <svg viewBox="0 0 300 120" className="w-full h-full object-cover">
        <rect width="300" height="120" fill="#1A2433" />
        {/* Blackboard / Projector Screen */}
        <rect x="80" y="10" width="140" height="40" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="2" />
        <rect x="86" y="15" width="128" height="30" fill="#22C55E" opacity="0.15" />
        {/* Tiered Desks */}
        {[65, 85, 105].map((y, row) => (
          <g key={y}>
            <rect x="30" y={y} width="240" height="7" rx="1.5" fill="#475569" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x={40 + i * 28} y={y - 8} width="12" height="7" rx="1" fill="#64748B" />
            ))}
          </g>
        ))}
      </svg>
      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-slate-200 text-[9px] font-medium tracking-wide">
        AV Equipped
      </span>
    </div>
  );
}

// Occupancy Bar Chart for P1 to P13 matching screenshot
function OccupancyTrendBar({ roomId, type }: { roomId: string; type: string }) {
  // Compute periods P1 to P13 occupancy pattern
  const bars = useMemo(() => {
    // Default 13 periods
    const pStatus = Array.from({ length: 13 }, (_, i) => ({
      period: `P${i + 1}`,
      color: "bg-slate-200", // empty default
      height: "h-3",
    }));

    if (roomId === "AUD-01") {
      // P2-P9 green, P10-P13 evening booked
      for (let i = 1; i < 9; i++) {
        pStatus[i].color = "bg-[#2D8A68]"; // green academic
        pStatus[i].height = i % 2 === 0 ? "h-6" : "h-8";
      }
      pStatus[9].color = "bg-[#236B8E]"; // evening booked
      pStatus[9].height = "h-7";
      pStatus[10].color = "bg-[#236B8E]";
      pStatus[10].height = "h-8";
    } else if (roomId.includes("CS") || roomId.includes("LAB-CS")) {
      // Red for lab block
      pStatus[1].color = "bg-slate-300";
      pStatus[1].height = "h-3";
      pStatus[2].color = "bg-[#2D8A68]";
      pStatus[2].height = "h-5";
      pStatus[5].color = "bg-rose-500";
      pStatus[5].height = "h-8";
      pStatus[6].color = "bg-rose-500";
      pStatus[6].height = "h-8";
      pStatus[7].color = "bg-rose-500";
      pStatus[7].height = "h-8";
      pStatus[8].color = "bg-rose-500";
      pStatus[8].height = "h-8";
    } else if (roomId === "OAT-01") {
      // Blue for evening booking requested
      pStatus[7].color = "bg-[#236B8E]";
      pStatus[7].height = "h-4";
      pStatus[8].color = "bg-[#236B8E]";
      pStatus[8].height = "h-6";
      pStatus[9].color = "bg-[#236B8E]";
      pStatus[9].height = "h-8";
      pStatus[10].color = "bg-[#236B8E]";
      pStatus[10].height = "h-8";
      pStatus[11].color = "bg-[#236B8E]";
      pStatus[11].height = "h-8";
      pStatus[12].color = "bg-[#236B8E]";
      pStatus[12].height = "h-8";
    } else if (roomId.includes("PHY") || roomId.includes("LAB")) {
      for (let i = 2; i <= 6; i++) {
        pStatus[i].color = "bg-[#1E3A5F]";
        pStatus[i].height = `${(i - 1) * 2 + 3}px`;
      }
      pStatus[6].height = "h-7";
      pStatus[7].height = "h-7";
      pStatus[7].color = "bg-[#1E3A5F]";
      pStatus[8].height = "h-8";
      pStatus[8].color = "bg-[#1E3A5F]";
    } else {
      // Standard classroom distribution
      pStatus[1].color = "bg-[#2D8A68]";
      pStatus[1].height = "h-5";
      pStatus[2].color = "bg-[#2D8A68]";
      pStatus[2].height = "h-7";
      pStatus[3].color = "bg-[#2D8A68]";
      pStatus[3].height = "h-6";
      pStatus[5].color = "bg-[#2D8A68]";
      pStatus[5].height = "h-6";
      pStatus[6].color = "bg-[#2D8A68]";
      pStatus[6].height = "h-5";
    }

    return pStatus;
  }, [roomId]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
        <span>Occupancy Trend (P1-P13)</span>
      </div>
      <div className="h-10 flex items-end justify-between gap-1 px-1 bg-slate-50/80 rounded-md border border-slate-100 py-1">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className={`w-full rounded-t-sm transition-all ${b.color} ${b.height}`} />
            <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">{b.period}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VenueDirectoryPage() {
  // Accessibility pill state
  const [accessFilter, setAccessFilter] = useState<"all" | "wheelchair" | "ground">("wheelchair");
  // Room Type pill state
  const [typeFilter, setTypeFilter] = useState<string>("Labs (7)");
  // Conflict Alert dismissal
  const [alertDismissed, setAlertDismissed] = useState(false);
  // Modal for quick venue booking
  const [bookingModalRoom, setBookingModalRoom] = useState<any | null>(null);

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return citData.rooms.filter((r) => {
      // Accessibility filter
      if (accessFilter === "wheelchair" && !r.is_accessible) return false;
      if (accessFilter === "ground" && !(r.room_id.startsWith("LH-1") || r.room_id.startsWith("LT-1") || r.room_id.includes("AUD") || r.room_id.includes("OAT") || r.type.includes("lab"))) return false;

      // Room Type filter
      if (typeFilter === "Labs (7)") {
        return r.type.includes("lab") || r.type === "workshop";
      }
      if (typeFilter === "Auditorium") return r.type === "auditorium";
      if (typeFilter === "Open-Air Theatre") return r.type === "open_air_theatre";
      if (typeFilter === "Seminar Halls") return r.type === "seminar_hall";
      if (typeFilter === "Classrooms") return r.type === "classroom" || r.type === "lecture_hall";

      return true; // All Types
    });
  }, [accessFilter, typeFilter]);

  // Live status helper
  const getLiveStatus = (roomId: string, type: string) => {
    if (roomId === "AUD-01") {
      return { dot: "bg-amber-400", text: "Event Booked (18:00 Spectra Intro)", textClass: "text-slate-800" };
    }
    if (roomId.includes("CS") || roomId.includes("LAB-CS")) {
      return { dot: "bg-rose-500", text: "Full (14:00-17:00 CS-301 Lab)", textClass: "text-slate-800" };
    }
    if (roomId === "OAT-01") {
      return { dot: "bg-[#236B8E]", text: "Booking Requested: (18:00 - 22:00 Spectra Band Practice)", textClass: "text-slate-800" };
    }
    if (roomId.includes("PHY") || roomId.includes("PH-LAB")) {
      return { dot: "bg-[#1E3A5F]", text: "Physics Lab (PH-LAB)", textClass: "text-slate-800" };
    }
    if (roomId.includes("CHM") || roomId.includes("CHEM")) {
      return { dot: "bg-rose-500", text: "Full (09:00-12:00 CH-101 Lab)", textClass: "text-slate-800" };
    }
    return { dot: "bg-emerald-500", text: "Available (Free till 14:00)", textClass: "text-slate-700" };
  };

  return (
    <AppShell>
      {/* 1. Page Header Title */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Venue Directory (27 Total)
        </h1>
      </div>

      {/* 2. Sub-Toolbar with Smart Filter Pills label and right indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">
          Smart Filter Pills
        </h2>

        <div className="flex items-center gap-2">
          {/* Current Week: Week 7 */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E2EEF5] border border-[#C5DDEB] text-slate-700 text-xs font-medium shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-[#1B5270]" />
            <span>Current Week: Week 7</span>
          </div>

          {/* Spectra Fest Mode */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-semibold shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Spectra Fest Mode</span>
          </div>

          {/* Filters Button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 shadow-sm transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 3. Smart Filter Pills Box */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-6">
          {/* Section A: Accessibility Compliance */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Accessibility Compliance
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAccessFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  accessFilter === "all"
                    ? "bg-[#B08401] text-white shadow-xs font-semibold"
                    : "bg-[#FAF6F2] text-[#683B2B] border border-[#DED1BD] hover:bg-[#F3EFE7]"
                }`}
              >
                All Rooms
              </button>

              <button
                type="button"
                onClick={() => setAccessFilter("wheelchair")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  accessFilter === "wheelchair"
                    ? "bg-[#B08401] text-white shadow-xs font-semibold"
                    : "bg-[#FAF6F2] text-[#683B2B] border border-[#DED1BD] hover:bg-[#F3EFE7]"
                }`}
              >
                <Accessibility className="w-3.5 h-3.5" />
                <span>Wheelchair Accessible</span>
                {accessFilter === "wheelchair" && (
                  <Check className="w-3 h-3 ml-0.5 stroke-[3]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setAccessFilter("ground")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  accessFilter === "ground"
                    ? "bg-[#B08401] text-white shadow-xs font-semibold"
                    : "bg-[#FAF6F2] text-[#683B2B] border border-[#DED1BD] hover:bg-[#F3EFE7]"
                }`}
              >
                Ground Floor Only
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-slate-200 hidden lg:block" />

          {/* Section B: Room Type */}
          <div className="space-y-1.5 flex-1 min-w-[280px]">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Room Type
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {["All Types", "Labs (7)", "Auditorium", "Open-Air Theatre", "Seminar Halls", "Classrooms"].map(
                (t) => {
                  const isActive = typeFilter === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTypeFilter(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#B08401] text-white shadow-xs font-semibold"
                          : "bg-[#FAF6F2] text-[#683B2B] border border-[#DED1BD] hover:bg-[#F3EFE7]"
                      }`}
                    >
                      {t}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Conflict Alert Banner (from screenshot) */}
      {!alertDismissed && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-900 leading-tight">
                Conflict Alert: 3 overlapping Spectra Fest requests
              </p>
              <p className="text-[11px] text-rose-700 leading-tight mt-0.5">
                OAT-01 and AUD-01 have contested evening slots between Literary Society and Music Club.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/approvals"
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2"
            >
              Resolve in Approvals Queue
            </Link>
            <button
              type="button"
              onClick={() => setAlertDismissed(true)}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-200/50 transition-colors"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Venue Cards Grid (Matching screenshot layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const live = getLiveStatus(room.room_id, room.type);

          return (
            <div
              key={room.room_id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-3.5 flex flex-col justify-between space-y-3"
            >
              {/* Header: Room Name & Badges */}
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <h3 className="font-bold text-xs text-slate-900 leading-tight">
                    {room.name} ({room.room_id})
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-[#E2EEF5] text-[#1B5270] text-[10px] font-semibold border border-[#C5DDEB]">
                    Capacity: {room.capacity}
                  </span>
                  {room.is_accessible && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20] text-[10px] font-semibold border border-[#C8E6C9]">
                      <Accessibility className="w-2.5 h-2.5" />
                      Accessible
                    </span>
                  )}
                </div>
              </div>

              {/* Realistic Visual Room Thumbnail */}
              <RoomThumbnail type={room.type} roomId={room.room_id} />

              {/* Hourly Occupancy Trend Bar Chart (P1-P13) */}
              <OccupancyTrendBar roomId={room.room_id} type={room.type} />

              {/* Live Status Indicator */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Live Status
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${live.dot} shrink-0 ring-2 ring-white`} />
                  <span className={`text-[11px] font-medium leading-tight ${live.textClass}`}>
                    {live.text}
                  </span>
                </div>
              </div>

              {/* Action Buttons: [ Edit ] [ Book Venue ] */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingModalRoom(room)}
                  className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors text-center"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setBookingModalRoom(room)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#B08401] hover:bg-[#8F6B01] text-white text-xs font-semibold shadow-xs transition-colors text-center"
                >
                  Book Venue
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Booking Modal */}
      {bookingModalRoom && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#F0F4F8] border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Book Venue: {bookingModalRoom.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Room ID: {bookingModalRoom.room_id} • Max Seating: {bookingModalRoom.capacity} seats
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalRoom(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Event / Session Title
                </label>
                <input
                  type="text"
                  defaultValue="Spectra Fest Rehearsal"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Day
                  </label>
                  <select className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800">
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Period
                  </label>
                  <select className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800">
                    <option>P10 - P12 (18:00 - 21:00 Evening)</option>
                    <option>P7 - P8 (15:00 - 17:00 Afternoon)</option>
                    <option>P2 - P4 (09:00 - 12:00 Morning)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF3F1] border border-[#EAC8BF] text-xs text-[#683B2B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B08401] shrink-0" />
                <span>
                  Deterministic conflict validator will verify slot feasibility before submission.
                </span>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#FAF6F2] border-t border-[#DED1BD] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBookingModalRoom(null)}
                className="px-4 py-2 rounded-lg border border-[#DED1BD] bg-white text-xs font-semibold text-[#683B2B] hover:bg-[#F3EFE7]"
              >
                Cancel
              </button>
              <Link
                href="/venue-bookings"
                className="px-4 py-2 rounded-lg bg-[#B08401] hover:bg-[#8F6B01] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Go to Venue Bookings Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
