"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  LayoutGrid,
  Bell,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  ChevronDown,
  LogOut,
  UserCheck,
  Check,
} from "lucide-react";
import { useAuth, OFFICIAL_PERSONAS, Persona } from "@/lib/auth";

export function Header() {
  const router = useRouter();
  const { user, switchPersona, logout } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRole = (personaId: string) => {
    switchPersona(personaId);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/login");
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case "DEAN-01":
        return <ShieldCheck className="w-3.5 h-3.5 text-[#1B4D68]" />;
      case "COORD-CSE":
        return <Building2 className="w-3.5 h-3.5 text-emerald-700" />;
      case "FAC-01":
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />;
      case "CLUB-LIT-01":
        return <Sparkles className="w-3.5 h-3.5 text-amber-700" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#E2E8F0] bg-[#F0F4F8]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between font-sans">
      {/* Left breadcrumb info */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700 hidden sm:inline">
          Chilika Institute of Technology
        </span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="text-xs font-medium text-slate-600 hidden sm:inline">
          Week 7 (Spectra &amp; Midsems)
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative w-36 sm:w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search venue, course..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#236B8E] focus:border-[#236B8E] shadow-sm transition-all"
          />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter</span>
        </button>

        {/* Grid Icon */}
        <button
          type="button"
          className="hidden sm:flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
          title="Grid View"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>

        {/* Notification Bell with red badge */}
        <button
          type="button"
          className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Persona & Role Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all group"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-[#1B5270] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
              {user.avatar}
            </div>

            {/* Persona details */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-[#1B5270]">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-tight truncate max-w-[140px]">
                {user.role}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-2 animate-in fade-in-50 zoom-in-95 font-sans">
              {/* Header Info */}
              <div className="px-3 py-2.5 border-b border-slate-100 bg-[#F8FAFC] rounded-xl mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current Persona
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">{user.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                <div className="mt-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-0.5">Section 4 Authority:</span>
                  {user.whatTheyCanDo}
                </div>
              </div>

              {/* 4 Roles Switcher */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (4 Personas)
                </div>
                {OFFICIAL_PERSONAS.map((p) => {
                  const isActive = user.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectRole(p.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        isActive
                          ? "bg-[#236B8E]/10 border border-[#236B8E]/30 text-[#1B4D68] font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {getRoleIcon(p.id)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{p.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-[#236B8E] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/login"
                  onClick={() => setDropdownOpen(false)}
                  className="text-xs text-[#1B5270] hover:underline font-semibold px-2 py-1"
                >
                  Role Matrix
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
