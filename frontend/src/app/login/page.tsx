"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  UserCheck,
  Building2,
  Calendar,
  Sparkles,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth, OFFICIAL_PERSONAS, Persona } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<"quick" | "manual">("quick");
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("DEAN-01");
  const [email, setEmail] = useState<string>("dean@cit.edu.in");
  const [password, setPassword] = useState<string>("••••••••••••");
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const [successPersona, setSuccessPersona] = useState<string | null>(null);

  const handleQuickLogin = (persona: Persona) => {
    setLoggingIn(true);
    setSelectedPersonaId(persona.id);
    login(persona.id);
    setSuccessPersona(persona.name);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    login(email);
    const matched = OFFICIAL_PERSONAS.find(
      (p) => p.email.toLowerCase() === email.toLowerCase() || p.id === selectedPersonaId
    );
    setSuccessPersona(matched ? matched.name : "Authenticated User");
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case "DEAN-01":
        return <ShieldCheck className="w-5 h-5 text-[#1B4D68]" />;
      case "COORD-CSE":
        return <Building2 className="w-5 h-5 text-emerald-700" />;
      case "FAC-01":
        return <GraduationCap className="w-5 h-5 text-indigo-700" />;
      case "CLUB-LIT-01":
        return <Sparkles className="w-5 h-5 text-amber-700" />;
      default:
        return <UserCheck className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col justify-between items-center p-4 sm:p-8 font-sans selection:bg-[#236B8E]/20">
      {/* Top Banner with Institution Info */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#1B4D68] flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
            CIT
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 leading-tight">
              Chilika Institute of Technology
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              CIT Venue Manager &amp; Timetable System · Section 4 Governance Portal
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Active Session: Week 7 (Spectra &amp; Midsems)
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl my-6 space-y-6">
        {/* Title & Section 4 Overview */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EAF1] border border-[#CBD9E5] text-[#1B4D68] text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Section 4: Four-Role Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Role Sign-In
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Select one of the four official campus personas to test governance permissions, timetable authoring,
            booking submissions, or disruption approvals.
          </p>
        </div>

        {/* Section 4 Strict Rule Callout */}
        <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-950 flex items-center gap-2">
                <span>Section 4 Strict Governance Rule</span>
                <span className="bg-purple-200 text-purple-900 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Zero Self-Approval
                </span>
              </h4>
              <p className="text-xs text-purple-800 mt-0.5">
                <strong>&ldquo;Nobody can approve their own request.&rdquo;</strong> When an approver attempts to sign off on a venue request they created, the engine halts with HTTP 403 Forbidden.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[11px] font-semibold text-purple-900 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 block">
              Conflict Hierarchy Active (6 Tiers)
            </span>
          </div>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab("quick")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "quick"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1-Click Role Access (4 Roles)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "manual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Institutional Email &amp; Password
            </button>
          </div>
        </div>

        {/* 1. 1-Click Role Login Cards Grid */}
        {activeTab === "quick" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_PERSONAS.map((persona) => {
              const isSelected = selectedPersonaId === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => handleQuickLogin(persona)}
                  className={`group relative text-left p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                    isSelected
                      ? "bg-white border-[#236B8E] ring-2 ring-[#236B8E]/30"
                      : "bg-white border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#F0F4F8] border border-slate-200 flex items-center justify-center font-bold text-slate-800 shadow-inner group-hover:scale-105 transition-transform">
                        {getRoleIcon(persona.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1B4D68] transition-colors">
                            {persona.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{persona.department}</p>
                      </div>
                    </div>
                    <Badge variant={persona.badgeVariant} className="text-[11px] shrink-0 font-semibold">
                      {persona.badge}
                    </Badge>
                  </div>

                  {/* Section 4 Capability Description */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100 mb-4 min-h-[58px]">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Section 4 Authority:
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {persona.whatTheyCanDo}
                    </p>
                  </div>

                  {/* Footer with email and Sign In CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">{persona.email}</span>
                    <button
                      type="button"
                      disabled={loggingIn}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1B5270] hover:bg-[#153e55] group-hover:bg-[#236B8E] transition-all shadow-sm"
                    >
                      <span>Sign In as {persona.role.split(" ")[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. Manual Credentials Form */}
        {activeTab === "manual" && (
          <div className="max-w-md mx-auto">
            <Card className="border-slate-200 shadow-md bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">Institutional Single Sign-On</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Select an academic email or enter your institutional account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleManualSubmit}>
                <CardContent className="space-y-4">
                  {/* Quick autofill helper */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Select Role to Autofill Credentials
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {OFFICIAL_PERSONAS.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            setSelectedPersonaId(p.id);
                            setEmail(p.email);
                          }}
                          className={`p-2 rounded-lg text-left text-xs border transition-all ${
                            email === p.email
                              ? "bg-[#236B8E]/10 border-[#236B8E] text-[#1B4D68] font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="truncate font-semibold">{p.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      CIT Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Campus Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 text-xs bg-slate-50 border-slate-200 text-slate-800"
                        required
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-bold bg-[#1B5270] hover:bg-[#153e55]"
                    type="submit"
                    disabled={loggingIn}
                  >
                    <span>{loggingIn ? "Authenticating..." : "Sign In to Platform"}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* Section 4 Conflict Priority Order Reference */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#236B8E]" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Section 4 Conflict Resolution Hierarchy
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              &ldquo;When two requests want the same room at the same time, this order decides who gets it&rdquo;
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { rank: "1", title: "Exams", color: "border-red-200 bg-red-50 text-red-900" },
              { rank: "2", title: "Regular classes", color: "border-blue-200 bg-blue-50 text-blue-900" },
              { rank: "3", title: "Institute events", color: "border-purple-200 bg-purple-50 text-purple-900" },
              { rank: "4", title: "Guest lectures", color: "border-teal-200 bg-teal-50 text-teal-900" },
              { rank: "5", title: "Department events", color: "border-indigo-200 bg-indigo-50 text-indigo-900" },
              { rank: "6", title: "Club events", color: "border-amber-200 bg-amber-50 text-amber-900" },
            ].map((item) => (
              <div
                key={item.rank}
                className={`p-2.5 rounded-xl border text-center font-medium ${item.color} shadow-xs`}
              >
                <div className="text-[10px] font-bold opacity-60">Priority {item.rank}</div>
                <div className="text-xs font-bold truncate mt-0.5">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-Based Access Control Enforced · Zero Self-Approval Mandate Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Chilika Institute of Technology © 2026</span>
          <span>•</span>
          <span className="font-mono">CP-SAT Deterministic Solver v1.0.1</span>
        </div>
      </footer>
    </div>
  );
}
