"""
CampusOS AI - Venue Bookings & RBAC Approval Engine
Enforces:
- 4 explicit RBAC roles (Admin/Dean's Office, Coordinator, Faculty, Club Rep)
- Strict Self-Approval Ban: An approver cannot approve their own booking request
- Deterministic conflict check on manual/AI submissions
"""

import os
import json
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.core.config import settings
from backend.app.ai.agent import CampusAIAgent


router = APIRouter(prefix="/bookings", tags=["Venue Bookings & Approvals"])

DATASET_PATH = os.path.join(settings.PROJECT_ROOT, "data", "official", "cit_public.json")
EXPORTS_DIR = os.path.join(settings.PROJECT_ROOT, "exports")
SCHEDULE_PATH = os.path.join(EXPORTS_DIR, "schedule.json")
DYNAMIC_BOOKINGS_PATH = os.path.join(EXPORTS_DIR, "dynamic_bookings.json")


class BookingActionRequest(BaseModel):
    action: str = Field(..., description="'APPROVE' or 'REJECT'")
    approver_id: str = Field(..., description="User ID of the approver")
    approver_role: str = Field(..., description="Role of the approver (Admin, Department Coordinator, Faculty, Club Representative)")
    notes: Optional[str] = None


class CreateBookingRequest(BaseModel):
    event_name: str
    room_id: str
    day: str
    start_period: int
    end_period: int
    attendees: int
    requested_by: str
    requester_role: str = "Club Representative"
    priority_tier: int = 6


def _load_dynamic_bookings() -> List[Dict[str, Any]]:
    if os.path.exists(DYNAMIC_BOOKINGS_PATH):
        try:
            with open(DYNAMIC_BOOKINGS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []


def _save_dynamic_bookings(bookings: List[Dict[str, Any]]):
    os.makedirs(EXPORTS_DIR, exist_ok=True)
    with open(DYNAMIC_BOOKINGS_PATH, "w", encoding="utf-8") as f:
        json.dump(bookings, f, indent=2)


@router.get("/")
def list_all_bookings() -> Dict[str, Any]:
    """Returns combined list of Spectra official bookings and dynamically submitted bookings."""
    data = CampusAIAgent.load_dataset()
    sched = CampusAIAgent.load_schedule()
    dynamic = _load_dynamic_bookings()

    decisions = {d.get("booking_id"): d for d in sched.get("booking_decisions", [])}

    results = []
    # 1. Official Spectra Bookings
    for b in data.get("spectra_bookings", []):
        bid = b.get("booking_id") or b.get("id")
        dec = decisions.get(bid, {})
        results.append({
            "id": bid,
            "event_name": b.get("title") or b.get("event_name"),
            "room_id": b.get("preferred_room") or b.get("room_id"),
            "day": b.get("day"),
            "start_period": b.get("start_period"),
            "end_period": b.get("end_period"),
            "requested_by": b.get("requested_by"),
            "priority_tier": b.get("priority_tier"),
            "status": dec.get("status", b.get("status", "PENDING")).upper(),
            "score": dec.get("score", 0),
            "conflict_reason": dec.get("conflict_reason"),
            "is_official": True
        })

    # 2. Dynamic submissions
    for b in dynamic:
        results.append(b)

    return {
        "total_count": len(results),
        "approved_count": sum(1 for r in results if r["status"] == "APPROVED"),
        "rejected_count": sum(1 for r in results if r["status"] == "REJECTED"),
        "bookings": results
    }


@router.post("/")
def create_booking(req: CreateBookingRequest) -> Dict[str, Any]:
    """Submits a new venue booking request via manual form or AI assistant."""
    sched = CampusAIAgent.load_schedule()
    data = CampusAIAgent.load_dataset()

    # Room capacity check
    room = next((r for r in data.get("rooms", []) if (r.get("room_id") or r.get("id")) == req.room_id), None)
    if not room:
        raise HTTPException(status_code=400, detail=f"Room {req.room_id} does not exist")
    if req.attendees > room["capacity"]:
        raise HTTPException(status_code=400, detail=f"Capacity exceeded: {req.room_id} has {room['capacity']} seats, requested {req.attendees}")

    # Conflict check with timetable
    conflict = None
    for entry in sched.get("timetable", []):
        if entry.get("day") == req.day and entry.get("room_id") == req.room_id:
            s = entry.get("start_period", 1)
            ses_def = next((x for x in data.get("sessions", []) if (x.get("session_id") or x.get("id")) == entry.get("session_id")), None)
            dur = ses_def.get("duration", 1) if ses_def else 1
            if any(p in range(s, s + dur) for p in range(req.start_period, req.end_period + 1)):
                conflict = f"Occupied by academic session {entry.get('session_id')}"
                break

    dynamic = _load_dynamic_bookings()
    new_id = f"BOOK-NEW-{len(dynamic) + 1:03d}"

    booking_record = {
        "id": new_id,
        "event_name": req.event_name,
        "room_id": req.room_id,
        "day": req.day,
        "start_period": req.start_period,
        "end_period": req.end_period,
        "requested_by": req.requested_by,
        "requester_role": req.requester_role,
        "priority_tier": req.priority_tier,
        "attendees": req.attendees,
        "status": "APPROVED" if not conflict else "PENDING_REVIEW",
        "score": 0 if conflict else 5,
        "conflict_reason": conflict,
        "is_official": False
    }

    dynamic.append(booking_record)
    _save_dynamic_bookings(dynamic)

    return {
        "status": "success",
        "booking_id": new_id,
        "booking": booking_record
    }


@router.post("/{booking_id}/action")
def perform_booking_action(booking_id: str, act: BookingActionRequest) -> Dict[str, Any]:
    """
    Approves or rejects a booking request with strict RBAC and Self-Approval Ban.
    """
    # 1. RBAC Check: Only Admin or Department Coordinator can approve/reject
    allowed_roles = ["Admin", "Dean's Office", "Department Coordinator"]
    if act.approver_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"RBAC Authorization Failure: Role '{act.approver_role}' cannot approve or reject bookings. Required role: Admin, Dean's Office, or Department Coordinator."
        )

    # 2. Find booking
    data = CampusAIAgent.load_dataset()
    dynamic = _load_dynamic_bookings()

    target = None
    target_is_dynamic = False

    for b in dynamic:
        if (b.get("booking_id") or b.get("id")) == booking_id:
            target = b
            target_is_dynamic = True
            break

    if not target:
        for b in data.get("spectra_bookings", []):
            if (b.get("booking_id") or b.get("id")) == booking_id:
                target = b
                break

    if not target:
        raise HTTPException(status_code=404, detail=f"Booking {booking_id} not found")

    requester_id = target.get("requested_by", "")

    # 3. CRITICAL RULE: Strict Self-Approval Ban
    if act.approver_id and requester_id and act.approver_id.strip().lower() == requester_id.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Self-approval violation: An approver cannot approve or reject their own booking request. (Requester: '{requester_id}', Approver: '{act.approver_id}')."
        )

    # 4. Apply action
    new_status = "APPROVED" if act.action.upper() == "APPROVE" else "REJECTED"

    if target_is_dynamic:
        target["status"] = new_status
        target["reviewed_by"] = act.approver_id
        target["review_role"] = act.approver_role
        target["review_notes"] = act.notes
        _save_dynamic_bookings(dynamic)
    else:
        sched = CampusAIAgent.load_schedule()
        for d in sched.get("booking_decisions", []):
            if d.get("booking_id") == booking_id:
                d["status"] = new_status
                d["reviewed_by"] = act.approver_id
                d["review_role"] = act.approver_role
                break
        with open(SCHEDULE_PATH, "w", encoding="utf-8") as f:
            json.dump(sched, f, indent=2)

    return {
        "status": "success",
        "booking_id": booking_id,
        "action_taken": new_status,
        "approver": act.approver_id,
        "role": act.approver_role,
        "notes": act.notes
    }
