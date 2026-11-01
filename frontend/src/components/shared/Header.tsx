"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  KeyRound,
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
        return <ShieldCheck className="w-3.5 h-3.5 text-[#683B2B]" />;
      case "COORD-CSE":
        return <Building2 className="w-3.5 h-3.5 text-[#B08401]" />;
      case "FAC-01":
        return <GraduationCap className="w-3.5 h-3.5 text-[#683B2B]" />;
      case "CLUB-LIT-01":
        return <Sparkles className="w-3.5 h-3.5 text-[#D49E8D]" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-[#683B2B]" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#E8DFD5] bg-[#FAF6F2]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between font-sans">
      {/* Left breadcrumb info with VetoGrid eagle touch */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white border border-[#DED1BD] p-0.5 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden">
          <Image
            src="/logo.png"
            alt="VetoGrid Logo"
            width={28}
            height={28}
            unoptimized
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xs font-extrabold text-[#683B2B] hidden sm:inline">
          VetoGrid
        </span>
        <span className="text-[#DED1BD] hidden sm:inline">•</span>
        <span className="text-xs font-semibold text-[#8C6556] hidden sm:inline">
          Week 7 (Spectra &amp; Midsems)
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative w-36 sm:w-52">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C6556]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search venue, slot..."
            className="w-full h-8 pl-8 pr-3 rounded-xl border border-[#DED1BD] bg-white text-xs text-[#683B2B] placeholder:text-[#8C6556] focus:outline-none focus:ring-1 focus:ring-[#B08401] focus:border-[#B08401] shadow-2xs transition-all"
          />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-[#DED1BD] bg-white text-xs font-semibold text-[#683B2B] hover:bg-[#FAF6F2] shadow-2xs transition-colors"
        >
          <Filter className="w-3.5 h-3.5 text-[#8C6556]" />
          <span>Filter</span>
        </button>

        {/* Grid Icon */}
        <button
          type="button"
          className="hidden sm:flex items-center justify-center h-8 w-8 rounded-xl border border-[#DED1BD] bg-white text-[#683B2B] hover:bg-[#FAF6F2] shadow-2xs transition-colors"
          title="Grid View"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#8C6556]" />
        </button>

        {/* Notification Bell with warm badge */}
        <button
          type="button"
          className="relative flex items-center justify-center h-8 w-8 rounded-xl border border-[#DED1BD] bg-white text-[#683B2B] hover:bg-[#FAF6F2] shadow-2xs transition-colors"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5 text-[#8C6556]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B08401] ring-2 ring-white" />
        </button>

        {/* Direct Link to Role Login Portal */}
        <Link
          href="/login"
          title="Open Section 4 Role Login & Authentication Portal"
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-[#ECD693] bg-[#FBF6EA] hover:bg-[#F6ECCB] text-[#683B2B] text-xs font-bold shadow-2xs transition-all"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#B08401]" />
          <span>Role Sign-In</span>
          <span className="text-[10px] bg-[#683B2B] text-white px-1.5 py-0.2 rounded font-bold hidden sm:inline">4 Roles</span>
        </Link>

        {/* User Persona & Role Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-[#DED1BD] bg-white hover:bg-[#F3EDE6] shadow-2xs transition-all group"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-[#683B2B] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
              {user.avatar}
            </div>

            {/* Persona details */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#683B2B] leading-tight group-hover:text-[#42261C]">
                {user.name}
              </span>
              <span className="text-[10px] text-[#8C6556] font-medium leading-tight truncate max-w-[140px]">
                {user.role}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#8C6556] group-hover:text-[#683B2B] transition-transform" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#DED1BD] shadow-xl z-50 p-2 animate-in fade-in-50 zoom-in-95 font-sans">
              {/* Header Info */}
              <div className="px-3 py-2.5 border-b border-[#E8DFD5] bg-[#FAF6F2] rounded-xl mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8C6556] uppercase tracking-wider">
                    Current Persona
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF6EA] text-[#745501] border border-[#ECD693]">
                    Active
                  </span>
                </div>
                <div className="text-xs font-bold text-[#683B2B] mt-1">{user.name}</div>
                <div className="text-[11px] text-[#8C6556] font-mono">{user.email}</div>
                <div className="mt-1.5 text-[11px] text-[#683B2B] bg-white p-2 rounded-lg border border-[#DED1BD]">
                  <span className="font-bold text-[#683B2B] block mb-0.5">Section 4 Authority:</span>
                  {user.whatTheyCanDo}
                </div>
              </div>

              {/* 4 Roles Switcher */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-[#8C6556] uppercase tracking-wider">
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
                          ? "bg-[#FBF6EA] border border-[#ECD693] text-[#683B2B] font-bold"
                          : "hover:bg-[#FAF6F2] text-[#683B2B]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#FAF6F2] border border-[#DED1BD] flex items-center justify-center shrink-0">
                          {getRoleIcon(p.id)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold">{p.name}</div>
                          <div className="text-[10px] text-[#8C6556] truncate">{p.role}</div>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-[#B08401] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="pt-2 mt-2 border-t border-[#E8DFD5] flex items-center justify-between">
                <Link
                  href="/login"
                  onClick={() => setDropdownOpen(false)}
                  className="text-xs text-[#B08401] hover:underline font-bold px-2 py-1"
                >
                  Role Matrix Portal
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors font-bold"
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
