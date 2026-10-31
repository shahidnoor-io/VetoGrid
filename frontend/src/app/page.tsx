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
  RotateCcw,
  Sparkle,
  ChevronDown,
  Layers,
  ArrowUpRight,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth, DEMO_ROLES, Persona } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function DribbbleStyleLandingPage() {
  const router = useRouter();
  const { login } = useAuth();

  // The 4 Section 4 Primary Roles
  const primaryFourRoles = DEMO_ROLES.slice(0, 4);

  // States
  const [isCrumpled, setIsCrumpled] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Persona>(primaryFourRoles[0]);
  const [email, setEmail] = useState<string>(primaryFourRoles[0].email);
  const [password, setPassword] = useState<string>(primaryFourRoles[0].password || "Dean@2026");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Auto-play an introductory crumple-and-reveal demonstration on initial mount
  useEffect(() => {
    const timer1 = setTimeout(() => {
      // gentle preview
    }, 1200);
    return () => clearTimeout(timer1);
  }, []);

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
      setIsAuthenticating(true);

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
      }, 700);
    } catch (err: any) {
      await login(email, password);
      setIsAuthenticating(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0E0A] text-[#FAF6F2] font-sans relative overflow-x-hidden select-none selection:bg-[#B08401]/30">
      {/* Ambient background glow and paper texture */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#B08401]/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[#683B2B]/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#B08401_0.8px,transparent_0.8px)] [background-size:32px_32px] opacity-15" />
      </div>

      {/* ============================================================== */}
      {/* 1. EDITORIAL TOP NAVIGATION (Matching Dribbble Video Layout)   */}
      {/* ============================================================== */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-12 py-6 flex items-center justify-between border-b border-[#FAF6F2]/10 backdrop-blur-md bg-[#1A0E0A]/70">
        {/* Left: Boxed Logo Badge */}
        <div className="flex items-center gap-3">
          <div className="border border-[#FAF6F2]/30 px-3 py-1.5 rounded-sm tracking-widest text-[11px] font-bold uppercase text-[#FAF6F2] flex items-center gap-2 hover:border-[#B08401] transition-colors cursor-pointer">
            <Image
              src="/logo.png"
              alt="VetoGrid Logo"
              width={20}
              height={20}
              priority
              className="object-contain"
            />
            <span className="font-extrabold tracking-widest text-[#FAF6F2]">VETOGRID</span>
          </div>
        </div>

        {/* Center: Editorial Monospace Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest uppercase text-[#DED1BD]/80">
          <button
            onClick={() => setIsCrumpled(!isCrumpled)}
            className="hover:text-[#B08401] transition-colors flex items-center gap-1.5"
          >
            <span>[01]</span>
            <span className="font-semibold underline underline-offset-4 decoration-[#B08401]/40">
              {isCrumpled ? "UNFOLD PAPER" : "CRUMPLE PAPER"}
            </span>
          </button>
          <a href="/timetable" className="hover:text-[#B08401] transition-colors">
            <span>[02]</span> TIMETABLE
          </a>
          <a href="/examinations" className="hover:text-[#B08401] transition-colors">
            <span>[03]</span> EXAMS
          </a>
          <button
            onClick={() => setShowLoginModal(true)}
            className="hover:text-[#B08401] transition-colors text-[#B08401] font-bold"
          >
            <span>[04]</span> 4 ROLES
          </button>
        </nav>

        {/* Right: Status Pill & Direct Access Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-[#DED1BD]/70 border border-[#FAF6F2]/15 px-2.5 py-1 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B08401] animate-pulse" />
            <span>OR-TOOLS CP-SAT</span>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="text-[11px] font-mono uppercase tracking-wider px-3.5 py-1.5 border border-[#B08401] text-[#B08401] hover:bg-[#B08401] hover:text-[#1A0E0A] transition-all rounded-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>ACCESS PORTAL</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN HERO SECTION WITH EDITORIAL TYPOGRAPHY & CRUMPLE EFFECT */}
      {/* ============================================================== */}
      <main className="relative z-10 min-h-screen flex flex-col justify-between pt-28 pb-10 px-6 sm:px-12 max-w-7xl mx-auto">
        {/* Subtitle tag */}
        <div className="text-center pt-4 sm:pt-6">
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase text-[#DED1BD]/80">
            AUTONOMOUS CAMPUS SCHEDULING &amp; VENUE GOVERNANCE
          </p>
          <p className="text-[9px] font-mono tracking-widest text-[#B08401] mt-1 uppercase">
            CHITKARA INSTITUTE OF TECHNOLOGY · SECTION 4 RBAC
          </p>
        </div>

        {/* Central Stage: Giant Editorial Typography & Interactive Framed Artwork */}
        <div className="relative my-auto flex flex-col items-center justify-center py-6">
          {/* Layer 1: Giant Background Title (Stroked Outlines in Dribbble Style) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10">
            <motion.div
              animate={{
                opacity: isCrumpled ? 1 : 0.9,
                scale: isCrumpled ? 1.05 : 1,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center font-black tracking-tighter uppercase leading-[0.85]"
            >
              <div
                className={cn(
                  "text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] transition-all duration-700",
                  isCrumpled
                    ? "text-stroke-gold-thick"
                    : "text-[#B08401] drop-shadow-[0_10px_35px_rgba(176,132,1,0.35)]"
                )}
              >
                VETOGRID
              </div>
              <div
                className={cn(
                  "text-4xl sm:text-6xl md:text-8xl lg:text-[8.5rem] mt-1 sm:mt-2 transition-all duration-700",
                  isCrumpled
                    ? "text-stroke-gold-thick"
                    : "text-stroke-gold"
                )}
              >
                CAMPUS MATRIX
              </div>
            </motion.div>
          </div>

          {/* Layer 2: Central Framed Visual with 3D Paper Crumple / Morph Animation */}
          <div className="relative z-20 w-full max-w-2xl sm:max-w-3xl aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
            <motion.div
              animate={
                isCrumpled
                  ? {
                      scale: 0.32,
                      rotate: 24,
                      skewX: 12,
                      skewY: -8,
                      borderRadius: "45% 55% 48% 52% / 56% 45% 55% 44%",
                      filter: "contrast(180%) brightness(85%) drop-shadow(0 25px 45px rgba(0,0,0,0.9))",
                    }
                  : {
                      scale: 1,
                      rotate: 0,
                      skewX: 0,
                      skewY: 0,
                      borderRadius: "12px",
                      filter: "contrast(105%) brightness(100%) drop-shadow(0 15px 35px rgba(0,0,0,0.6))",
                    }
              }
              transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
              className="relative w-full h-full overflow-hidden border border-[#FAF6F2]/20 shadow-2xl bg-[#28150F] cursor-pointer group"
              onClick={() => setIsCrumpled(!isCrumpled)}
            >
              {/* Architectural Campus & Origami Eagle Visual */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E0A] via-transparent to-[#1A0E0A]/60 z-10" />

              {/* Central Geometric Eagle Motif */}
              <div className="absolute inset-0 flex items-center justify-center p-8 z-0">
                <div className="relative w-48 sm:w-64 md:w-80 h-48 sm:h-64 md:h-80 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                  <div className="absolute inset-0 rounded-full bg-[#B08401]/15 blur-2xl animate-pulse" />
                  <Image
                    src="/logo.png"
                    alt="VetoGrid Origami Eagle"
                    width={320}
                    height={320}
                    priority
                    className="object-contain relative z-10 drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Paper Fold Lines / Creases Simulation Overlay */}
              <div
                className={cn(
                  "absolute inset-0 pointer-events-none transition-opacity duration-700 z-15",
                  isCrumpled
                    ? "opacity-90 bg-[radial-gradient(#FAF6F2_1px,transparent_1px),linear-gradient(45deg,rgba(0,0,0,0.5)_25%,transparent_25%),linear-gradient(-45deg,rgba(255,255,255,0.2)_25%,transparent_25%)] [background-size:20px_20px,40px_40px,40px_40px]"
                    : "opacity-0"
                )}
              />

              {/* Interactive Hover Pill inside the artwork */}
              <div className="absolute bottom-4 right-4 z-20">
                <div className="bg-[#1A0E0A]/85 backdrop-blur-md border border-[#FAF6F2]/20 px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider text-[#DED1BD] flex items-center gap-1.5 shadow-lg group-hover:border-[#B08401] transition-colors">
                  <RotateCcw className="w-3 h-3 text-[#B08401]" />
                  <span>{isCrumpled ? "Click to Unfold Image" : "Click to Crumple Paper"}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. BOTTOM CALL-TO-ACTION (Exact Dribbble Outline Pill Button)  */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-[#FAF6F2]/10 z-20">
          {/* Left Metadata */}
          <div className="text-center sm:text-left text-[11px] font-mono text-[#DED1BD]/70">
            <span className="text-[#B08401] font-bold">SECTION 4 COMPLIANT</span> · 0 HARD VIOLATIONS · 82 SOFT PENALTY
          </div>

          {/* Center Call to Action Pill Button (Yellow/Gold Outline matching Dribbble GET IN TOUCH) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-3 rounded-sm border-2 border-[#B08401] text-[#B08401] hover:bg-[#B08401] hover:text-[#1A0E0A] transition-all font-mono text-xs uppercase tracking-widest font-extrabold shadow-[0_0_25px_rgba(176,132,1,0.25)] flex items-center gap-2 group"
            >
              <span>ACCESS 4 ROLES PLATFORM</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => setIsCrumpled(!isCrumpled)}
              className="p-3 rounded-sm border border-[#FAF6F2]/20 hover:border-[#B08401] text-[#DED1BD] hover:text-[#B08401] transition-all font-mono text-xs"
              title="Toggle Paper Crumple Effect"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Right Status */}
          <div className="text-center sm:text-right text-[11px] font-mono text-[#DED1BD]/70 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WEEK 7 ACTIVE</span>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 4. SECTION 4 4-ROLE INSTITUTIONAL LOGIN PORTAL MODAL / DRAWER  */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-2xl bg-[#24130D] border border-[#B08401]/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#FAF6F2] relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#B08401]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 text-[#DED1BD]/70 hover:text-[#FAF6F2] p-1.5 rounded-lg border border-transparent hover:border-[#FAF6F2]/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="space-y-1 mb-6 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#B08401]/20 border border-[#B08401]/40 text-[#B08401] text-[10px] font-mono uppercase tracking-wider font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Section 4 Mandatory 4 Roles</span>
                </div>
                <h2 className="text-2xl font-black text-[#FAF6F2] tracking-tight">
                  Sign In as One of 4 Roles
                </h2>
                <p className="text-xs text-[#DED1BD]/80">
                  Select your institutional persona to test permissions and manage campus files.
                </p>
              </div>

              {/* The 4 Roles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                {primaryFourRoles.map((role) => {
                  const isSelected = selectedRole.id === role.id;
                  return (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between",
                        isSelected
                          ? "bg-[#3A1F16] border-[#B08401] ring-2 ring-[#B08401]/50 shadow-md"
                          : "bg-[#1E0F0A] border-[#FAF6F2]/10 hover:border-[#B08401]/40 hover:bg-[#2B170F]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-extrabold text-xs text-[#FAF6F2] tracking-tight">
                          {role.label}
                        </span>
                        <Badge
                          variant={isSelected ? "gold" : "outline"}
                          className="text-[9px] shrink-0 font-bold uppercase"
                        >
                          {role.badge}
                        </Badge>
                      </div>

                      <div className="text-[10px] text-[#DED1BD]/70 font-mono truncate mb-2">
                        {role.email}
                      </div>

                      <div className="text-[11px] text-[#D49E8D] line-clamp-2 leading-relaxed">
                        {role.whatTheyCanDo}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Zero Self-Approval Notice */}
              <div className="bg-[#1A0E0A] border border-[#B08401]/30 rounded-xl p-3 text-[11px] text-[#DED1BD]/90 mb-5 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B08401] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FAF6F2]">Section 4 Zero Self-Approval Mandate:</strong>{" "}
                  &ldquo;Nobody can approve their own request.&rdquo; If an approver tries to sign off on their own booking, the server rejects it with HTTP 403 Forbidden.
                </div>
              </div>

              {/* Active Credentials Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#DED1BD] block mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#DED1BD]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        className="pl-9 text-xs bg-[#1A0E0A] border-[#FAF6F2]/20 text-[#FAF6F2] focus:border-[#B08401]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#DED1BD] block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#DED1BD]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="pl-9 text-xs bg-[#1A0E0A] border-[#FAF6F2]/20 text-[#FAF6F2] focus:border-[#B08401]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200">
                    {error}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="submit"
                    variant="cit"
                    size="md"
                    className="w-full sm:flex-1 bg-[#B08401] hover:bg-[#8F6B01] text-[#1A0E0A] font-mono text-xs font-black tracking-wider uppercase py-2.5"
                    disabled={loading}
                  >
                    {loading ? (
                      "Authenticating..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>Sign In as {selectedRole.label}</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                  <a
                    href="/login"
                    className="text-xs font-mono text-[#DED1BD]/70 hover:text-[#FAF6F2] underline underline-offset-4"
                  >
                    Direct Login Page →
                  </a>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 5. AUTHENTICATING OVERLAY (Instant Seamless Routing)           */}
      {/* ============================================================== */}
      {isAuthenticating && (
        <div className="fixed inset-0 z-50 bg-[#1A0E0A]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#B08401]/20 border border-[#B08401] text-[#B08401] mx-auto flex items-center justify-center shadow-lg animate-bounce mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#FAF6F2]">Access Granted</h2>
          <p className="text-xs text-[#DED1BD] mt-1 font-mono">
            Entering workspace as <strong>{selectedRole.name}</strong> ({selectedRole.label})...
          </p>
        </div>
      )}
    </div>
  );
}
