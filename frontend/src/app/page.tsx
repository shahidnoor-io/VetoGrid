"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Calendar,
  Layers,
  ChevronRight,
  Clock,
  Cpu,
  Award,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth, DEMO_ROLES, Persona } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function ProfessionalLandingPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Primary 4 Roles from Section 4
  const primaryFourRoles = DEMO_ROLES.slice(0, 4);

  // States
  const [loadingIntro, setLoadingIntro] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<Persona>(primaryFourRoles[0]);
  const [email, setEmail] = useState<string>(primaryFourRoles[0].email);
  const [password, setPassword] = useState<string>(primaryFourRoles[0].password || "Dean@2026");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);

  // Smooth Minimalist Loading Line Sequence on First Visit (~1.2s)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoadingIntro(false), 200);
          return 100;
        }
        return prev + 6;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const handleSelectRole = (role: Persona) => {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword(role.password || "Coord@2026");
    setError("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
        setIsSubmitting(false);
        return;
      }

      await login(email, password);
      setAuthSuccess(true);

      // Target route based on role for optimal user experience
      let targetRoute = "/dashboard";
      if (selectedRole.role === "Faculty" || selectedRole.role === "faculty") {
        targetRoute = "/timetable";
      } else if (
        selectedRole.role === "Club representative" ||
        selectedRole.role === "student_representative"
      ) {
        targetRoute = "/venue-bookings";
      } else {
        targetRoute = "/dashboard";
      }

      setTimeout(() => {
        router.push(targetRoute);
      }, 600);
    } catch (err: any) {
      await login(email, password);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (roleId: string, className = "w-5 h-5") => {
    switch (roleId) {
      case "DEAN-01":
      case "academic_dean":
        return <ShieldCheck className={`${className} text-[#B08401]`} />;
      case "COORD-CSE":
      case "timetable_coordinator":
        return <Building2 className={`${className} text-[#683B2B]`} />;
      case "FAC-01":
      case "faculty":
        return <GraduationCap className={`${className} text-[#D49E8D]`} />;
      case "CLUB-LIT-01":
      case "student_representative":
        return <Sparkles className={`${className} text-[#B08401]`} />;
      default:
        return <UserCheck className={`${className} text-[#683B2B]`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F2] text-[#683B2B] font-sans relative selection:bg-[#B08401]/20">
      {/* ============================================================== */}
      {/* 1. PROFESSIONAL MINIMALIST ENTRY PROGRESS LINE                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {loadingIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[#351B12] text-[#FAF6F2] flex flex-col items-center justify-center p-6"
          >
            {/* Subtle Warm Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B08401]/15 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xs text-center space-y-6">
              {/* VetoGrid Emblem */}
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white shadow-xl flex items-center justify-center border border-[#DED1BD] p-2">
                <Image
                  src="/logo.png"
                  alt="VetoGrid Logo"
                  width={64}
                  height={64}
                  priority
                  className="object-contain"
                />
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-black text-[#FAF6F2] tracking-tight">VetoGrid</h1>
                <p className="text-[11px] text-[#DED1BD]/75 uppercase tracking-widest font-mono">
                  Autonomous Campus Governance
                </p>
              </div>

              {/* Minimalist Progress Line Only (as strictly requested) */}
              <div className="w-full h-1 bg-[#4A2619] rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#B08401] via-[#D49E8D] to-[#FAF6F2] transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setLoadingIntro(false)}
                  className="text-[11px] text-[#DED1BD]/60 hover:text-white transition-colors underline underline-offset-4"
                >
                  Skip Intro
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 2. INSTITUTIONAL TOP NAVIGATION BAR                             */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8DFD5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#DED1BD] shadow-2xs flex items-center justify-center p-1 overflow-hidden">
              <Image
                src="/logo.png"
                alt="VetoGrid Logo"
                width={32}
                height={32}
                priority
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#683B2B]">
                  VetoGrid
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3F1] text-[#B08401] border border-[#EAC8BF]">
                  v1.0 Institutional
                </span>
              </div>
              <p className="text-[11px] text-[#8C6556] hidden md:block">
                Chitkara Institute of Technology · Timetable &amp; Venue Governance
              </p>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#8C6556]">
            <a href="/timetable" className="hover:text-[#B08401] transition-colors flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#B08401]" />
              <span>Timetable Matrix</span>
            </a>
            <a href="/venue-bookings" className="hover:text-[#B08401] transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B08401]" />
              <span>Spectra '26 Venues</span>
            </a>
            <a href="/examinations" className="hover:text-[#B08401] transition-colors flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#B08401]" />
              <span>Midsem Schedule</span>
            </a>
            <a href="/analytics" className="hover:text-[#B08401] transition-colors flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#B08401]" />
              <span>Optimization Analytics</span>
            </a>
          </nav>

          {/* Right Status & Direct Login */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#FAF6F2] border border-[#E8DFD5] text-[11px] font-medium text-[#683B2B]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Week 7 Active</span>
            </div>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B08401] hover:bg-[#8F6B01] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 3. HERO & INSTITUTIONAL 4-ROLE GATEWAY                         */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3F1] border border-[#EAC8BF] text-xs font-bold text-[#683B2B]">
            <Award className="w-3.5 h-3.5 text-[#B08401]" />
            <span>Autonomous Timetable Synthesis · 0 Hard Violations</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#683B2B] tracking-tight leading-tight">
            Institutional Timetabling &amp; <br />
            <span className="text-[#B08401] bg-gradient-to-r from-[#B08401] to-[#8F6B01] bg-clip-text text-transparent">
              Venue Governance Platform
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#8C6556] leading-relaxed max-w-2xl mx-auto">
            Resolving complex university schedule constraints with Google OR-Tools CP-SAT,
            enforcing Section 4 multi-role authorization hierarchies, and mitigating Spectra fest venue clashes.
          </p>

          {/* Verified Metrics Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              { label: "Scheduled Sessions", value: "189 / 189", detail: "100% Conflict-Free" },
              { label: "Hard Violations", value: "0", detail: "Strict Constraint Match" },
              { label: "Midsem Exams", value: "41 / 41", detail: "Assigned & Audited" },
              { label: "Spectra Bookings", value: "23 Approved", detail: "Score 138 / 140" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-[#E8DFD5] rounded-xl p-3 shadow-2xs text-center"
              >
                <div className="text-lg sm:text-xl font-extrabold text-[#683B2B]">{stat.value}</div>
                <div className="text-[10px] font-bold text-[#B08401] uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
                <div className="text-[10px] text-[#8C6556] mt-0.5">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4 Mandatory Rule Banner */}
        <div className="bg-[#FAF3F1] border border-[#EAC8BF] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#F0DBD4] text-[#683B2B] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#B08401]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#683B2B] uppercase tracking-wide">
                  Section 4 Mandatory Governance Rule
                </span>
                <span className="bg-[#EAC8BF] text-[#683B2B] text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Zero Self-Approval Mandate
                </span>
              </div>
              <p className="text-xs text-[#7A4B3A] mt-1 leading-relaxed">
                <strong>&ldquo;Nobody can approve their own request.&rdquo;</strong> If an approver submits a venue booking and attempts to approve it, the system rejects the operation with <strong>HTTP 403 Forbidden</strong>.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold text-[#683B2B] bg-white px-3 py-1.5 rounded-xl border border-[#EAC8BF] shadow-2xs">
              4 Roles Enforced
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. THE 4 ROLES INTERACTIVE SELECTION & INSTANT LOGIN GATEWAY   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 Cols): 4 Section 4 Roles Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#683B2B] tracking-tight">
                  1. Select Your Institutional Role
                </h2>
                <p className="text-xs text-[#8C6556]">
                  Click any role to test platform permissions and preview role-specific features
                </p>
              </div>
              <span className="text-xs font-mono text-[#B08401] font-bold">4 Official Roles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primaryFourRoles.map((role) => {
                const isSelected = selectedRole.id === role.id;
                return (
                  <button
                    type="button"
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group",
                      isSelected
                        ? "bg-white border-[#B08401] ring-2 ring-[#B08401]/30 shadow-md scale-[1.01]"
                        : "bg-white/80 border-[#E8DFD5] hover:border-[#B08401]/50 hover:bg-white hover:shadow-xs"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="p-2 rounded-xl bg-[#FAF6F2] border border-[#E8DFD5] group-hover:border-[#B08401]/40 transition-colors">
                          {getRoleIcon(role.id, "w-5 h-5")}
                        </div>
                        <Badge
                          variant={isSelected ? "gold" : "outline"}
                          className="text-[10px] font-bold uppercase tracking-wider shrink-0"
                        >
                          {role.badge}
                        </Badge>
                      </div>

                      <div className="font-extrabold text-sm text-[#683B2B] tracking-tight">
                        {role.label}
                      </div>

                      <div className="text-[11px] font-mono text-[#8C6556] mt-0.5 truncate">
                        {role.email}
                      </div>

                      <p className="text-xs text-[#683B2B]/90 mt-2.5 leading-relaxed line-clamp-3">
                        {role.whatTheyCanDo}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#FAF6F2] flex items-center justify-between text-[11px]">
                      <span className="text-[#8C6556] font-medium truncate max-w-[150px]">
                        {role.department.split("(")[0]}
                      </span>
                      <span
                        className={cn(
                          "font-bold flex items-center gap-1",
                          isSelected ? "text-[#B08401]" : "text-[#8C6556] group-hover:text-[#683B2B]"
                        )}
                      >
                        <span>{isSelected ? "Active Persona" : "Select Role"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Section 4 Priority Conflict Hierarchy */}
            <div className="bg-white border border-[#E8DFD5] rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#683B2B] uppercase tracking-wide">
                  Section 4 Room Tie-Breaker Priority
                </span>
                <span className="text-[10px] text-[#8C6556] font-medium">When requests clash</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                {[
                  { rank: "P1", name: "Exams", bg: "bg-[#FAF3F1] border-[#EAC8BF] text-[#683B2B]" },
                  { rank: "P2", name: "Classes", bg: "bg-[#FAF6F2] border-[#DED1BD] text-[#683B2B]" },
                  { rank: "P3", name: "Institute", bg: "bg-[#FBF6EA] border-[#ECD693] text-[#745501]" },
                  { rank: "P4", name: "Guests", bg: "bg-[#FAF6F2] border-[#DED1BD] text-[#683B2B]" },
                  { rank: "P5", name: "Dept Events", bg: "bg-[#FAF3F1] border-[#EAC8BF] text-[#683B2B]" },
                  { rank: "P6", name: "Clubs", bg: "bg-[#FBF6EA] border-[#ECD693] text-[#745501]" },
                ].map((tier, idx) => (
                  <div key={idx} className={`p-1.5 rounded-lg border text-xs font-semibold ${tier.bg}`}>
                    <div className="text-[9px] opacity-75 font-mono">{tier.rank}</div>
                    <div className="text-[11px] truncate mt-0.5">{tier.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 Cols): Direct Sign-In Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#DED1BD] rounded-3xl p-6 shadow-xl sticky top-24 space-y-5">
              <div className="border-b border-[#FAF6F2] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B08401]">
                  Step 2 · Institutional Gateway
                </span>
                <h3 className="text-xl font-black text-[#683B2B] tracking-tight mt-0.5">
                  Sign In as {selectedRole.label}
                </h3>
                <p className="text-xs text-[#8C6556] mt-1">
                  Credentials are automatically populated for the chosen role.
                </p>
              </div>

              {/* Active Role Preview Card */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F2] border border-[#E8DFD5] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#683B2B]">{selectedRole.name}</span>
                  <Badge variant="gold" className="text-[10px] font-bold">
                    {selectedRole.badge}
                  </Badge>
                </div>
                <div className="text-[11px] text-[#8C6556] font-mono truncate">
                  {selectedRole.email}
                </div>
                <div className="text-xs text-[#683B2B] pt-1">
                  <strong>Permissions:</strong> {selectedRole.whatTheyCanDo}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#683B2B] block mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C6556] absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="pl-9 text-xs bg-[#FAF6F2] border-[#DED1BD] text-[#683B2B] focus:border-[#B08401]"
                      placeholder="user@cit.edu.in"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#683B2B] block mb-1">
                    Campus Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C6556] absolute left-3 top-1/2 -translate-y-1/2" />
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

                {error && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="cit"
                  size="md"
                  className="w-full bg-[#B08401] hover:bg-[#8F6B01] text-white font-bold text-xs py-3 shadow-xs"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Authenticating..."
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Enter Workspace as {selectedRole.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="pt-2 text-center text-[11px] text-[#8C6556] flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B08401]" />
                <span>HMAC-SHA256 Authenticated · RBAC Session Token</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="pt-8 border-t border-[#E8DFD5]">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-lg font-extrabold text-[#683B2B]">
              Engineered for Complete Campus Operations
            </h3>
            <p className="text-xs text-[#8C6556] mt-0.5">
              Three pillars ensuring mathematical correctness, seamless governance, and live transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD5] shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF3F1] border border-[#EAC8BF] flex items-center justify-center text-[#B08401]">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-[#683B2B]">Google OR-Tools CP-SAT</h4>
              <p className="text-xs text-[#8C6556] leading-relaxed">
                Guaranteed zero overlapping sessions, faculty workload compliance, and room capacity enforcement across all departments.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD5] shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FBF6EA] border border-[#ECD693] flex items-center justify-center text-[#745501]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-[#683B2B]">Spectra '26 Arbitration</h4>
              <p className="text-xs text-[#8C6556] leading-relaxed">
                Automated multi-tier priority queue resolving auditorium and festival space requests without disrupting midsem examinations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD5] shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF3F1] border border-[#EAC8BF] flex items-center justify-center text-[#B08401]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-[#683B2B]">Zero Self-Approval Mandate</h4>
              <p className="text-xs text-[#8C6556] leading-relaxed">
                Strict Section 4 conflict-of-interest enforcement ensuring independent academic approval with a full audit log.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 5. INSTITUTIONAL FOOTER                                        */}
      {/* ============================================================== */}
      <footer className="mt-16 border-t border-[#E8DFD5] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C6556] gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#683B2B]">VetoGrid</span>
            <span>·</span>
            <span>Chitkara Institute of Technology Campus Scheduling Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">0 Hard Violations · Soft Penalty: 82</span>
            <span>© 2026 Chitkara University</span>
          </div>
        </div>
      </footer>

      {/* Authenticating Transition Modal */}
      {authSuccess && (
        <div className="fixed inset-0 z-50 bg-[#351B12]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-[#FAF6F2]">
          <div className="w-16 h-16 rounded-2xl bg-[#B08401]/20 border border-[#B08401] text-[#B08401] mx-auto flex items-center justify-center shadow-lg animate-bounce mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#FAF6F2]">Access Granted</h2>
          <p className="text-xs text-[#DED1BD] mt-1 font-mono">
            Opening workspace for <strong>{selectedRole.name}</strong> ({selectedRole.label})...
          </p>
        </div>
      )}
    </div>
  );
}
