"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  HelpCircle,
  ShieldCheck,
  UserCheck,
  KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [spectraOpen, setSpectraOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  const isVenueDirectoryActive = pathname === "/rooms" || pathname === "/";
  const isTimetableActive = pathname === "/timetable";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[#E8DFD5] bg-[#FAF6F2] flex flex-col justify-between font-sans">
      <div className="flex flex-col">
        {/* Brand Header with VetoGrid Eagle Logo */}
        <Link
          href="/"
          className="h-16 flex items-center px-4 gap-3 border-b border-[#E8DFD5] hover:bg-[#F3EDE6] transition-colors"
        >
          <div className="h-10 w-10 rounded-xl bg-white border border-[#DED1BD] p-1 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden">
            <Image
              src="/logo.png"
              alt="VetoGrid Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm text-[#683B2B] tracking-tight block leading-tight">
              VetoGrid
            </span>
            <span className="text-[11px] text-[#8C6556] leading-tight block font-medium truncate">
              Venue &amp; Timetable OS
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
          {/* 0. Dedicated 4-Role Login Portal */}
          <Link
            href="/login"
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all border mb-1",
              pathname === "/login"
                ? "bg-[#683B2B] text-white border-[#683B2B] shadow-xs"
                : "bg-white text-[#683B2B] border-[#DED1BD] hover:bg-[#F3EDE6] shadow-2xs"
            )}
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className={cn("w-4 h-4", pathname === "/login" ? "text-white" : "text-[#B08401]")} />
              <span>Role Login (4 Roles)</span>
            </div>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-bold",
              pathname === "/login" ? "bg-white/20 text-white" : "bg-[#B08401]/15 text-[#683B2B]"
            )}>
              Section 4
            </span>
          </Link>

          {/* 1. Timetable */}
          <Link
            href="/timetable"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
              isTimetableActive
                ? "bg-[#B08401] text-white shadow-xs font-bold"
                : "text-[#683B2B] hover:bg-[#F3EDE6]"
            )}
          >
            <Calendar className={cn("w-4 h-4", isTimetableActive ? "text-white" : "text-[#8C6556]")} />
            <span>Timetable</span>
          </Link>

          {/* 2. Venue Directory */}
          <Link
            href="/rooms"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
              isVenueDirectoryActive
                ? "bg-[#B08401] text-white shadow-xs font-bold"
                : "text-[#683B2B] hover:bg-[#F3EDE6]"
            )}
          >
            <Building2 className={cn("w-4 h-4", isVenueDirectoryActive ? "text-white" : "text-[#8C6556]")} />
            <span>Venue Directory</span>
          </Link>

          {/* 3. Spectra Fest (Collapsible) */}
          <div className="space-y-0.5 pt-1">
            <button
              type="button"
              onClick={() => setSpectraOpen(!spectraOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#683B2B] hover:bg-[#F3EDE6] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#B08401]" />
                <span>Spectra Fest</span>
              </div>
              {spectraOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#8C6556]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#8C6556]" />
              )}
            </button>

            {spectraOpen && (
              <div className="pl-6 space-y-0.5 pt-0.5">
                <Link
                  href="/venue-bookings"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/venue-bookings"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <DoorClosed className="w-3.5 h-3.5 text-[#8C6556]" />
                  <span>Venue Bookings</span>
                </Link>
                <Link
                  href="/rescheduling"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/rescheduling"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#8C6556]" />
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#683B2B] hover:bg-[#F3EDE6] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[#8C6556]" />
                <span>Admin Panels</span>
              </div>
              {adminOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#8C6556]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#8C6556]" />
              )}
            </button>

            {adminOpen && (
              <div className="pl-6 space-y-0.5 pt-0.5">
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/dashboard"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <span>Command Center</span>
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/login"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-[#B08401]" />
                    <span>Role Login &amp; RBAC</span>
                  </div>
                  <span className="text-[9px] bg-[#DED1BD] text-[#683B2B] px-1 py-0.2 rounded font-bold">4 Roles</span>
                </Link>
                <Link
                  href="/approvals"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/approvals"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#8C6556]" />
                  <span>Approvals Queue</span>
                </Link>
                <Link
                  href="/manual-scheduling"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/manual-scheduling"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <span>Manual Workbench</span>
                </Link>
                <Link
                  href="/examinations"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/examinations"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#8C6556]" />
                  <span>Examinations (41)</span>
                </Link>
                <Link
                  href="/analytics"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/analytics"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#8C6556]" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors",
                    pathname === "/settings"
                      ? "bg-[#B08401] text-white font-bold"
                      : "text-[#683B2B] hover:bg-[#F3EDE6]"
                  )}
                >
                  <Settings className="w-3.5 h-3.5 text-[#8C6556]" />
                  <span>Settings &amp; Hot-Swap</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom User Persona & AI Chat Assistance */}
      <div className="p-3 border-t border-[#E8DFD5] space-y-2 bg-[#FAF6F2]">
        {/* Active Role Card */}
        <Link
          href="/login"
          title="Click to switch persona or view Section 4 RBAC rules"
          className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#F3EDE6] border border-[#DED1BD] shadow-2xs transition-all group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#683B2B] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs">
              {user.avatar}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#683B2B] block truncate group-hover:text-[#42261C]">
                {user.name}
              </span>
              <span className="text-[10px] text-[#8C6556] block truncate">
                {user.role}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#683B2B] bg-[#F3EDE6] px-1.5 py-0.5 rounded border border-[#DED1BD] group-hover:bg-[#B08401] group-hover:text-white transition-colors">
            Switch
          </span>
        </Link>

        {/* AI Chat Assistance Link */}
        <Link
          href="/assistant"
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs",
            pathname === "/assistant"
              ? "bg-[#B08401] text-white"
              : "bg-[#683B2B] text-white hover:bg-[#563124]"
          )}
        >
          <Bot className="w-4 h-4" />
          <span>AI Chat Assistance</span>
        </Link>
      </div>
    </aside>
  );
}
