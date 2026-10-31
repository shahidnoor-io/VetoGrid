#!/usr/bin/env python3
"""
Official Independent Constraint Checker & Evaluator for CIT Campus Scheduling.
Requires ONLY standard Python (no 3rd-party dependencies).

Validates schedule.json (and optional schedule_after.json):
1. Hard Constraint Violations (Target = 0)
2. Soft Penalty Score (Lower is better)
3. Booking Priority Score (Higher is better)
4. Moved Session Count (Minimal perturbation)
"""

import sys
import os
import json
import argparse
from typing import Dict, List, Any, Tuple, Set, Optional


class CITValidator:
    def __init__(self, dataset_path: str, disruption_path: Optional[str] = None):
        with open(dataset_path, "r", encoding="utf-8") as f:
            self.dataset = json.load(f)

        self.rooms_by_id = {r["room_id"]: r for r in self.dataset["rooms"]}
        self.faculty_by_id = {f["faculty_id"]: f for f in self.dataset["faculty"]}
        self.groups_by_id = {g["group_id"]: g for g in self.dataset["student_groups"]}
        self.courses_by_id = {c["course_id"]: c for c in self.dataset["courses"]}
        self.sessions_by_id = {s["session_id"]: s for s in self.dataset["sessions"]}
        self.bookings_by_id = {b["booking_id"]: b for b in self.dataset.get("spectra_bookings", [])}
        self.exams_by_id = {e["exam_id"]: e for e in self.dataset.get("midsem_exams", [])}

        self.disruption = None
        if disruption_path and os.path.exists(disruption_path):
            with open(disruption_path, "r", encoding="utf-8") as f:
                self.disruption = json.load(f)
            # Register new sessions from disruption
            for ch in self.disruption.get("changes", []):
                if ch.get("type") == "add_session" and "session" in ch:
                    new_s = ch["session"]
                    self.sessions_by_id[new_s["session_id"]] = new_s

        self.days = self.dataset.get("days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
        self.teaching_periods = set(self.dataset.get("periods", {}).get("teaching_periods", [1, 2, 3, 4, 5, 6, 7, 8, 9]))
        self.event_periods = set(self.dataset.get("periods", {}).get("event_periods", [10, 11, 12, 13]))

    def validate_schedule(self, schedule_path: str) -> Dict[str, Any]:
        with open(schedule_path, "r", encoding="utf-8") as f:
            sched = json.load(f)

        hard_violations: List[str] = []
        soft_penalties: Dict[str, int] = {
            "faculty_avoid_preference": 0,
            "student_group_gap": 0,
            "student_group_over_6h": 0,
            "duplicate_course_same_day": 0,
            "room_capacity_under_40pct": 0,
            "session_in_p9": 0,
        }

        # Track usage to detect collisions
        # (day, period, room_id) -> session_id/booking_id
        room_usage: Dict[Tuple[str, int, str], str] = {}
        # (day, period, faculty_id) -> session_id
        faculty_usage: Dict[Tuple[str, int, str], str] = {}
        # (day, period, group_id) -> list of session_ids
        group_usage: Dict[Tuple[str, int, str], List[str]] = {}
        # faculty daily hours: (day, faculty_id) -> hours
        faculty_daily_hours: Dict[Tuple[str, str], int] = {}
        # student group daily hours: (day, group_id) -> hours
        group_daily_hours: Dict[Tuple[str, str], int] = {}
        # group daily periods: (day, group_id) -> list of periods
        group_daily_periods: Dict[Tuple[str, str], List[int]] = {}
        # group daily course counts: (day, group_id, course_id) -> count
        group_daily_courses: Dict[Tuple[str, str, str], int] = {}
        # elective basket synchronization check: basket -> set of (day, start_period)
        basket_slots: Dict[str, Set[Tuple[str, int]]] = {}

        scheduled_session_ids = set()
        timetable_entries = sched.get("timetable", [])

        # 1. TIMETABLE SESSION CHECKS
        for entry in timetable_entries:
            sid = entry.get("session_id")
            if not sid or sid not in self.sessions_by_id:
                hard_violations.append(f"Invalid or unrecognized session_id: {sid}")
                continue

            session = self.sessions_by_id[sid]
            scheduled_session_ids.add(sid)

            day = entry.get("day")
            start_p = entry.get("start_period")
            room_id = entry.get("room_id")
            dur = session.get("duration", 1)

            # Validity of day, period, room
            if day not in self.days:
                hard_violations.append(f"Session {sid}: Invalid day '{day}'")
                continue
            if not isinstance(start_p, int) or start_p < 1 or (start_p + dur - 1) > 9:
                hard_violations.append(f"Session {sid}: Invalid start_period {start_p} for duration {dur}")
                continue
            if room_id not in self.rooms_by_id:
                hard_violations.append(f"Session {sid}: Unknown room_id '{room_id}'")
                continue

            room = self.rooms_by_id[room_id]
            fac_id = session.get("faculty_id")
            faculty = self.faculty_by_id.get(fac_id)
            groups = session.get("student_groups", [])

            # Hard Constraint: Lunch Break & Lab Windows
            # Lunch is between P5 and P6 (13:00 - 14:00). No session can cross lunch.
            occupied_periods = list(range(start_p, start_p + dur))
            if 5 in occupied_periods and 6 in occupied_periods:
                hard_violations.append(f"Session {sid}: Runs across lunch (periods {occupied_periods})")

            # Three-hour labs can only be in P2 to P4 or P6 to P8
            if dur == 3:
                if occupied_periods != [2, 3, 4] and occupied_periods != [6, 7, 8]:
                    hard_violations.append(f"Lab Session {sid}: 3-hour lab must run in P2-P4 or P6-P8, but placed in {occupied_periods}")

            # Hard Constraint: Room Type Match
            req_type = session.get("required_room_type")
            if req_type and room.get("type") != req_type:
                # Specialized labs must match strictly
                if "lab" in req_type or req_type in ["workshop", "cad_lab", "physics_lab", "chemistry_lab", "computer_lab", "electronics_lab"]:
                    hard_violations.append(f"Session {sid}: Room type mismatch! Needs '{req_type}', got '{room.get('type')}' in {room_id}")
                elif req_type == "lecture_hall" and room.get("type") not in ["lecture_hall", "auditorium"]:
                    hard_violations.append(f"Session {sid}: Needs lecture_hall or auditorium, got '{room.get('type')}' in {room_id}")

            # Hard Constraint: Room Accessibility
            if session.get("needs_accessible_room") and not room.get("is_accessible"):
                hard_violations.append(f"Session {sid}: Requires accessible room, but {room_id} is not accessible")

            # Hard Constraint: Room Capacity
            # Compute total students in session
            total_students = sum(self.groups_by_id[g]["size"] for g in groups if g in self.groups_by_id)
            if total_students > room.get("capacity", 0):
                hard_violations.append(f"Session {sid}: Room capacity exceeded in {room_id} (students: {total_students}, capacity: {room['capacity']})")

            # Hard Constraint: Fixed Slot Sessions
            fixed_slot = session.get("fixed_slot")
            if fixed_slot:
                if day != fixed_slot.get("day") or start_p != fixed_slot.get("start_period") or room_id != fixed_slot.get("room_id"):
                    hard_violations.append(f"Session {sid}: Fixed slot violated! Expected ({fixed_slot.get('day')}, P{fixed_slot.get('start_period')}, {fixed_slot.get('room_id')}), got ({day}, P{start_p}, {room_id})")

            # Hard Constraint: Elective Basket Synchronization
            basket = session.get("elective_basket")
            if basket:
                if basket not in basket_slots:
                    basket_slots[basket] = set()
                basket_slots[basket].add((day, start_p))

            # Hard Constraint: Room Maintenance
            for m in room.get("maintenance", []):
                if m.get("day") == day:
                    m_periods = set(range(m.get("start_period", 0), m.get("end_period", 0) + 1))
                    overlap = m_periods.intersection(occupied_periods)
                    if overlap:
                        hard_violations.append(f"Session {sid}: Room {room_id} is under maintenance on {day} periods {overlap} ({m.get('reason')})")

            # Hard Constraint: Faculty Unavailability
            if faculty:
                for u in faculty.get("unavailability", []):
                    if u.get("day") == day and u.get("period") in occupied_periods:
                        hard_violations.append(f"Session {sid}: Faculty {fac_id} is unavailable on {day} period {u.get('period')}")

            # Collision Tracking (Rooms, Faculty, Groups)
            for p in occupied_periods:
                # Room collision
                r_key = (day, p, room_id)
                if r_key in room_usage:
                    hard_violations.append(f"Room Double-Booking: Room {room_id} on {day} P{p} by {room_usage[r_key]} and {sid}")
                else:
                    room_usage[r_key] = sid

                # Faculty collision
                if fac_id:
                    f_key = (day, p, fac_id)
                    if f_key in faculty_usage:
                        hard_violations.append(f"Faculty Double-Booking: Faculty {fac_id} on {day} P{p} by {faculty_usage[f_key]} and {sid}")
                    else:
                        faculty_usage[f_key] = sid

                # Student Group collision
                for g in groups:
                    g_key = (day, p, g)
                    if g_key not in group_usage:
                        group_usage[g_key] = []
                    # Elective basket rule: sessions in the same elective basket slot don't clash
                    existing_sids = group_usage[g_key]
                    for ex_sid in existing_sids:
                        ex_sess = self.sessions_by_id[ex_sid]
                        if basket and ex_sess.get("elective_basket") == basket:
                            continue  # Allowed exception
                        hard_violations.append(f"Student Group Double-Booking: Group {g} on {day} P{p} by {ex_sid} and {sid}")
                    group_usage[g_key].append(sid)

            # Daily metrics tracking
            if fac_id:
                f_d_key = (day, fac_id)
                faculty_daily_hours[f_d_key] = faculty_daily_hours.get(f_d_key, 0) + dur

            for g in groups:
                g_d_key = (day, g)
                group_daily_hours[g_d_key] = group_daily_hours.get(g_d_key, 0) + dur
                if g_d_key not in group_daily_periods:
                    group_daily_periods[g_d_key] = []
                group_daily_periods[g_d_key].extend(occupied_periods)

                c_key = (day, g, session.get("course_id", ""))
                group_daily_courses[c_key] = group_daily_courses.get(c_key, 0) + 1

            # Soft Constraints Checks for this session
            # 1. Faculty avoid preferences
            if faculty:
                for av in faculty.get("avoid_preferences", []):
                    if av.get("day") == day and av.get("period") in occupied_periods:
                        soft_penalties["faculty_avoid_preference"] += 5

            # 2. Room utilization < 40%
            if room.get("capacity", 0) > 0:
                util = total_students / room["capacity"]
                if util < 0.40:
                    soft_penalties["room_capacity_under_40pct"] += 1

            # 3. Scheduled in P9 (17:00)
            if 9 in occupied_periods:
                soft_penalties["session_in_p9"] += 2

        # Check: Every session scheduled exactly once
        all_expected_sids = set(self.sessions_by_id.keys())
        missing_sids = all_expected_sids - scheduled_session_ids
        if missing_sids:
            hard_violations.append(f"Unscheduled Sessions ({len(missing_sids)}): {list(missing_sids)[:10]}...")

        # Check: Elective basket synchronization
        for basket, slots in basket_slots.items():
            if len(slots) > 1:
                hard_violations.append(f"Elective Basket Asynchrony: Basket '{basket}' sessions are not all at the same day & period: {slots}")

        # Check: Faculty daily teaching limits (4 hours in CIT data)
        for (day, fac_id), hrs in faculty_daily_hours.items():
            limit = self.faculty_by_id[fac_id].get("daily_limit_hours", 4)
            if hrs > limit:
                hard_violations.append(f"Faculty Workload Exceeded: Faculty {fac_id} has {hrs} hours on {day} (limit {limit}h)")

        # Check: Student group soft penalties
        for (day, g), hrs in group_daily_hours.items():
            if hrs > 6:
                soft_penalties["student_group_over_6h"] += 5

        # Check: Student group free periods (gaps)
        for (day, g), periods in group_daily_periods.items():
            s_periods = sorted(list(set(periods)))
            if len(s_periods) > 1:
                for i in range(len(s_periods) - 1):
                    p1, p2 = s_periods[i], s_periods[i+1]
                    # Free period between classes on same day (lunch between P5 and P6 doesn't count)
                    if p2 - p1 > 1:
                        # Exclude lunch gap
                        if p1 == 5 and p2 == 6:
                            continue
                        soft_penalties["student_group_gap"] += (p2 - p1 - 1) * 2

        # Check: Group has two lectures of same course on same day
        for (day, g, cid), cnt in group_daily_courses.items():
            if cnt > 1:
                soft_penalties["duplicate_course_same_day"] += (cnt - 1) * 3

        # 2. SPECTRA WEEK BOOKINGS EVALUATION
        # Priority: 1. Exams > 2. Regular classes > 3. Institute events > 4. Guest lectures > 5. Department events > 6. Club events
        booking_decisions = sched.get("booking_decisions", [])
        booking_score = 0
        approved_bookings_count = 0

        for b_entry in booking_decisions:
            bid = b_entry.get("booking_id")
            decision = b_entry.get("decision")  # "approved", "rejected", "alternative"
            b_orig = self.bookings_by_id.get(bid)
            if not b_orig:
                continue

            if b_orig.get("status") == "cancelled":
                continue

            tier = b_orig.get("priority_tier", 6)
            b_day = b_entry.get("day", b_orig.get("day"))
            b_start = b_entry.get("start_period", b_orig.get("start_period"))
            b_end = b_entry.get("end_period", b_orig.get("end_period"))
            b_room = b_entry.get("room_id", b_orig.get("preferred_room"))
            b_periods = list(range(b_start, b_end + 1))

            if decision == "approved":
                # Check collision with regular classes
                clash_detected = False
                for p in b_periods:
                    r_key = (b_day, p, b_room)
                    if r_key in room_usage:
                        hard_violations.append(f"Booking Collision: Approved booking {bid} overlaps with session {room_usage[r_key]} in room {b_room} on {b_day} P{p}")
                        clash_detected = True
                    else:
                        room_usage[r_key] = bid

                if not clash_detected:
                    approved_bookings_count += 1
                    # Score reward by priority tier
                    tier_points = {3: 15, 4: 10, 5: 6, 6: 3}
                    booking_score += tier_points.get(tier, 2)

            elif decision == "rejected":
                reason = b_entry.get("reason", "")
                if not reason:
                    hard_violations.append(f"Booking {bid}: Rejection missing clear deterministic reason")

        # 3. MIDSEM EXAMS EVALUATION
        exam_entries = sched.get("exams", [])
        exam_room_usage: Dict[Tuple[str, int, str], str] = {}
        group_exam_days: Dict[Tuple[str, str], str] = {}  # (group, day) -> exam_id

        for e_entry in exam_entries:
            eid = e_entry.get("exam_id")
            e_orig = self.exams_by_id.get(eid)
            if not e_orig:
                continue

            day = e_entry.get("day")
            start_p = e_entry.get("start_period")
            room_id = e_entry.get("room_id")
            dur = e_orig.get("duration", 3)
            e_periods = list(range(start_p, start_p + dur))

            room = self.rooms_by_id.get(room_id)
            if not room:
                hard_violations.append(f"Exam {eid}: Invalid room {room_id}")
                continue

            # Hard Constraint: Halved effective room capacity during exams
            effective_capacity = room.get("capacity", 0) // 2
            expected_students = e_orig.get("expected_students", 0)
            if expected_students > effective_capacity:
                hard_violations.append(f"Exam {eid}: Halved capacity exceeded in {room_id} (students: {expected_students}, effective capacity: {effective_capacity})")

            # Hard Constraint: At most 1 exam per day per student group
            for g in e_orig.get("student_groups", []):
                g_key = (g, day)
                if g_key in group_exam_days:
                    hard_violations.append(f"Exam Clash: Student group {g} has multiple exams on {day} ({group_exam_days[g_key]} and {eid})")
                else:
                    group_exam_days[g_key] = eid

            # Check room double booking during exams
            for p in e_periods:
                r_key = (day, p, room_id)
                if r_key in exam_room_usage:
                    hard_violations.append(f"Exam Room Clash: Room {room_id} double booked on {day} P{p} by {exam_room_usage[r_key]} and {eid}")
                else:
                    exam_room_usage[r_key] = eid

        total_soft_penalty = sum(soft_penalties.values())

        return {
            "is_valid": len(hard_violations) == 0,
            "hard_constraint_violations_count": len(hard_violations),
            "hard_violations": hard_violations,
            "total_soft_penalty": total_soft_penalty,
            "soft_penalties_breakdown": soft_penalties,
            "booking_score": booking_score,
            "approved_bookings_count": approved_bookings_count,
            "scheduled_sessions_count": len(scheduled_session_ids),
            "scheduled_exams_count": len(exam_entries)
        }

    def evaluate_displacement(self, before_path: str, after_path: str) -> Dict[str, Any]:
        with open(before_path, "r", encoding="utf-8") as f:
            b_sched = json.load(f)
        with open(after_path, "r", encoding="utf-8") as f:
            a_sched = json.load(f)

        before_map = {entry["session_id"]: entry for entry in b_sched.get("timetable", [])}
        after_map = {entry["session_id"]: entry for entry in a_sched.get("timetable", [])}

        moved_sessions = []
        for sid, b_entry in before_map.items():
            if sid in after_map:
                a_entry = after_map[sid]
                if (b_entry.get("day") != a_entry.get("day") or
                    b_entry.get("start_period") != a_entry.get("start_period") or
                    b_entry.get("room_id") != a_entry.get("room_id")):
                    moved_sessions.append({
                        "session_id": sid,
                        "old_slot": {"day": b_entry.get("day"), "period": b_entry.get("start_period"), "room": b_entry.get("room_id")},
                        "new_slot": {"day": a_entry.get("day"), "period": a_entry.get("start_period"), "room": a_entry.get("room_id")}
                    })

        # Added sessions (new)
        added_sessions = [sid for sid in after_map if sid not in before_map]

        return {
            "total_moved_sessions": len(moved_sessions),
            "moved_sessions": moved_sessions,
            "added_sessions_count": len(added_sessions),
            "added_sessions": added_sessions
        }


def main():
    parser = argparse.ArgumentParser(description="Official CIT Schedule Constraint Validator")
    parser.add_argument("schedule", help="Path to schedule.json to validate")
    parser.add_argument("--dataset", default=None, help="Path to cit_public.json dataset")
    parser.add_argument("--disruption", default=None, help="Path to sample_disruption.json")
    parser.add_argument("--after", default=None, help="Path to schedule_after.json for displacement check")
    args = parser.parse_args()

    # Determine default dataset location
    if not args.dataset:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        cand1 = os.path.join(base_dir, "cit_public.json")
        cand2 = os.path.join(base_dir, "data", "official", "cit_public.json")
        cand3 = os.path.join(base_dir, "..", "data", "official", "cit_public.json")
        if os.path.exists(cand1):
            dataset_path = cand1
        elif os.path.exists(cand2):
            dataset_path = cand2
        elif os.path.exists(cand3):
            dataset_path = os.path.abspath(cand3)
        else:
            print(f"Error: cit_public.json dataset not found. Provide via --dataset.")
            sys.exit(1)
    else:
        dataset_path = args.dataset

    disruption_path = args.disruption
    if not disruption_path and "after" in os.path.basename(args.schedule).lower():
        cand_disrupt = os.path.join(os.path.dirname(dataset_path), "sample_disruption.json")
        if os.path.exists(cand_disrupt):
            disruption_path = cand_disrupt

    validator = CITValidator(dataset_path, disruption_path)
    res = validator.validate_schedule(args.schedule)

    print("\n" + "=" * 60)
    print("CIT OFFICIAL SCHEDULE VALIDATION REPORT")
    print("=" * 60)
    print(f"Dataset:            {dataset_path}")
    print(f"Schedule File:      {args.schedule}")
    print(f"Status:             {'PASS (VALID)' if res['is_valid'] else 'FAIL (INVALID)'}")
    print(f"Hard Violations:    {res['hard_constraint_violations_count']}")
    print(f"Soft Penalty:       {res['total_soft_penalty']}")
    print(f"Booking Score:      {res['booking_score']} (Approved: {res['approved_bookings_count']})")
    print(f"Sessions Checked:   {res['scheduled_sessions_count']} / 189")
    print(f"Exams Checked:      {res['scheduled_exams_count']} / 41")
    print("-" * 60)

    if res['hard_violations']:
        print("HARD CONSTRAINT VIOLATIONS:")
        for idx, v in enumerate(res['hard_violations'][:20], 1):
            print(f"  {idx}. {v}")
        if len(res['hard_violations']) > 20:
            print(f"  ... and {len(res['hard_violations']) - 20} more.")
        print("-" * 60)

    print("SOFT PENALTY BREAKDOWN:")
    for k, v in res['soft_penalties_breakdown'].items():
        print(f"  - {k}: {v}")
    print("=" * 60)

    # Optional displacement check
    if args.after:
        disp = validator.evaluate_displacement(args.schedule, args.after)
        print("\n" + "=" * 60)
        print("DISRUPTION MINIMAL-DISPLACEMENT REPORT")
        print("=" * 60)
        print(f"Total Moved Sessions: {disp['total_moved_sessions']}")
        print(f"New Sessions Added:   {disp['added_sessions_count']}")
        print("=" * 60)

    sys.exit(0 if res['is_valid'] else 2)


if __name__ == "__main__":
    main()
