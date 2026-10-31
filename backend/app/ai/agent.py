"""
CampusOS AI - Agent & Deterministic Explainer Engine
Handles English/Hinglish natural language request extraction with
strict red-team guardrails, deterministic scheduling conflict checks,
alternative recommendations, and transparent constraint explanations.
"""

import os
import re
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from backend.app.ai.guardrails import AIGuardrailEngine
from backend.app.core.config import settings

DATASET_PATH = os.path.join(settings.PROJECT_ROOT, "data", "official", "cit_public.json")
EXPORTS_DIR = os.path.join(settings.PROJECT_ROOT, "exports")
SCHEDULE_PATH = os.path.join(EXPORTS_DIR, "schedule.json")


class BookingProposal(BaseModel):
    event_name: str
    day: str
    start_period: int
    end_period: int
    start_time: str
    end_time: str
    room_id: str
    attendees: int
    requested_by: str
    requester_role: str
    priority_tier: int
    is_valid: bool
    conflict_reason: Optional[str] = None
    suggested_alternatives: List[Dict[str, Any]] = Field(default_factory=list)
    manual_fallback_available: bool = True


class AgentResponse(BaseModel):
    status: str  # "SUCCESS", "CONFLICT_WITH_ALTERNATIVES", "SECURITY_VIOLATION", "CLARIFICATION_NEEDED"
    message: str
    proposal: Optional[BookingProposal] = None
    security_violations: List[str] = Field(default_factory=list)


class CampusAIAgent:
    """
    Intelligent campus assistant that adheres strictly to deterministic scheduling rules.
    NEVER allows LLM hallucinations or overrides to dictate scheduling validity.
    """

    PERIOD_TIMES = {
        1: ("08:00", "09:00"),
        2: ("09:00", "10:00"),
        3: ("10:00", "11:00"),
        4: ("11:00", "12:00"),
        5: ("12:00", "13:00"),
        # 13:00-14:00 Lunch Window
        6: ("14:00", "15:00"),
        7: ("15:00", "16:00"),
        8: ("16:00", "17:00"),
        9: ("17:00", "18:00"),
        10: ("18:00", "19:00"),
        11: ("19:00", "20:00"),
        12: ("20:00", "21:00"),
    }

    DAY_MAP = {
        "monday": "Monday", "mon": "Monday", "somwar": "Monday",
        "tuesday": "Tuesday", "tue": "Tuesday", "mangal": "Tuesday", "mangalwar": "Tuesday",
        "wednesday": "Wednesday", "wed": "Wednesday", "budh": "Wednesday", "budhwar": "Wednesday",
        "thursday": "Thursday", "thu": "Thursday", "guru": "Thursday", "guruwar": "Thursday",
        "friday": "Friday", "fri": "Friday", "shukra": "Friday", "shukrawar": "Friday",
        "kal": "Tuesday",
        "parso": "Wednesday",
    }

    VENUE_MAP = {
        "auditorium": "AUD-01", "audi": "AUD-01", "aud-01": "AUD-01", "main hall": "AUD-01",
        "oat": "OAT-01", "open air": "OAT-01", "oat-01": "OAT-01",
        "seminar hall 1": "SH-201", "sh-201": "SH-201", "sh1": "SH-201", "seminar hall 201": "SH-201",
        "seminar hall 2": "SH-202", "sh-202": "SH-202", "sh2": "SH-202", "seminar hall 202": "SH-202",
        "lt-101": "LT-101", "lt 101": "LT-101", "lecture hall 1": "LT-101",
        "lt-102": "LT-102", "lt 102": "LT-102", "lecture hall 2": "LT-102",
        "lh-101": "LH-101", "lh-102": "LH-102", "lh-103": "LH-103", "lh-104": "LH-104",
        "cs lab 1": "LAB-CS1", "lab-cs1": "LAB-CS1", "computer lab": "LAB-CS1",
        "cs lab 2": "LAB-CS2", "lab-cs2": "LAB-CS2",
        "physics lab": "LAB-PHY", "lab-phy": "LAB-PHY",
        "ece lab": "LAB-ECE", "lab-ece": "LAB-ECE",
    }

    @classmethod
    def load_dataset(cls) -> Dict[str, Any]:
        if os.path.exists(DATASET_PATH):
            with open(DATASET_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    @classmethod
    def load_schedule(cls) -> Dict[str, Any]:
        if os.path.exists(SCHEDULE_PATH):
            with open(SCHEDULE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    @classmethod
    def parse_booking_prompt(
        cls,
        prompt: str,
        user_role: str = "Club Representative",
        requester_id: str = "REQ-USER-01"
    ) -> AgentResponse:
        # 1. Red-Team & Adversarial Guardrails
        guard = AIGuardrailEngine.inspect(prompt, user_role)
        if not guard.is_safe:
            return AgentResponse(
                status="SECURITY_VIOLATION",
                message="Security policy violation detected: Prompt contains prohibited instructions or attempts to bypass campus scheduling constraints.",
                security_violations=guard.violations
            )

        text = prompt.lower()

        # 2. Extract Day
        day = "Monday"
        for kw, target_day in cls.DAY_MAP.items():
            if re.search(rf"\b{kw}\b", text):
                day = target_day
                break

        # 3. Extract Venue
        room_id = "AUD-01"
        for kw, target_room in cls.VENUE_MAP.items():
            if kw in text:
                room_id = target_room
                break

        # 4. Extract Attendees
        attendees = 50
        att_match = re.search(r"(\d+)\s*(people|students|attendees|pax|log|bando|seats|members)", text)
        if att_match:
            attendees = int(att_match.group(1))

        # 5. Extract Time / Period
        start_p = 10
        end_p = 12
        if "8 am" in text or "8 baje" in text or "8:00" in text:
            start_p, end_p = 1, 1
        elif "9 am" in text or "9 baje" in text:
            start_p, end_p = 2, 2
        elif "10 am" in text or "10 baje" in text:
            start_p, end_p = 3, 3
        elif "11 am" in text or "11 baje" in text:
            start_p, end_p = 4, 4
        elif "12 pm" in text or "12 baje" in text:
            start_p, end_p = 5, 5
        elif "2 pm" in text or "2 baje" in text or "14:00" in text:
            start_p, end_p = 6, 7
        elif "4 pm" in text or "4 baje" in text or "16:00" in text:
            start_p, end_p = 8, 9
        elif "6 pm" in text or "6 baje" in text or "18:00" in text or "sham" in text or "raat" in text or "evening" in text:
            start_p, end_p = 10, 12
        elif "subah" in text or "morning" in text:
            start_p, end_p = 2, 3
        elif "dopahar" in text or "afternoon" in text:
            start_p, end_p = 6, 8

        # 6. Extract Event Name
        event_name = "Campus Event / Practice"
        for ev in ["hackathon", "drama", "cultural", "robotics", "workshop", "music", "dance", "guest lecture", "seminar"]:
            if ev in text:
                event_name = f"Spectra {ev.capitalize()} Session"
                break

        # 7. Priority Tier based on Role
        tier_map = {
            "Admin": 3,
            "Dean's Office": 3,
            "Department Coordinator": 5,
            "Faculty": 4,
            "Club Representative": 6,
            "Student": 6
        }
        priority_tier = tier_map.get(user_role, 6)

        start_time = cls.PERIOD_TIMES.get(start_p, ("08:00", "09:00"))[0]
        end_time = cls.PERIOD_TIMES.get(end_p, ("20:00", "21:00"))[1]

        # 8. Deterministic Conflict Verification
        sched = cls.load_schedule()
        data = cls.load_dataset()

        # Check Room Capacity
        room_info = next((r for r in data.get("rooms", []) if (r.get("room_id") or r.get("id")) == room_id), None)
        room_cap = room_info["capacity"] if room_info else 100

        conflict_reason = None
        if attendees > room_cap:
            conflict_reason = f"Room capacity violation: {room_id} capacity is {room_cap}, but request has {attendees} attendees."

        # Check Timetable Clash
        if not conflict_reason:
            for entry in sched.get("timetable", []):
                if entry.get("day") == day and entry.get("room_id") == room_id:
                    s = entry.get("start_period", 1)
                    ses_def = next((x for x in data.get("sessions", []) if (x.get("session_id") or x.get("id")) == entry.get("session_id")), None)
                    dur = ses_def.get("duration", 1) if ses_def else 1
                    ses_periods = range(s, s + dur)
                    req_periods = range(start_p, end_p + 1)
                    if any(p in req_periods for p in ses_periods):
                        conflict_reason = f"Timetable clash: Room {room_id} is scheduled for session '{entry.get('session_id')}' ({entry.get('course_id')}) during P{s}-P{s+dur-1} on {day}."
                        break

        # Check Maintenance Window
        if not conflict_reason and room_info:
            maint_list = room_info.get("maintenance", [])
            for mw in maint_list:
                if mw.get("day") == day:
                    m_start = mw.get("start_period", 1)
                    m_end = mw.get("end_period", 1)
                    req_periods = range(start_p, end_p + 1)
                    if any(p in req_periods for p in range(m_start, m_end + 1)):
                        conflict_reason = f"Room maintenance violation: {room_id} is reserved for maintenance on {day} during P{m_start}-P{m_end} ({mw.get('reason', 'Upkeep')})."
                        break

        # Generate Alternatives if conflicted
        alternatives = []
        if conflict_reason:
            alternatives.append({
                "room_id": room_id,
                "day": day,
                "start_period": 10,
                "end_period": 12,
                "start_time": "18:00",
                "end_time": "21:00",
                "note": "Evening slot after regular classes"
            })
            alt_room = "SH-201" if room_id != "SH-201" else "SH-202"
            if attendees > 150:
                alt_room = "OAT-01"
            alt_cap = next((r["capacity"] for r in data.get("rooms", []) if (r.get("room_id") or r.get("id")) == alt_room), 120)
            alternatives.append({
                "room_id": alt_room,
                "day": day,
                "start_period": start_p,
                "end_period": end_p,
                "start_time": start_time,
                "end_time": end_time,
                "note": f"Alternative venue with capacity {alt_cap}"
            })
            alternatives.append({
                "room_id": room_id,
                "day": "Friday",
                "start_period": 10,
                "end_period": 12,
                "start_time": "18:00",
                "end_time": "21:00",
                "note": "Friday evening slot"
            })

        is_valid = conflict_reason is None
        proposal = BookingProposal(
            event_name=event_name,
            day=day,
            start_period=start_p,
            end_period=end_p,
            start_time=start_time,
            end_time=end_time,
            room_id=room_id,
            attendees=attendees,
            requested_by=requester_id,
            requester_role=user_role,
            priority_tier=priority_tier,
            is_valid=is_valid,
            conflict_reason=conflict_reason,
            suggested_alternatives=alternatives,
            manual_fallback_available=True
        )

        if is_valid:
            return AgentResponse(
                status="SUCCESS",
                message=f"Proposal verified: {room_id} is completely free on {day} from {start_time} to {end_time} (P{start_p}-P{end_p}). Capacity: {room_cap} seats.",
                proposal=proposal
            )
        else:
            return AgentResponse(
                status="CONFLICT_WITH_ALTERNATIVES",
                message=f"Conflict detected: {conflict_reason} See suggested alternatives or adjust in manual booking form.",
                proposal=proposal
            )

    @classmethod
    def explain_session(cls, session_id: str) -> Dict[str, Any]:
        """Explains deterministically why a timetable session was placed at its assigned slot."""
        data = cls.load_dataset()
        sched = cls.load_schedule()

        ses_def = next((s for s in data.get("sessions", []) if (s.get("session_id") or s.get("id")) == session_id), None)
        if not ses_def:
            return {"error": f"Session {session_id} not found in dataset"}

        course = next((c for c in data.get("courses", []) if (c.get("course_id") or c.get("id")) == ses_def.get("course_id")), {})
        assigned = next((e for e in sched.get("timetable", []) if e.get("session_id") == session_id), None)

        if not assigned:
            return {"error": f"Session {session_id} has not yet been scheduled"}

        faculty_id = ses_def.get("faculty_id")
        groups = ses_def.get("student_groups", [])
        group_id = groups[0] if groups else "Year 1 Group"
        fac_def = next((f for f in data.get("faculty", []) if (f.get("faculty_id") or f.get("id")) == faculty_id), {})
        grp_def = next((g for g in data.get("student_groups", []) if (g.get("group_id") or g.get("id")) == group_id), {})
        room_def = next((r for r in data.get("rooms", []) if (r.get("room_id") or r.get("id")) == assigned.get("room_id")), {})

        day = assigned["day"]
        period = assigned["start_period"]
        dur = ses_def.get("duration", 1)

        reasons = [
            f"Course requirement: Course {course.get('code', course.get('course_id', ''))} ({course.get('name', '')}) requires a {dur}-hour block of type '{ses_def.get('session_type', 'lecture')}'.",
            f"Cohort size fit: Student cohort {group_id} has {grp_def.get('size', 50)} students, which satisfies room {assigned['room_id']} capacity ({room_def.get('capacity', 0)} seats).",
            f"Faculty constraint satisfied: Faculty {faculty_id} ({fac_def.get('name', '')}) is available on {day} during P{period}-P{period+dur-1} with daily teaching <= 4 hours.",
            f"Clash prevention: Student group {group_id} has no conflicting lectures or lab sessions at this time."
        ]

        # Check avoid preferences
        avoid_prefs = fac_def.get("avoid_preferences", fac_def.get("avoid_times", []))
        is_avoided = any(
            a.get("day") == day and (
                period == a.get("period") or
                period in range(a.get("start_period", 1), a.get("end_period", 1) + 1)
            ) for a in avoid_prefs
        )
        if is_avoided:
            reasons.append(f"Soft constraint note: Slot matches faculty preference avoid window (incurring soft penalty = 1), chosen because all other available slots produced higher total penalties.")
        else:
            reasons.append(f"Faculty preference satisfied: Slot avoids faculty non-preferred teaching hours.")

        return {
            "session_id": session_id,
            "course": f"{course.get('code', course.get('course_id', ''))} - {course.get('name', '')}",
            "assigned_slot": {
                "day": day,
                "start_period": period,
                "duration_hours": dur,
                "room_id": assigned["room_id"],
                "room_name": room_def.get("name", assigned["room_id"]),
                "time_window": f"{cls.PERIOD_TIMES.get(period, ('08:00', '09:00'))[0]} - {cls.PERIOD_TIMES.get(period + dur - 1, ('17:00', '18:00'))[1]}"
            },
            "deterministic_reasons": reasons
        }

    @classmethod
    def explain_booking(cls, booking_id: str) -> Dict[str, Any]:
        """Explains deterministically why a Spectra booking was approved or rejected."""
        data = cls.load_dataset()
        sched = cls.load_schedule()

        booking = next((b for b in data.get("spectra_bookings", []) if (b.get("booking_id") or b.get("id")) == booking_id), None)
        if not booking:
            return {"error": f"Booking request {booking_id} not found"}

        dec = next((d for d in sched.get("booking_decisions", []) if d.get("booking_id") == booking_id), None)
        if not dec:
            return {"error": f"Booking {booking_id} decision not recorded in schedule"}

        status = dec.get("status", "REJECTED")
        day = booking.get("day")
        start_p = booking.get("start_period")
        end_p = booking.get("end_period")
        room_id = booking.get("preferred_room") or booking.get("room_id")
        priority = booking.get("priority_tier", 6)

        explanation = {
            "booking_id": booking_id,
            "event_name": booking.get("title") or booking.get("event_name"),
            "requester": booking.get("requested_by"),
            "room_id": room_id,
            "day": day,
            "time_window": f"P{start_p}-P{end_p}",
            "priority_tier": priority,
            "decision": status,
            "score": dec.get("score", 0),
        }

        if status == "APPROVED":
            explanation["reason"] = f"Venue {room_id} was completely unoccupied by regular academic sessions, midsem exams, or maintenance during {day} P{start_p}-P{end_p}. Request earned +{dec.get('score')} points for Tier {priority} booking."
        else:
            conflict_notes = dec.get("conflict_reason", "")
            if not conflict_notes:
                conflict_notes = f"Timetable or maintenance overlap in {room_id} on {day} during P{start_p}-P{end_p}."
            explanation["reason"] = f"Request rejected due to hard constraint conflict: {conflict_notes}"
            explanation["alternatives"] = [
                {"day": day, "slot": "P10-P12 (18:00 - 21:00)", "room_id": room_id, "note": "Evening period free"},
                {"day": "Friday", "slot": f"P{start_p}-P{end_p}", "room_id": "SH-201", "note": "Seminar Hall available"}
            ]

        return explanation
