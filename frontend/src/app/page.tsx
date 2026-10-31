"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  AlertCircle,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth, DEMO_ROLES, Persona } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function RootHomePage() {
  const router = useRouter();
  const { login, refresh } = useAuth();

  // Animation Phase State: 'intro' -> 'login' -> 'authenticating'
  const [phase, setPhase] = useState<"intro" | "login" | "authenticating">("intro");
  const [progress, setProgress] = useState(0);

  const [selectedRole, setSelectedRole] = useState<Persona>(DEMO_ROLES[0]);
  const [email, setEmail] = useState("coordinator@chitkara.edu.in");
  const [password, setPassword] = useState("Coord@2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Professional Intro Animation Sequence (~1.6 seconds)
  useEffect(() => {
    if (phase !== "intro") return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setPhase("login"), 250);
          return 100;
        }
        return prev + 5;
      });
    }, 70);

    return () => clearInterval(timer);
  }, [phase]);

  const handleSkipIntro = () => {
    setProgress(100);
    setPhase("login");
  };

  const handleSelectRole = (role: Persona) => {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword(role.password || "Coord@2026");
    setError("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      await login(email, password);
      await refresh();

      setPhase("authenticating");

      // Target route based on role for optimal user experience
      let targetRoute = "/dashboard";
      if (selectedRole.id === "FAC-01" || selectedRole.role === "faculty") targetRoute = "/timetable";
      else if (selectedRole.id === "CLUB-LIT-01" || selectedRole.role === "student_representative") targetRoute = "/venue-bookings";
      else if (selectedRole.id === "COORD-CSE" || selectedRole.role === "timetable_coordinator") targetRoute = "/dashboard";

      setTimeout(() => {
        router.push(targetRoute);
      }, 700);
    } catch (err: any) {
      await login(email, password);
      setPhase("authenticating");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleId: string, className = "w-6 h-6") => {
    switch (roleId) {
      case "academic_dean":
      case "DEAN-01":
      case "super_admin":
        return <ShieldCheck className={`${className} text-[#B08401]`} />;
      case "timetable_coordinator":
      case "COORD-CSE":
        return <Building2 className={`${className} text-[#683B2B]`} />;
      case "faculty":
      case "FAC-01":
        return <GraduationCap className={`${className} text-[#D49E8D]`} />;
      case "venue_manager":
        return <Sparkles className={`${className} text-[#683B2B]`} />;
      case "student_representative":
      case "CLUB-LIT-01":
        return <Sparkles className={`${className} text-[#B08401]`} />;
      default:
        return <UserCheck className={`${className} text-[#683B2B]`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-[#683B2B] font-sans relative overflow-hidden flex flex-col justify-between selection:bg-[#B08401]/20">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#DED1BD_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

      {/* ============================================================== */}
      {/* 1. PROFESSIONAL INTRO ANIMATION WITH MINIMALIST LOADING LINE   */}
      {/* ============================================================== */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-50 bg-[#351B12] text-[#FAF6F2] flex flex-col items-center justify-center p-6 transition-all duration-700 ease-out">
          {/* Subtle Warm Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#B08401]/20 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#D49E8D]/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Glowing VetoGrid Eagle Insignia */}
            <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-[#B08401]/30 animate-ping opacity-30" />
              <div className="absolute inset-[-8px] rounded-3xl border-2 border-[#B08401]/40 animate-spin [animation-duration:9s]" />
              <div className="w-24 h-24 rounded-2xl bg-white shadow-2xl flex items-center justify-center border-2 border-[#DED1BD] p-2 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="VetoGrid Logo"
                  width={80}
                  height={80}
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Platform Brand Header */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#FAF6F2] drop-shadow-sm">
                VetoGrid
              </h1>
              <p className="text-xs sm:text-sm text-[#DED1BD] font-medium tracking-wide">
                Autonomous Campus Scheduling &amp; Venue Governance Platform
              </p>
            </div>

            {/* Loading Line Only */}
            <div className="w-full max-w-sm mx-auto pt-2">
              <div className="w-full h-1.5 bg-[#4A2619] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#B08401] via-[#D49E8D] to-[#FAF6F2] transition-all duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Skip Button */}
            <div>
              <button
                type="button"
                onClick={handleSkipIntro}
                className="text-xs text-[#DED1BD]/70 hover:text-[#FAF6F2] transition-colors underline underline-offset-4 flex items-center gap-1 mx-auto"
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
        <div className="fixed inset-0 z-50 bg-[#351B12]/95 backdrop-blur-md text-[#FAF6F2] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#B08401]/20 border border-[#B08401]/50 text-[#B08401] mx-auto flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#FAF6F2]">Access Granted</h2>
            <div className="text-xs text-[#DED1BD] space-y-1">
              <p>
                Authenticated as: <strong className="text-white">{selectedRole.name}</strong>
              </p>
              <p className="text-[11px] text-[#DED1BD]/80 font-mono">
                Role: {selectedRole.label || selectedRole.role} ({selectedRole.badge})
              </p>
              <p className="text-[#B08401] font-semibold pt-1">
                Applying role permissions &amp; opening workspace...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. VETOGRID INSTITUTIONAL LOGIN PORTAL                         */}
      {/* ============================================================== */}
      <header className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white border border-[#DED1BD] shadow-xs flex items-center justify-center p-1.5 overflow-hidden">
            <Image
              src="/logo.png"
              alt="VetoGrid Logo"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-[#683B2B] leading-tight flex items-center gap-2">
              <span>VetoGrid</span>
            </h1>
            <p className="text-xs text-[#8B5E4B] font-medium">
              Intelligent Campus Scheduling Platform · Chitkara Institute of Technology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF3F1] text-[#683B2B] border border-[#EAC8BF]">
            <span className="w-2 h-2 rounded-full bg-[#B08401] animate-pulse" />
            Week 7 Active (Spectra &amp; Midsems)
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-2 my-auto space-y-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Section 4 Strict Self-Approval Ban Alert */}
        <div className="bg-[#FAF3F1] border border-[#EAC8BF] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F0DBD4] text-[#683B2B] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#B08401]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#683B2B] uppercase tracking-wide">
                  Section 4 Mandatory Governance Rule:
                </span>
                <span className="bg-[#EAC8BF] text-[#683B2B] text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Zero Self-Approval
                </span>
              </div>
              <p className="text-xs text-[#7A4B3A] mt-0.5">
                <strong>&ldquo;Nobody can approve their own request.&rdquo;</strong> If an approver attempts to sign off on a venue booking they submitted, the system halts with HTTP 403 Forbidden.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#683B2B] bg-[#F7EBE7] px-3 py-1.5 rounded-xl border border-[#EAC8BF]">
              6 Conflict Tiers Enforced
            </span>
          </div>
        </div>

        {/* routinetable.vercel.app Inspired Login Card */}
        <div className="max-w-xl mx-auto w-full">
          <Card className="border-[#DED1BD] shadow-xl bg-white/95 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-[#FAF6F2]">
              <CardTitle className="text-base text-[#683B2B] font-bold">
                Sign In to Campus Portal
              </CardTitle>
              <CardDescription className="text-xs text-[#8B5E4B]">
                Select a demo role or enter your institutional credentials
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLoginSubmit}>
              <CardContent className="space-y-4 pt-4">
                {/* Quick Demo Access (RBAC Simulation) */}
                <div>
                  <label className="text-xs font-semibold text-[#683B2B] block mb-1.5">
                    Quick Demo Access (RBAC Simulation)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {DEMO_ROLES.slice(0, 6).map((role) => {
                      const isSelected = selectedRole.id === role.id;
                      return (
                        <button
                          type="button"
                          key={role.id}
                          onClick={() => handleSelectRole(role)}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-xl text-xs font-medium border text-left transition-all",
                            isSelected
                              ? "bg-[#FAF3F1] border-[#B08401] text-[#683B2B] ring-1 ring-[#B08401] shadow-2xs font-semibold"
                              : "bg-[#FAF6F2] border-[#DED1BD] text-[#8B5E4B] hover:bg-[#F3EFE7] hover:text-[#683B2B]"
                          )}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-[#683B2B] truncate">{role.label}</div>
                            <div className="text-[10px] text-[#8B5E4B] font-mono truncate">{role.email}</div>
                          </div>
                          <Badge variant={isSelected ? "gold" : "outline"} className="text-[10px] shrink-0 font-bold">
                            {role.badge}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Role Authority Banner */}
                <div className="bg-[#FAF6F2] rounded-xl p-3 border border-[#E8DFD5] text-xs">
                  <div className="text-[10px] font-bold text-[#8B5E4B] uppercase tracking-wider mb-0.5 flex items-center justify-between">
                    <span>Role: {selectedRole.label || selectedRole.role}</span>
                    <span className="font-mono text-[#B08401] font-bold">{selectedRole.id}</span>
                  </div>
                  <p className="text-[11px] text-[#683B2B] leading-relaxed">
                    <strong>Authority:</strong> {selectedRole.whatTheyCanDo}
                  </p>
                </div>

                {/* Institutional Email */}
                <div>
                  <label className="text-xs font-semibold text-[#683B2B] block mb-1.5">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8B5E4B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="pl-9 text-xs bg-[#FAF6F2] border-[#DED1BD] text-[#683B2B] focus:border-[#B08401]"
                      placeholder="user@chitkara.edu.in"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-[#683B2B] block mb-1.5">
                    Campus Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8B5E4B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="pl-9 text-xs bg-[#FAF6F2] border-[#DED1BD] text-[#683B2B] focus:border-[#B08401]"
                      required
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  variant="cit"
                  size="md"
                  className="w-full text-xs font-bold bg-[#B08401] hover:bg-[#8F6B01] text-white shadow-xs"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    "Authenticating..."
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <span>Access Platform as {selectedRole.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Section 4 Conflict Resolution Hierarchy Bar */}
        <div className="bg-white border border-[#DED1BD] rounded-2xl p-4 shadow-xs max-w-xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B08401]" />
              <h4 className="text-xs font-bold text-[#683B2B] uppercase tracking-wide">
                Section 4 Conflict Resolution Hierarchy
              </h4>
            </div>
            <span className="text-[10px] text-[#8B5E4B] font-medium hidden sm:inline">
              Tie-Breaker Priority
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {[
              { rank: "1", title: "Exams", color: "border-[#EAC8BF] bg-[#FAF3F1] text-[#683B2B]" },
              { rank: "2", title: "Classes", color: "border-[#DED1BD] bg-[#FAF6F2] text-[#683B2B]" },
              { rank: "3", title: "Institutes", color: "border-[#ECD693] bg-[#FBF6EA] text-[#745501]" },
              { rank: "4", title: "Guests", color: "border-[#DED1BD] bg-[#F3EFE7] text-[#683B2B]" },
              { rank: "5", title: "Dept Events", color: "border-[#EAC8BF] bg-[#FAF3F1] text-[#683B2B]" },
              { rank: "6", title: "Clubs", color: "border-[#ECD693] bg-[#FBF6EA] text-[#745501]" },
            ].map((item) => (
              <div
                key={item.rank}
                className={`p-1.5 rounded-lg border text-center font-medium ${item.color} shadow-2xs`}
              >
                <div className="text-[9px] font-bold opacity-75">P{item.rank}</div>
                <div className="text-[11px] font-bold truncate mt-0.5">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto p-4 border-t border-[#DED1BD] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8B5E4B] gap-2 z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B08401]" />
          <span>Role-Based Access Control • HMAC-SHA256 Session Tokens Enforced</span>
        </div>
        <div className="flex items-center gap-3">
          <span>VetoGrid © 2026</span>
          <span>•</span>
          <span className="font-mono">Google OR-Tools CP-SAT v9.8</span>
        </div>
      </footer>
    </div>
  );
}
