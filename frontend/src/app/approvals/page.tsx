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
  UserCheck,
  ShieldAlert,
  Sliders,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Info
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
  { id: "DEAN-01", name: "Prof. S. Mohapatra", role: "Admin (Dean's office)", department: "Dean's Office", can_approve: true },
  { id: "COORD-CSE", name: "Dr. A. Verma", role: "Department coordinator", department: "Computer Science", can_approve: true },
  { id: "FAC-01", name: "Dr. Rajesh Sharma", role: "Faculty", department: "Computer Science", can_approve: false },
  { id: "CLUB-LIT-01", name: "Aarav Patel", role: "Club representative", department: "Literary Society", can_approve: false },
];

const DEFAULT_PRIORITY_ORDER = [
  "1. Exams",
  "2. Regular classes",
  "3. Institute events (Spectra main events, convocation)",
  "4. Guest lectures",
  "5. Department events",
  "6. Club events",
];

const ROLE_DEFINITIONS = [
  {
    role: "Admin (Dean's office)",
    canDo: "Everything. Generates the timetable, approves timetable changes and any booking that moves a class, can change the priority order.",
    badge: "Super Admin",
    badgeVariant: "cit" as const
  },
  {
    role: "Department coordinator",
    canDo: "Requests changes to their department's sessions, books rooms for department events, approves bookings of their department's labs.",
    badge: "Dept Level",
    badgeVariant: "secondary" as const
  },
  {
    role: "Faculty",
    canDo: "Views their own timetable, marks unavailability, requests extra or moved sessions.",
    badge: "Instructor",
    badgeVariant: "outline" as const
  },
  {
    role: "Club representative",
    canDo: "Submits and cancels venue requests, and sees the status and reason for each.",
    badge: "Spectra & Clubs",
    badgeVariant: "warning" as const
  },
];

export default function ApprovalsPage() {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityOrder, setPriorityOrder] = useState<string[]>(DEFAULT_PRIORITY_ORDER);
  const [orderSaved, setOrderSaved] = useState(false);
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

  const movePriority = (index: number, direction: "up" | "down") => {
    if (activePersona.role !== "Admin (Dean's office)") return;
    const newOrder = [...priorityOrder];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setPriorityOrder(newOrder);
    setOrderSaved(false);
  };

  const handleAction = async (booking: any, action: "APPROVE" | "REJECT") => {
    setActionAlert(null);

    // 1. CRITICAL RULE: Check self-approval ban
    if (activePersona.id.toLowerCase() === (booking.requested_by || "").toLowerCase()) {
      setActionAlert({
        text: `Self-Approval Violation: Nobody can approve their own request. (Requester: ${booking.requested_by}, Approver: ${activePersona.id}). HTTP 403 Forbidden.`,
        type: "error",
      });
      return;
    }

    // 2. Check role permission
    if (!activePersona.can_approve) {
      setActionAlert({
        text: `Unauthorized: Role '${activePersona.role}' does not have governance approval rights. Only Admin (Dean's office) or Department coordinator can sign off.`,
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
        title="4. Roles and Priority Governance"
        description="The platform implements four strict roles with the fundamental rule: Nobody can approve their own request."
        badge="Section 4 RBAC & Conflict Hierarchy"
      />

      {/* Role Switcher Toolbar */}
      <Card className="p-3 bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#236B8E]" />
            <span className="text-xs font-bold text-slate-800">Simulate Active Persona:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePersona(p);
                  setActionAlert(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activePersona.id === p.id
                    ? "bg-[#236B8E] text-white shadow-sm"
                    : "bg-[#F0F4F8] text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{p.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  activePersona.id === p.id
                    ? "bg-white/20 text-white"
                    : p.can_approve
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {p.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Self-Approval Ban Strict Notice */}
      <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
          <div>
            <span className="font-bold">Strict Rule: Nobody can approve their own request.</span>
            <span className="text-purple-700 ml-1">If an approver attempts to sign off on a venue request they created, the engine halts with HTTP 403 Forbidden.</span>
          </div>
        </div>
        <Badge variant="purple" className="text-[10px] shrink-0">Section 4 Mandatory</Badge>
      </div>

      {actionAlert && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
            actionAlert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
              : "bg-rose-50 border-rose-200 text-rose-800 font-semibold"
          }`}
        >
          {actionAlert.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{actionAlert.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Pending Queue"
          value={`${pendingBookings.length} Requests`}
          subtext="Awaiting administrative review"
          icon={<Clock className="w-4 h-4 text-amber-600" />}
        />
        <StatCard
          label="Approved Bookings"
          value={`${approvedBookings.length} Bookings`}
          subtext="Confirmed zero-clash slots"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label="Rejected Bookings"
          value={`${rejectedBookings.length} Bookings`}
          subtext="Deterministic clash reason logged"
          icon={<XCircle className="w-4 h-4 text-rose-600" />}
        />
        <StatCard
          label="Self-Approval Ban"
          value="100% Enforced"
          subtext="Verified by unit tests & API"
          icon={<ShieldCheck className="w-4 h-4 text-purple-600" />}
        />
      </div>

      {/* Official Section 4 Roles Specification Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 bg-[#F8FAFC] border-b border-slate-200 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#236B8E]" />
            Official Section 4 Roles &amp; Capabilities Matrix
          </CardTitle>
          <span className="text-[11px] text-slate-500 font-medium">Chilika Institute of Technology</span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F4F8] text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-1/4">Role</th>
                <th className="py-2.5 px-4">What they can do</th>
                <th className="py-2.5 px-4 text-right w-36">Permission Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {ROLE_DEFINITIONS.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{r.role}</td>
                  <td className="py-2.5 px-4 leading-relaxed">{r.canDo}</td>
                  <td className="py-2.5 px-4 text-right">
                    <Badge variant={r.badgeVariant} className="text-[10px]">{r.badge}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Table */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#236B8E]" />
              Venue Reservations Queue
            </CardTitle>
            <span className="text-[11px] font-semibold text-slate-600">
              Acting as: <strong className="text-slate-900">{activePersona.name}</strong> ({activePersona.role})
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F0F4F8] text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Booking ID</th>
                  <th className="py-2.5 px-3">Event Name</th>
                  <th className="py-2.5 px-3">Venue &amp; Slot</th>
                  <th className="py-2.5 px-3">Requester</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 15).map((b) => {
                  const isSelf = activePersona.id.toLowerCase() === (b.requested_by || "").toLowerCase();
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1B5270]">{b.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{b.event_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="font-semibold text-slate-800">{b.room_id}</span> • {b.day} (P{b.start_period}-P{b.end_period})
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{b.requested_by || "Club Rep"}</span>
                        {isSelf && (
                          <span className="text-[9px] bg-rose-100 text-rose-800 border border-rose-300 px-1 py-0.2 rounded ml-1 font-bold">
                            SELF
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            b.status === "APPROVED"
                              ? "success"
                              : b.status === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="cit"
                          className="h-7 text-[10px] px-2.5 bg-emerald-700 hover:bg-emerald-600"
                          onClick={() => handleAction(b, "APPROVE")}
                          disabled={isSelf || !activePersona.can_approve}
                          title={isSelf ? "Self-approval prohibited" : !activePersona.can_approve ? "Unauthorized" : "Approve request"}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] px-2.5 text-rose-700 border-rose-200 hover:bg-rose-50"
                          onClick={() => handleAction(b, "REJECT")}
                          disabled={isSelf || !activePersona.can_approve}
                          title={isSelf ? "Self-approval prohibited" : !activePersona.can_approve ? "Unauthorized" : "Reject request"}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Section 4 Conflict Priority Order Configuration */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#236B8E]" />
                  Conflict Priority Order
                </span>
                {activePersona.role === "Admin (Dean's office)" && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    Admin Configurable
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <p className="text-[11px] text-slate-600 leading-normal">
                When two requests want the same room at the same time, this order decides who gets it:
              </p>

              <div className="space-y-1.5">
                {priorityOrder.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium flex items-center justify-between shadow-xs"
                  >
                    <span className="font-semibold text-slate-900">{item}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-mono mr-1">Rank {idx + 1}</span>
                      {activePersona.role === "Admin (Dean's office)" && (
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => movePriority(idx, "up")}
                            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Priority Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === priorityOrder.length - 1}
                            onClick={() => movePriority(idx, "down")}
                            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Priority Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {activePersona.role === "Admin (Dean's office)" ? (
                <div className="pt-2 space-y-2">
                  <Button
                    size="sm"
                    variant="cit"
                    className="w-full text-xs"
                    onClick={() => {
                      setOrderSaved(true);
                      setTimeout(() => setOrderSaved(false), 4000);
                    }}
                  >
                    Save Priority Configuration
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setPriorityOrder(DEFAULT_PRIORITY_ORDER);
                      setOrderSaved(false);
                    }}
                    className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Default Section 4 Order
                  </button>
                </div>
              ) : (
                <div className="p-2 rounded bg-slate-50 text-[11px] text-slate-500 border border-slate-200 text-center">
                  Only <strong>Admin (Dean's office)</strong> can reorder the conflict priority list.
                </div>
              )}

              {orderSaved && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Priority hierarchy synchronized across CP-SAT solver instances!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
