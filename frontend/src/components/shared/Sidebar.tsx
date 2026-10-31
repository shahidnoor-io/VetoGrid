"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Building2,
  Sparkles,
  SlidersHorizontal,
  Bot,
  ChevronDown,
  ChevronRight,
  DoorClosed,
  RefreshCw,
  CheckSquare,
  GraduationCap,
  BarChart3,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [spectraOpen, setSpectraOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const isVenueDirectoryActive = pathname === "/rooms" || pathname === "/";
  const isTimetableActive = pathname === "/timetable";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[#D9E3EC] bg-[#EBF1F6] flex flex-col justify-between font-sans">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 gap-3 border-b border-[#DCE5EE]">
          <div className="h-9 w-9 rounded-full bg-[#1B4D68] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm shrink-0">
            CIT
          </div>
          <div className="min-w-0">
            <span className="font-bold text-xs text-slate-900 leading-tight block">
              CIT Venue Manager
            </span>
            <span className="text-[11px] text-slate-600 leading-tight block font-medium">
              &amp; Timetable System
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* 1. Timetable */}
          <Link
            href="/timetable"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              isTimetableActive
                ? "bg-[#5B93B5] text-white shadow-sm font-semibold"
                : "text-slate-700 hover:bg-[#DEE7F0] hover:text-slate-900"
            )}
          >
            <Calendar className={cn("w-4 h-4", isTimetableActive ? "text-white" : "text-slate-600")} />
            <span>Timetable</span>
          </Link>

          {/* 2. Venue Directory */}
          <Link
            href="/rooms"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              isVenueDirectoryActive
                ? "bg-[#5B93B5] text-white shadow-sm font-semibold"
                : "text-slate-700 hover:bg-[#DEE7F0] hover:text-slate-900"
            )}
          >
            <Building2 className={cn("w-4 h-4", isVenueDirectoryActive ? "text-white" : "text-slate-600")} />
            <span>Venue Directory</span>
          </Link>

          {/* 3. Spectra Fest (Collapsible) */}
          <div className="space-y-0.5 pt-1">
            <button
              type="button"
              onClick={() => setSpectraOpen(!spectraOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-[#DEE7F0] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Spectra Fest</span>
              </div>
              {spectraOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {spectraOpen && (
              <div className="pl-6 space-y-0.5 pt-0.5">
                <Link
                  href="/venue-bookings"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    pathname === "/venue-bookings"
                      ? "bg-[#5B93B5] text-white font-semibold"
                      : "text-slate-600 hover:bg-[#DEE7F0] hover:text-slate-900"
                  )}
                >
                  <DoorClosed className="w-3.5 h-3.5" />
                  <span>Venue Bookings</span>
                </Link>
                <Link
                  href="/rescheduling"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    pathname === "/rescheduling"
                      ? "bg-[#5B93B5] text-white font-semibold"
                      : "text-slate-600 hover:bg-[#DEE7F0] hover:text-slate-900"
                  )}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Disruption Recovery</span>
                </Link>
              </div>
            )}
          </div>

          {/* 4. Admin Panels (Collapsible) */}
          <div className="space-y-0.5 pt-1">
            <button
              type="button"
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-[#DEE7F0] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <span>Admin Panels</span>
              </div>
              {adminOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {adminOpen && (
              <div className="pl-6 space-y-0.5 pt-0.5">
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    pathname === "/dashboard"
                      ? "bg-[#5B93B5] text-white font-semibold"
                      : "text-slate-600 hover:bg-[#DEE7F0] hover:text-slate-900"
                  )}
                >
                  <span>Command Center</span>
                </Link>
                <Link
                  href="/approvals"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    pathname === "/approvals"
                      ? "bg-[#5B93B5] text-white font-semibold"
                      : "text-slate-600 hover:bg-[#DEE7F0] hover:text-slate-900"
                  )}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Approvals Queue</span>
                </Link>
                <Link
                  href="/manual-scheduling"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    pathname === "/manual-scheduling"
                      ? "bg-[#5B93B5] text-white font-semibold"
                      : "text-slate-600 hover:bg-[#DEE7F0] hover:text-slate-900"
                  )}
                >
                  <span>Manual Workbench</span>
                </Link>
                <Link
                  href="/examinations"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    pathname === "/examinations"
                      ? "bg-[#5B93B5] text-white font-semibold"
                      : "text-slate-600 hover:bg-[#DEE7F0] hover:text-slate-900"
                  )}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Examinations (41)</span>
                </Link>
                <Link
                  href="/analytics"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    pathname === "/analytics"
                      ? "bg-[#5B93B5] text-white font-semibold"
                      : "text-slate-600 hover:bg-[#DEE7F0] hover:text-slate-900"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    pathname === "/settings"
                      ? "bg-[#5B93B5] text-white font-semibold"
                      : "text-slate-600 hover:bg-[#DEE7F0] hover:text-slate-900"
                  )}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings &amp; Hot-Swap</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom AI Chat Assistance Link */}
      <div className="p-3 border-t border-[#DCE5EE]">
        <Link
          href="/assistant"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-all shadow-sm",
            pathname === "/assistant"
              ? "bg-[#1B5270] text-white"
              : "bg-[#DDE9F2] text-[#1B5270] hover:bg-[#D0E0EC]"
          )}
        >
          <Bot className="w-4 h-4" />
          <span>AI Chat Assistance</span>
        </Link>
      </div>
    </aside>
  );
}
