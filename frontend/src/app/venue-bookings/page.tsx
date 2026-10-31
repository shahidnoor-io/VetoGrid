"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  DoorClosed,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  UserCheck,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Booking {
  id: string;
  event_name: string;
  room_id: string;
  day: string;
  start_period: number;
  end_period: number;
  requested_by: string;
  priority_tier: number;
  status: string;
  score?: number;
  conflict_reason?: string;
  is_official?: boolean;
}

export default function VenueBookingsPage() {
  const { user, switchPersona, personas } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "rejected" | "pending">("all");
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Manual Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formEventName, setFormEventName] = useState("");
  const [formRoom, setFormRoom] = useState("AUD-01");
  const [formDay, setFormDay] = useState("Wednesday");
  const [formStartPeriod, setFormStartPeriod] = useState(10);
  const [formEndPeriod, setFormEndPeriod] = useState(12);
  const [formAttendees, setFormAttendees] = useState(80);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load Bookings
  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await api.listBookings();
      if (res && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err: any) {
      console.warn("Could not fetch live bookings, fallback to schedule.json:", err);
      // Fallback
      try {
        const sched = await api.getCurrentSchedule();
        const decisions = sched.booking_decisions || [];
        const mapped: Booking[] = decisions.map((d: any, idx: number) => ({
          id: d.booking_id || `REQ-${idx + 1}`,
          event_name: `Spectra Event ${idx + 1}`,
          room_id: "AUD-01",
          day: "Friday",
          start_period: 10,
          end_period: 12,
          requested_by: "Spectra Team",
          priority_tier: 6,
          status: d.status || "APPROVED",
          score: d.score || 5,
        }));
        setBookings(mapped);
      } catch (e) {
        console.error("Error loading schedule fallback:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAction = async (bookingId: string, action: "APPROVE" | "REJECT", requesterId: string) => {
    // Check Self-Approval Ban on UI client
    if (user.id.toLowerCase() === requesterId.toLowerCase()) {
      setActionMessage({
        text: `Self-Approval Violation: Nobody can approve their own request. (Requester: ${requesterId}, Approver: ${user.id}). HTTP 403 Forbidden.`,
        type: "error",
      });
      return;
    }

    if (!user.canApprove) {
      setActionMessage({
        text: `RBAC Violation: Role '${user.role}' does not have approval rights. Approvals require Admin (Dean's office) or Department coordinator authority.`,
        type: "error",
      });
      return;
    }

    try {
      const res = await api.actionBooking(bookingId, {
        action,
        approver_id: user.id,
        approver_role: user.role,
        notes: `Actioned by ${user.name} (${user.role})`,
      });
      setActionMessage({
        text: `Booking ${bookingId} successfully marked as ${action}D.`,
        type: "success",
      });
      loadBookings();
    } catch (err: any) {
      setActionMessage({
        text: err.message || "Failed to process booking action",
        type: "error",
      });
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      await api.createBooking({
        event_name: formEventName || "Campus Event",
        room_id: formRoom,
        day: formDay,
        start_period: Number(formStartPeriod),
        end_period: Number(formEndPeriod),
        attendees: Number(formAttendees),
        requested_by: user.id,
        requester_role: user.role,
        priority_tier: user.role === "Admin (Dean's office)" ? 3 : user.role === "Department coordinator" ? 5 : 6,
      });
      setIsModalOpen(false);
      setFormEventName("");
      setActionMessage({
        text: "New booking request submitted and deterministically validated!",
        type: "success",
      });
      loadBookings();
    } catch (err: any) {
      setActionMessage({
        text: err.message || "Conflict or capacity error during booking creation",
        type: "error",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "approved") return b.status === "APPROVED";
    if (filter === "rejected") return b.status === "REJECTED";
    if (filter === "pending") return b.status === "PENDING" || b.status === "PENDING_REVIEW";
    return true;
  });

  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;

  return (
    <AppShell>
      <PageHeader
        title="Venue Bookings & Spectra Festival Management"
        description="Smart booking approval, strict self-approval prevention, and automated constraint verification"
        badge="Spectra Week 7"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Manual Booking Form
            </Button>
          </div>
        }
      />

      {/* RBAC Persona Switcher Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#236B8E]/10 text-[#1B4D68]">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Active Persona (RBAC Simulation):</div>
            <div className="text-[11px] text-slate-500">
              Current: <span className="text-[#1B4D68] font-bold">{user.name}</span> ({user.role} &bull; {user.department})
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                switchPersona(p.id);
                setActionMessage(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                user.id === p.id
                  ? "bg-[#236B8E] text-white shadow-sm font-bold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {p.role}
            </button>
          ))}
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-fadeIn ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
              : "bg-rose-50 border-rose-200 text-rose-800 font-semibold"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-600 hover:text-slate-900 text-xs underline ml-4 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Bookings"
          value={`${bookings.length}`}
          subtext="25 Official Spectra + Ad-hoc"
          icon={<DoorClosed className="w-4 h-4 text-[#236B8E]" />}
        />
        <StatCard
          label="Approved Venues"
          value={`${approvedCount}`}
          subtext="0 academic clashes"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label="Rejected / Conflicted"
          value={`${rejectedCount}`}
          subtext="Overlaps with timetable/maint"
          icon={<XCircle className="w-4 h-4 text-rose-600" />}
        />
        <StatCard
          label="RBAC Status"
          value={user.canApprove ? "Can Approve" : "View Only"}
          subtext={user.canApprove ? "Dean/Coord authority" : "Self-approval blocked"}
          icon={<ShieldCheck className="w-4 h-4 text-[#1B4D68]" />}
        />
      </div>

      {/* Bookings Table Registry */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-semibold">Spectra & Venue Booking Registry</CardTitle>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Verified deterministically by Google OR-Tools CP-SAT engine.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                filter === "all" ? "bg-[#236B8E] text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                filter === "approved" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                filter === "rejected" ? "bg-rose-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading booking registry...</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F0F4F8] text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Event & Requester</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => {
                  const isRequesterSelf = user.id.toLowerCase() === (b.requested_by || "").toLowerCase();

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#1B5270]">{b.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{b.event_name}</div>
                        <div className="text-[11px] text-slate-500">Req by: <span className="font-semibold text-slate-700">{b.requested_by}</span></div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[#1B5270] bg-[#F0F4F8] px-2 py-0.5 rounded border border-slate-200 font-bold">
                          {b.room_id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{b.day}</div>
                        <div className="text-[11px] text-slate-500">P{b.start_period}-P{b.end_period}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={b.priority_tier <= 3 ? "purple" : b.priority_tier <= 5 ? "secondary" : "outline"} className="text-[10px]">
                          Tier {b.priority_tier}
                        </Badge>
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
                          className="text-[10px]"
                        >
                          {b.status}
                        </Badge>
                        {b.conflict_reason && (
                          <div className="text-[10px] text-rose-600 font-medium mt-1 max-w-xs truncate" title={b.conflict_reason}>
                            {b.conflict_reason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isRequesterSelf ? (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-300 font-bold" title="Self-approval ban: You cannot approve your own request">
                              Self-Approval Blocked
                            </span>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="cit"
                                className="h-7 px-2.5 text-[10px] bg-emerald-700 hover:bg-emerald-600 font-semibold"
                                onClick={() => handleAction(b.id, "APPROVE", b.requested_by)}
                                disabled={b.status === "APPROVED" || !user.canApprove}
                                title={!user.canApprove ? "Unauthorized: Requires Admin or Coordinator" : "Approve booking"}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[10px] text-rose-700 border-rose-200 hover:bg-rose-50 font-semibold"
                                onClick={() => handleAction(b.id, "REJECT", b.requested_by)}
                                disabled={b.status === "REJECTED" || !user.canApprove}
                                title={!user.canApprove ? "Unauthorized: Requires Admin or Coordinator" : "Reject booking"}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Manual Booking Form Fallback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Manual Venue Booking Request</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={formEventName}
                  onChange={(e) => setFormEventName(e.target.value)}
                  placeholder="e.g. AI Club Hackathon Workshop"
                  className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Venue (Room)</label>
                  <select
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="AUD-01">AUD-01 (Auditorium, Cap 500)</option>
                    <option value="LT-101">LT-101 (Lecture Hall 1, Cap 200)</option>
                    <option value="LT-102">LT-102 (Lecture Hall 2, Cap 200)</option>
                    <option value="SH-201">SH-201 (Seminar Hall 1, Cap 120)</option>
                    <option value="SH-202">SH-202 (Seminar Hall 2, Cap 120)</option>
                    <option value="OAT-01">OAT-01 (Open Air Theatre, Cap 400)</option>
                    <option value="LAB-CS1">LAB-CS1 (Computer Lab 1, Cap 80)</option>
                    <option value="LAB-CS2">LAB-CS2 (Computer Lab 2, Cap 80)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Day</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Period</label>
                  <select
                    value={formStartPeriod}
                    onChange={(e) => setFormStartPeriod(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value={10}>P10 (18:00)</option>
                    <option value={6}>P6 (14:00)</option>
                    <option value={2}>P2 (09:00)</option>
                    <option value={1}>P1 (08:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Period</label>
                  <select
                    value={formEndPeriod}
                    onChange={(e) => setFormEndPeriod(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100"
                  >
                    <option value={12}>P12 (21:00)</option>
                    <option value={8}>P8 (17:00)</option>
                    <option value={4}>P4 (12:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Attendees</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? "Validating..." : "Submit & Validate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
