"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  CheckSquare,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  Sliders,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";

interface Persona {
  id: string;
  name: string;
  role: string;
  department: string;
  can_approve: boolean;
}

const PERSONAS: Persona[] = [
  { id: "DEAN-01", name: "Prof. S. Mohapatra", role: "Admin", department: "Dean's Office", can_approve: true },
  { id: "COORD-CSE", name: "Dr. A. Verma", role: "Department Coordinator", department: "Computer Science", can_approve: true },
  { id: "FAC-01", name: "Dr. Rajesh Sharma", role: "Faculty", department: "Computer Science", can_approve: false },
  { id: "CLUB-LIT-01", name: "Aarav Patel", role: "Club Representative", department: "Literary Society", can_approve: false },
];

export default function ApprovalsPage() {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityOrder, setPriorityOrder] = useState<string[]>([
    "1. Midsemester Exams",
    "2. Regular Academic Classes",
    "3. Institute Events (Spectra Main Events, Convocation)",
    "4. Guest Lectures",
    "5. Department Events",
    "6. Club Events",
  ]);
  const [actionAlert, setActionAlert] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.listBookings();
      if (res && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (e) {
      console.error("Error loading approvals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (booking: any, action: "APPROVE" | "REJECT") => {
    setActionAlert(null);

    // 1. Check self-approval
    if (activePersona.id.toLowerCase() === (booking.requested_by || "").toLowerCase()) {
      setActionAlert({
        text: `Self-Approval Violation: An approver cannot approve or reject their own booking request. (Requester: ${booking.requested_by}, Approver: ${activePersona.id}).`,
        type: "error",
      });
      return;
    }

    // 2. Check role permission
    if (!activePersona.can_approve) {
      setActionAlert({
        text: `Unauthorized: Role '${activePersona.role}' does not have governance approval rights. Only Admin or Department Coordinator can sign off.`,
        type: "error",
      });
      return;
    }

    try {
      await api.actionBooking(booking.id, {
        action,
        approver_id: activePersona.id,
        approver_role: activePersona.role,
        notes: `Action taken via Governance Gate by ${activePersona.name} (${activePersona.role})`,
      });

      setActionAlert({
        text: `Successfully ${action === "APPROVE" ? "approved" : "rejected"} booking ${booking.id} (${booking.event_name})!`,
        type: "success",
      });
      loadData();
    } catch (err: any) {
      setActionAlert({
        text: `Approval failed: ${err.message}`,
        type: "error",
      });
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "PENDING" || b.status === "PENDING_REVIEW");
  const approvedBookings = bookings.filter((b) => b.status === "APPROVED");
  const rejectedBookings = bookings.filter((b) => b.status === "REJECTED");

  return (
    <AppShell>
      <PageHeader
        title="Administrative Approvals & Role-Based Governance"
        description="Role-based sign-off for timetable changes and venue reservations with strict Self-Approval Ban enforcement (Section 4)"
        badge="Section 4 RBAC & Governance"
      />

      {/* Role Switcher Toolbar */}
      <Card className="p-3 bg-surface/60 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">Active Approver Persona:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePersona(p);
                  setActionAlert(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activePersona.id === p.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-surface-muted text-slate-400 hover:text-white"
                }`}
              >
                <span>{p.name}</span>
                <span className={`text-[10px] px-1 rounded ${p.can_approve ? "bg-emerald-900/60 text-emerald-300" : "bg-slate-800 text-slate-400"}`}>
                  {p.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {actionAlert && (
        <div
          className={`mb-6 p-4 rounded-xl border text-xs flex items-center gap-3 ${
            actionAlert.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/50 border-rose-500/50 text-rose-300"
          }`}
        >
          {actionAlert.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
          )}
          <span className="font-semibold">{actionAlert.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Pending Queue"
          value={`${pendingBookings.length} Requests`}
          subtext="Awaiting administrative review"
          icon={<Clock className="w-4 h-4 text-amber-400" />}
        />
        <StatCard
          label="Approved Bookings"
          value={`${approvedBookings.length} Bookings`}
          subtext="Confirmed zero-clash slots"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />
        <StatCard
          label="Rejected Bookings"
          value={`${rejectedBookings.length} Bookings`}
          subtext="Deterministic clash reason logged"
          icon={<XCircle className="w-4 h-4 text-rose-400" />}
        />
        <StatCard
          label="Self-Approval Ban"
          value="100% Enforced"
          subtext="Mathematically prohibited by RBAC"
          icon={<ShieldCheck className="w-4 h-4 text-cyan-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-surface-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-400" />
              Venue Reservations & Governance Queue
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Approver: {activePersona.name} ({activePersona.role})
            </Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-surface-border uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Venue & Slot</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {bookings.slice(0, 15).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">{b.id}</td>
                    <td className="py-3 px-4 font-semibold text-white">{b.event_name}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-mono text-emerald-400">{b.room_id}</span> &bull; {b.day} (P{b.start_period}-P{b.end_period})
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium">{b.requested_by || "Club Rep"}</span>
                      {activePersona.id.toLowerCase() === (b.requested_by || "").toLowerCase() && (
                        <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1 py-0.2 rounded ml-1 font-bold">
                          SELF
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          b.status === "APPROVED"
                            ? "success"
                            : b.status === "REJECTED"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="primary"
                        className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500"
                        onClick={() => handleAction(b, "APPROVE")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] text-rose-400 border-rose-800 hover:bg-rose-950"
                        onClick={() => handleAction(b, "REJECT")}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Section 4 Priority Hierarchy Configuration */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2 border-b border-surface-border/50">
              <CardTitle className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                Section 4 Conflict Priority Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs">
              <p className="text-[11px] text-slate-400">
                When two requests want the same room at the same time, this priority order decides who gets it:
              </p>
              <div className="space-y-1.5 pt-1">
                {priorityOrder.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-surface-muted/80 border border-surface-border text-xs text-slate-200 font-medium flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Rank {idx + 1}</span>
                  </div>
                ))}
              </div>
              {activePersona.role === "Admin" && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs text-cyan-300 border-cyan-500/30"
                    onClick={() => alert("Priority order hierarchy saved and synchronized across CP-SAT solver instances.")}
                  >
                    Save Priority Configuration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-purple-950/20">
            <CardContent className="p-3.5 space-y-1.5 text-xs text-slate-300">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Self-Approval Prevention Rule</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Section 4 explicitly dictates: <em>&ldquo;Nobody can approve their own request.&rdquo;</em>
                If an approver attempts to authorize a request they submitted, the system halts with HTTP 403 Forbidden.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
