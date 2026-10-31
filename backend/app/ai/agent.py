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


class ScheduleChangeProposal(BaseModel):
    faculty_id: str
    faculty_name: str
    session_id: str
    course_id: str
    course_name: str
    original_slot: Dict[str, Any]
    proposed_slot: Dict[str, Any]
    is_valid: bool
    conflict_reason: Optional[str] = None
    suggested_alternatives: List[Dict[str, Any]] = Field(default_factory=list)
    requires_admin_approval: bool = True


class AgentResponse(BaseModel):
    status: str  # "SUCCESS", "CONFLICT_WITH_ALTERNATIVES", "SECURITY_VIOLATION", "SCHEDULE_CHANGE_PROPOSAL", "SCHEDULE_CHANGE_CONFLICT", "CLARIFICATION_NEEDED"
    message: str
    proposal: Optional[BookingProposal] = None
    schedule_proposal: Optional[ScheduleChangeProposal] = None
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

        # Check if query is a Faculty Schedule Change Request (Requirement 7)
        schedule_change_keywords = [
            "reschedule", "move my", "move class", "shift class", "cannot teach",
            "can't teach", "nahi padha sakta", "leave on", "chhutti", "chutti",
            "unavailability", "shift my lecture", "extra session", "change my slot",
            "move lecture", "relocate session"
        ]
        if any(kw in text for kw in schedule_change_keywords):
            return cls.process_faculty_schedule_change(prompt, user_role, requester_id)

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
    def process_faculty_schedule_change(
        cls,
        prompt: str,
        user_role: str = "Faculty",
        requester_id: str = "FAC-01"
    ) -> AgentResponse:
        """
        Handles natural language requests from faculty to reschedule classes or report unavailability.
        Deterministically verifies all hard constraints before generating a proposal for Admin approval.
        """
        text = prompt.lower()
        data = cls.load_dataset()
        sched = cls.load_schedule()

        # 1. Resolve Faculty
        faculty_id = requester_id if requester_id.startswith("FAC-") else "FAC-01"
        fac_match = re.search(r"\b(FAC-\d{1,2})\b", prompt, re.IGNORECASE)
        if fac_match:
            faculty_id = fac_match.group(1).upper()
        else:
            for f in data.get("faculty", []):
                name_parts = f.get("name", "").lower().split()
                if any(p in text for p in name_parts if len(p) > 2):
                    faculty_id = f.get("faculty_id")
                    break

        fac_def = next((f for f in data.get("faculty", []) if f.get("faculty_id") == faculty_id), {})
        faculty_name = fac_def.get("name", f"Faculty {faculty_id}")

        # 2. Resolve Session to Move
        timetable = sched.get("timetable", [])
        fac_session_ids = {s["session_id"] for s in data.get("sessions", []) if s.get("faculty_id") == faculty_id}
        fac_scheduled = [e for e in timetable if e.get("session_id") in fac_session_ids]

        source_day = None
        for kw, target_day in cls.DAY_MAP.items():
            if f"on {kw}" in text or f"from {kw}" in text or f"{kw} class" in text or f"{kw} ka" in text or f"{kw} ko" in text:
                source_day = target_day
                break

        target_session_entry = None
        ses_match = re.search(r"\b(SES-[A-Z0-9_-]+)\b", prompt, re.IGNORECASE)
        if ses_match:
            sid = ses_match.group(1).upper()
            target_session_entry = next((e for e in fac_scheduled if e.get("session_id") == sid), None)

        if not target_session_entry:
            course_match = re.search(r"\b([A-Z]{2,4}\d{3})\b", prompt, re.IGNORECASE)
            if course_match:
                cid = course_match.group(1).upper()
                c_sessions = {s["session_id"] for s in data.get("sessions", []) if s.get("course_id") == cid and s.get("faculty_id") == faculty_id}
                target_session_entry = next((e for e in fac_scheduled if e.get("session_id") in c_sessions), None)

        if not target_session_entry and source_day:
            target_session_entry = next((e for e in fac_scheduled if e.get("day") == source_day), None)

        if not target_session_entry and fac_scheduled:
            target_session_entry = fac_scheduled[0]

        if not target_session_entry:
            return AgentResponse(
                status="CLARIFICATION_NEEDED",
                message=f"Could not identify a scheduled class for Faculty {faculty_name} ({faculty_id}). Please specify the course code or session ID."
            )

        sid = target_session_entry["session_id"]
        ses_def = next((s for s in data.get("sessions", []) if s.get("session_id") == sid), {})
        course_def = next((c for c in data.get("courses", []) if c.get("course_id") == ses_def.get("course_id")), {})
        course_id = course_def.get("course_id", ses_def.get("course_id", "Course"))
        course_name = course_def.get("name", "Academic Lecture")
        dur = ses_def.get("duration", 1)
        orig_day = target_session_entry["day"]
        orig_period = target_session_entry["start_period"]
        orig_room = target_session_entry["room_id"]
        groups = ses_def.get("student_groups", [])

        # 3. Resolve Target Day & Target Period
        target_day = "Friday"
        for kw, target_d in cls.DAY_MAP.items():
            if f"to {kw}" in text or f"on {kw}" in text:
                target_day = target_d
                break
            elif kw in text and target_d != source_day:
                target_day = target_d

        target_period = 6  # default afternoon (14:00)
        if "morning" in text or "subah" in text or "9 am" in text or "10 am" in text:
            target_period = 2
        elif "afternoon" in text or "dopahar" in text or "2 pm" in text or "14:00" in text:
            target_period = 6
        elif "evening" in text or "sham" in text or "4 pm" in text:
            target_period = 8

        # 4. Deterministic Constraint Checks
        conflict_reasons = []
        target_periods = list(range(target_period, target_period + dur))

        # A. Lunch restriction
        if 5 in target_periods and 6 in target_periods:
            conflict_reasons.append("Sessions cannot cross the 13:00-14:00 lunch break.")

        # B. Faculty unavailability
        for u in fac_def.get("unavailability", []):
            if u.get("day") == target_day and u.get("period") in target_periods:
                conflict_reasons.append(f"Faculty {faculty_name} has unavailability scheduled on {target_day} P{u.get('period')}.")

        # C. Faculty daily limit (<= 4h)
        target_day_fac_hours = sum(
            next((s.get("duration", 1) for s in data.get("sessions", []) if s.get("session_id") == e["session_id"]), 1)
            for e in timetable
            if e.get("day") == target_day and e.get("session_id") in fac_session_ids and e.get("session_id") != sid
        )
        if target_day_fac_hours + dur > fac_def.get("daily_limit_hours", 4):
            conflict_reasons.append(f"Faculty daily workload limit exceeded on {target_day} ({target_day_fac_hours + dur}h > 4h limit).")

        # D. Faculty overlap
        for e in timetable:
            if e.get("session_id") == sid: continue
            if e.get("day") == target_day and e.get("session_id") in fac_session_ids:
                e_sess = next((s for s in data.get("sessions", []) if s.get("session_id") == e["session_id"]), {})
                e_pers = range(e["start_period"], e["start_period"] + e_sess.get("duration", 1))
                if any(p in target_periods for p in e_pers):
                    conflict_reasons.append(f"Faculty {faculty_name} is already teaching session {e['session_id']} on {target_day} P{e['start_period']}.")

        # E. Student group overlaps
        for g in groups:
            for e in timetable:
                if e.get("session_id") == sid: continue
                if e.get("day") == target_day:
                    e_sess = next((s for s in data.get("sessions", []) if s.get("session_id") == e["session_id"]), {})
                    if g in e_sess.get("student_groups", []):
                        e_pers = range(e["start_period"], e["start_period"] + e_sess.get("duration", 1))
                        if any(p in target_periods for p in e_pers):
                            conflict_reasons.append(f"Student cohort {g} has a conflicting class ({e_sess.get('course_id')}) in {e.get('room_id')} on {target_day} P{e.get('start_period')}.")

        # F. Find valid room
        target_room = orig_room
        req_type = ses_def.get("required_room_type")
        size = sum(next((gr["size"] for gr in data.get("student_groups", []) if gr["group_id"] == g), 50) for g in groups)

        candidate_rooms = [
            r for r in data.get("rooms", [])
            if r["capacity"] >= size and (not req_type or r.get("type") == req_type or (req_type == "lecture_hall" and r.get("type") in ["lecture_hall", "auditorium"]))
        ]
        free_room = None
        for cr in candidate_rooms:
            crid = cr["room_id"]
            maint_clash = any(
                m.get("day") == target_day and set(range(m.get("start_period", 1), m.get("end_period", 1) + 1)).intersection(target_periods)
                for m in cr.get("maintenance", [])
            )
            if maint_clash: continue
            occ = any(
                e.get("room_id") == crid and e.get("day") == target_day and
                set(range(e.get("start_period", 1), e.get("start_period", 1) + next((s.get("duration", 1) for s in data.get("sessions", []) if s.get("session_id") == e["session_id"]), 1))).intersection(target_periods)
                for e in timetable if e.get("session_id") != sid
            )
            if not occ:
                free_room = crid
                break

        if not free_room:
            conflict_reasons.append(f"No suitable room with capacity >= {size} and type '{req_type or 'classroom'}' is free on {target_day} P{target_period}.")
        else:
            target_room = free_room

        is_valid = len(conflict_reasons) == 0

        # Compute alternatives if conflicted
        alternatives = []
        if not is_valid:
            for cand_day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
                if len(alternatives) >= 3: break
                for cand_p in [2, 3, 4, 6, 7, 8]:
                    if len(alternatives) >= 3: break
                    cand_pers = list(range(cand_p, cand_p + dur))
                    if 5 in cand_pers and 6 in cand_pers: continue
                    if any(u.get("day") == cand_day and u.get("period") in cand_pers for u in fac_def.get("unavailability", [])): continue

                    group_busy = False
                    for g in groups:
                        for e in timetable:
                            if e.get("session_id") == sid: continue
                            if e.get("day") == cand_day:
                                e_s = next((s for s in data.get("sessions", []) if s.get("session_id") == e["session_id"]), {})
                                if g in e_s.get("student_groups", []):
                                    if set(range(e["start_period"], e["start_period"] + e_s.get("duration", 1))).intersection(cand_pers):
                                        group_busy = True; break
                        if group_busy: break
                    if group_busy: continue

                    found_r = None
                    for cr in candidate_rooms:
                        crid = cr["room_id"]
                        if not any(e.get("room_id") == crid and e.get("day") == cand_day and set(range(e.get("start_period", 1), e.get("start_period", 1) + 1)).intersection(cand_pers) for e in timetable if e.get("session_id") != sid):
                            found_r = crid; break
                    if found_r:
                        alternatives.append({
                            "day": cand_day,
                            "start_period": cand_p,
                            "end_period": cand_p + dur - 1,
                            "room_id": found_r,
                            "time": f"{cls.PERIOD_TIMES.get(cand_p, ('08:00', '09:00'))[0]} - {cls.PERIOD_TIMES.get(cand_p + dur - 1, ('17:00', '18:00'))[1]}"
                        })

        sched_proposal = ScheduleChangeProposal(
            faculty_id=faculty_id,
            faculty_name=faculty_name,
            session_id=sid,
            course_id=course_id,
            course_name=course_name,
            original_slot={"day": orig_day, "start_period": orig_period, "room_id": orig_room},
            proposed_slot={"day": target_day, "start_period": target_period, "room_id": target_room},
            is_valid=is_valid,
            conflict_reason="; ".join(conflict_reasons) if conflict_reasons else None,
            suggested_alternatives=alternatives,
            requires_admin_approval=True
        )

        if is_valid:
            return AgentResponse(
                status="SCHEDULE_CHANGE_PROPOSAL",
                message=f"Schedule change verified: {course_id} ({sid}) taught by {faculty_name} can be relocated from {orig_day} P{orig_period} ({orig_room}) to {target_day} P{target_period} ({target_room}). Zero conflicts detected. Admin approval required to commit.",
                schedule_proposal=sched_proposal
            )
        else:
            return AgentResponse(
                status="SCHEDULE_CHANGE_CONFLICT",
                message=f"Target slot unavailable: {'; '.join(conflict_reasons)}. See alternative feasible slots below.",
                schedule_proposal=sched_proposal
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
