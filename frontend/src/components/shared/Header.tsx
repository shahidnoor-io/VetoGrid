"use client";

import React, { useState } from "react";
import { Search, Filter, LayoutGrid, Bell, Activity } from "lucide-react";

export function Header() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[#E2E8F0] bg-[#F0F4F8]/90 backdrop-blur-md px-6 flex items-center justify-between">
      {/* Empty space or breadcrumb placeholder on left */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Chilika Institute of Technology</span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="text-xs font-medium text-slate-600 hidden sm:inline">Week 7 (Spectra &amp; Midsems)</span>
      </div>

      {/* Right side controls matching screenshot */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative w-44 sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search"
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#236B8E] focus:border-[#236B8E] shadow-sm transition-all"
          />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter</span>
        </button>

        {/* Grid Icon */}
        <button
          type="button"
          className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
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

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#1B5270] text-white flex items-center justify-center text-xs font-semibold shadow-sm ring-2 ring-white overflow-hidden">
            <span className="text-[11px] font-bold">CIT</span>
          </div>
        </div>
      </div>
    </header>
  );
}
