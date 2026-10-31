"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  KeyRound,
  Cpu,
  Layers,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth, OFFICIAL_PERSONAS, Persona } from "@/lib/auth";

export default function RootHomePage() {
  const router = useRouter();
  const { login } = useAuth();

  // Animation Phase State: 'intro' -> 'login' -> 'authenticating'
  const [phase, setPhase] = useState<"intro" | "login" | "authenticating">("intro");
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Persona>(OFFICIAL_PERSONAS[0]);
  const [authEmail, setAuthEmail] = useState("dean@cit.edu.in");
  const [authPassword, setAuthPassword] = useState("••••••••••••");
  const [activeTab, setActiveTab] = useState<"quick" | "manual">("quick");

  const introSteps = [
    "Initializing Google OR-Tools CP-SAT Solver v9.8...",
    "Loading Section 4 Four-Role Access Matrix (Admin, Coordinator, Faculty, Club Rep)...",
    "Enforcing Zero Self-Approval Mandate (HTTP 403 Forbidden)...",
    "Calibrating 6-Tier Conflict Resolution Hierarchy...",
    "CIT Venue Manager & Timetable Optimization Gateway Ready.",
  ];

  // Professional Intro Animation Sequence (~1.8 seconds)
  useEffect(() => {
    if (phase !== "intro") return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setPhase("login"), 250);
          return 100;
        }
        const next = prev + 5;
        const newStep = Math.min(
          Math.floor((next / 100) * introSteps.length),
          introSteps.length - 1
        );
        setStepIndex(newStep);
        return next;
      });
    }, 70);

    return () => clearInterval(timer);
  }, [phase]);

  const handleSkipIntro = () => {
    setProgress(100);
    setPhase("login");
  };

  const handleSelectAndLogin = (persona: Persona) => {
    setSelectedRole(persona);
    setPhase("authenticating");
    login(persona.id);

    // Target route based on role for optimal user experience
    let targetRoute = "/dashboard";
    if (persona.id === "FAC-01") targetRoute = "/timetable";
    else if (persona.id === "CLUB-LIT-01") targetRoute = "/venue-bookings";
    else if (persona.id === "COORD-CSE") targetRoute = "/approvals";

    setTimeout(() => {
      router.push(targetRoute);
    }, 700);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase("authenticating");
    login(authEmail);
    const matched =
      OFFICIAL_PERSONAS.find((p) => p.email.toLowerCase() === authEmail.toLowerCase()) ||
      OFFICIAL_PERSONAS[0];
    setSelectedRole(matched);

    let targetRoute = "/dashboard";
    if (matched.id === "FAC-01") targetRoute = "/timetable";
    else if (matched.id === "CLUB-LIT-01") targetRoute = "/venue-bookings";

    setTimeout(() => {
      router.push(targetRoute);
    }, 700);
  };

  const getRoleIcon = (roleId: string, className = "w-6 h-6") => {
    switch (roleId) {
      case "DEAN-01":
        return <ShieldCheck className={`${className} text-[#1B4D68]`} />;
      case "COORD-CSE":
        return <Building2 className={`${className} text-emerald-700`} />;
      case "FAC-01":
        return <GraduationCap className={`${className} text-indigo-700`} />;
      case "CLUB-LIT-01":
        return <Sparkles className={`${className} text-amber-700`} />;
      default:
        return <UserCheck className={`${className} text-slate-700`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-[#236B8E]/20">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* ============================================================== */}
      {/* 1. PROFESSIONAL INSTITUTIONAL INTRO SPLASH ANIMATION           */}
      {/* ============================================================== */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-50 bg-[#0F1E2E] text-white flex flex-col items-center justify-center p-6 transition-all duration-700 ease-out">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#236B8E]/25 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Pulsing CIT Insignia */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-[#236B8E]/30 animate-ping opacity-30" />
              <div className="absolute inset-[-6px] rounded-3xl border border-[#5B93B5]/40 animate-spin [animation-duration:8s]" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1B4D68] to-[#2B7A9E] shadow-2xl flex items-center justify-center border border-[#5B93B5]/50">
                <span className="text-2xl font-black tracking-widest text-white drop-shadow-md">
                  CIT
                </span>
              </div>
            </div>

            {/* Institution Header */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Chilika Institute of Technology
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
                Venue Manager &amp; Timetable Optimization System
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-[11px] font-mono border border-white/15">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google OR-Tools CP-SAT Engine · Section 4 RBAC</span>
              </div>
            </div>

            {/* Terminal Live Initialization Sequence */}
            <div className="bg-black/40 border border-slate-700/60 rounded-xl p-4 text-left font-mono text-xs space-y-2.5 backdrop-blur-md shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  System Initialization
                </span>
                <span>{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-[#5B93B5] transition-all duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Status Line */}
              <div className="text-[11px] text-slate-300 truncate h-4 flex items-center gap-2">
                <span className="text-emerald-400">›</span>
                <span>{introSteps[stepIndex]}</span>
              </div>
            </div>

            {/* Skip Button */}
            <div>
              <button
                type="button"
                onClick={handleSkipIntro}
                className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4 flex items-center gap-1 mx-auto"
              >
                <span>Skip Intro &amp; Go to Login</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. AUTHENTICATING TRANSITION OVERLAY                           */}
      {/* ============================================================== */}
      {phase === "authenticating" && (
        <div className="fixed inset-0 z-50 bg-[#0F1E2E]/90 backdrop-blur-md text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Access Granted</h2>
            <div className="text-xs text-slate-300 space-y-1">
              <p>
                Authenticated as: <strong className="text-white">{selectedRole.name}</strong>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Role: {selectedRole.role} ({selectedRole.badge})
              </p>
              <p className="text-emerald-400 font-semibold pt-1">
                Applying role permissions &amp; opening workspace...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SECTION 4 INSTITUTIONAL LOGIN GATEWAY                       */}
      {/* ============================================================== */}
      <header className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex items-center justify-between z-10">
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

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Week 7 Active (Spectra &amp; Midsems)
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-2 my-auto space-y-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Title & Section 4 Mandate */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EAF1] border border-[#CBD9E5] text-[#1B4D68] text-xs font-bold shadow-2xs">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Section 4: Four Roles &amp; Conflict Priority Gate</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Institutional Role Sign-In
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Select your assigned campus role below. Each role unlocks exact operational authorities
            and editing permissions across timetabling, venue bookings, and conflict governance.
          </p>
        </div>

        {/* Section 4 Strict Self-Approval Ban Alert */}
        <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                  Section 4 Mandatory Governance Rule:
                </span>
                <span className="bg-purple-200 text-purple-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Zero Self-Approval
                </span>
              </div>
              <p className="text-xs text-purple-800 mt-0.5">
                <strong>&ldquo;Nobody can approve their own request.&rdquo;</strong> If an approver attempts to sign off on a venue booking they submitted, the system halts with HTTP 403 Forbidden.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-purple-900 bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200">
              6 Conflict Tiers Enforced
            </span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/90 border border-slate-300 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("quick")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "quick"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1-Click Role Access (4 Section 4 Roles)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "manual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Institutional Email &amp; Password SSO
            </button>
          </div>
        </div>

        {/* TAB 1: 4 ROLE CARDS */}
        {activeTab === "quick" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_PERSONAS.map((persona) => {
              return (
                <div
                  key={persona.id}
                  onClick={() => handleSelectAndLogin(persona)}
                  className="group relative bg-white border border-slate-200/90 hover:border-[#236B8E] hover:ring-2 hover:ring-[#236B8E]/20 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name & Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#F0F4F8] border border-slate-200 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                          {getRoleIcon(persona.id)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1B4D68] transition-colors flex items-center gap-1.5">
                            <span>{persona.name}</span>
                          </h3>
                          <div className="text-xs text-slate-500 font-medium">{persona.department}</div>
                        </div>
                      </div>
                      <Badge variant={persona.badgeVariant} className="text-[11px] font-bold shrink-0">
                        {persona.badge}
                      </Badge>
                    </div>

                    {/* Section 4 Authority Box */}
                    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100 mb-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Role: {persona.role}</span>
                        <span className="font-mono text-slate-400">{persona.id}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        <strong>Authority:</strong> {persona.whatTheyCanDo}
                      </p>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">{persona.email}</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1B5270] hover:bg-[#153e55] group-hover:bg-[#236B8E] transition-all shadow-xs"
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

        {/* TAB 2: MANUAL CREDENTIALS SSO */}
        {activeTab === "manual" && (
          <div className="max-w-md mx-auto">
            <Card className="border-slate-200 shadow-md bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">Institutional Single Sign-On</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Select a role preset or enter your official institutional credentials
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleManualLogin}>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Autofill Persona
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {OFFICIAL_PERSONAS.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            setSelectedRole(p);
                            setAuthEmail(p.email);
                          }}
                          className={`p-2 rounded-lg text-left text-xs border transition-all ${
                            authEmail === p.email
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
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
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
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
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
                  >
                    <span>Sign In to Platform</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* Section 4 Conflict Resolution Hierarchy Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
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
                className={`p-2 rounded-xl border text-center font-medium ${item.color} shadow-2xs`}
              >
                <div className="text-[10px] font-bold opacity-60">Priority {item.rank}</div>
                <div className="text-xs font-bold truncate mt-0.5">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 z-10">
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
