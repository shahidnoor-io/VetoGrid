"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Sparkles,
  SlidersHorizontal,
  Bot,
  DoorClosed,
  RefreshCw,
  CheckSquare,
  GraduationCap,
  BarChart3,
  Settings,
  Users,
  LogOut,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  show?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigationGroups: NavGroup[] = [
    {
      title: "Overview & Schedule",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Timetable Matrix",
          href: "/timetable",
          icon: Calendar,
        },
        {
          name: "Examinations",
          href: "/examinations",
          icon: GraduationCap,
        },
      ],
    },
    {
      title: "Operations & Booking",
      items: [
        {
          name: "Venue Bookings",
          href: "/venue-bookings",
          icon: DoorClosed,
          badge: "Spectra",
        },
        {
          name: "Rescheduling",
          href: "/rescheduling",
          icon: RefreshCw,
          show: user.canReschedule !== false,
        },
        {
          name: "Manual Scheduling",
          href: "/manual-scheduling",
          icon: SlidersHorizontal,
          show: user.canManualSchedule !== false,
        },
        {
          name: "Approvals Queue",
          href: "/approvals",
          icon: CheckSquare,
          show: user.canViewApprovals !== false,
        },
      ],
    },
    {
      title: "Campus Resources",
      items: [
        {
          name: "Rooms & Venues",
          href: "/rooms",
          icon: Building2,
        },
        {
          name: "Faculty Directory",
          href: "/faculty",
          icon: Users,
          show: user.canViewFaculty !== false,
        },
      ],
    },
    {
      title: "Intelligence & Insights",
      items: [
        {
          name: "AI Assistant",
          href: "/assistant",
          icon: Bot,
          badge: "Hinglish",
        },
        {
          name: "Analytics",
          href: "/analytics",
          icon: BarChart3,
          show: user.canViewAnalytics !== false,
        },
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
          show: user.canManageSettings !== false,
        },
      ],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-[#E8DFD5] bg-[#FAF6F2] flex flex-col justify-between font-sans">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header with VetoGrid Eagle Logo */}
        <Link
          href="/"
          className="h-16 flex items-center px-4 gap-3 border-b border-[#E8DFD5] hover:bg-[#F3EDE6] transition-colors shrink-0"
        >
          <div className="h-10 w-10 rounded-xl bg-white border border-[#DED1BD] p-1 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden">
            <Image
              src="/logo.png"
              alt="VetoGrid Logo"
              width={40}
              height={40}
              unoptimized
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm text-[#683B2B] tracking-tight block leading-tight">
              VetoGrid
            </span>
            <span className="text-[11px] text-[#8C6556] leading-tight block font-medium truncate">
              Intelligent Campus Platform
            </span>
          </div>
        </Link>

        {/* Scrollable Navigation Groups */}
        <div className="p-3 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-[#8C6556] uppercase tracking-wider mb-1">
                {group.title}
              </div>

              {group.items
                .filter((item) => item.show !== false)
                .map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                        isActive
                          ? "bg-[#B08401] text-white shadow-xs font-bold"
                          : "text-[#683B2B] hover:bg-[#F3EDE6]"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            isActive ? "text-white" : "text-[#8C6556]"
                          )}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded-md font-bold",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#FAF3F1] text-[#683B2B] border border-[#EAC8BF]"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom User Profile & Session Controls */}
      <div className="p-3 border-t border-[#E8DFD5] space-y-2 bg-[#FAF6F2] shrink-0">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#DED1BD] shadow-2xs">
          <Link
            href="/login"
            title="Click to switch persona or sign in"
            className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[#683B2B] text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs">
              {user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-[#683B2B] block truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-[#8C6556] block truncate">
                {user.label || user.role}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-[#8C6556] hover:text-[#683B2B] hover:bg-[#FAF3F1] transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* AI Assistant Quick Pill */}
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
          <span>Multilingual AI Assistant</span>
        </Link>
      </div>
    </aside>
  );
}
