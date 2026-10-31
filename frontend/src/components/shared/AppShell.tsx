"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 flex relative">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0 bg-[#F0F4F8]">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-5">{children}</div>
        </main>
      </div>

      {/* Floating AI Chat Assistance FAB (from screenshot) */}
      <Link
        href="/assistant"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-[#1B5270] hover:bg-[#154259] text-white flex items-center justify-center shadow-xl ring-4 ring-[#1B5270]/20 transition-all hover:scale-105 group"
        title="AI Chat Assistance"
      >
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="sr-only">AI Chat Assistance</span>
      </Link>
    </div>
  );
}
