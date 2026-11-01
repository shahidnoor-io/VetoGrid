"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth, DEMO_ROLES, Persona } from "@/lib/auth";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, refresh } = useAuth();

  // Primary 4 roles from Section 4
  const primaryFourRoles = DEMO_ROLES.slice(0, 4);

  const [selectedRole, setSelectedRole] = useState<string>(primaryFourRoles[0].id);
  const [email, setEmail] = useState<string>(primaryFourRoles[0].email);
  const [password, setPassword] = useState<string>(primaryFourRoles[0].password || "Dean@2026");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showMoreRoles, setShowMoreRoles] = useState<boolean>(false);

  const handleSelectRole = (role: Persona) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword(role.password || "Coord@2026");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
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

      const nextUrl = searchParams.get("next") || data.redirectTo || "/dashboard";
      router.push(nextUrl);
    } catch (err: any) {
      // Fallback local auth if backend fetch fails
      await login(email, password);
      const nextUrl = searchParams.get("next") || "/dashboard";
      router.push(nextUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F2] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans selection:bg-[#B08401]/20">
      {/* Ambient background glow in VetoGrid palette */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B08401]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#D49E8D]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-400">
        {/* Brand Header with VetoGrid Origami Eagle Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-[#DED1BD] p-1.5 shadow-xs mb-1 overflow-hidden">
            <Image
              src="/logo.png"
              alt="VetoGrid Logo"
              width={56}
              height={56}
              unoptimized
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-[#683B2B] tracking-tight">
            VetoGrid
          </h1>
          <p className="text-xs text-[#8B5E4B]">
            Intelligent Campus Scheduling Platform · Chitkara Institute of Technology
          </p>
        </div>

        {/* Card Component with 4 Roles & Institutional Authentication */}
        <Card className="border-[#DED1BD] shadow-xl bg-white/95 backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-[#FAF6F2]">
            <CardTitle className="text-base text-[#683B2B] font-bold">
              Sign In to Campus Portal
            </CardTitle>
            <CardDescription className="text-xs text-[#8B5E4B]">
              Choose one of the 4 Section 4 roles or enter institutional credentials
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              {/* 4 Primary Roles Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#683B2B]">
                    4 Institutional Roles (Click to Select)
                  </label>
                  <span className="text-[10px] text-[#B08401] font-semibold">Section 4 RBAC</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {primaryFourRoles.map((role) => (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg text-xs font-medium border text-left transition-all",
                        selectedRole === role.id
                          ? "bg-[#FAF3F1] border-[#B08401] text-[#683B2B] ring-1 ring-[#B08401] shadow-2xs font-semibold"
                          : "bg-[#FAF6F2] border-[#DED1BD] text-[#8B5E4B] hover:bg-[#F3EFE7] hover:text-[#683B2B]"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-[#683B2B]">{role.label}</span>
                        <span className="text-[10px] text-[#8B5E4B] ml-2 font-mono truncate">
                          {role.email}
                        </span>
                      </div>
                      <Badge variant={selectedRole === role.id ? "gold" : "outline"} className="text-[10px] shrink-0 font-bold">
                        {role.badge}
                      </Badge>
                    </button>
                  ))}
                </div>

                {/* Optional toggle for other test personas */}
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowMoreRoles(!showMoreRoles)}
                    className="text-[11px] text-[#8B5E4B] hover:text-[#683B2B] inline-flex items-center gap-1 font-medium underline underline-offset-2"
                  >
                    <span>{showMoreRoles ? "Hide additional personas" : "Show more demo personas"}</span>
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showMoreRoles && "rotate-180")} />
                  </button>
                </div>

                {showMoreRoles && (
                  <div className="grid grid-cols-1 gap-1 mt-2 max-h-36 overflow-y-auto pr-1">
                    {DEMO_ROLES.slice(4).map((role) => (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => handleSelectRole(role)}
                        className={cn(
                          "flex items-center justify-between p-1.5 rounded-lg text-xs font-medium border text-left transition-all",
                          selectedRole === role.id
                            ? "bg-[#FAF3F1] border-[#B08401] text-[#683B2B] ring-1 ring-[#B08401]"
                            : "bg-[#FAF6F2] border-[#DED1BD] text-[#8B5E4B] hover:bg-[#F3EFE7]"
                        )}
                      >
                        <span className="font-medium text-[#683B2B] truncate">{role.label}</span>
                        <span className="text-[10px] text-[#8B5E4B] font-mono">{role.email}</span>
                      </button>
                    ))}
                  </div>
                )}
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
                    placeholder="user@cit.edu.in"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-[#683B2B] block mb-1.5">
                  Password
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

              {/* Error Message */}
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
                    <span>Access Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer info matching routinetable.vercel.app */}
        <div className="text-center text-[11px] text-[#8B5E4B] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B08401]" />
          <span>Role-Based Access Control • HMAC-SHA256 Session Tokens</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6F2] flex items-center justify-center text-[#683B2B] text-xs font-semibold">
          Loading portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
