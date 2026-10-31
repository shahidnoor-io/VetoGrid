"""
Tests for CampusOS AI Deterministic Scheduling Engine and Constraint Validator.
"""

import os
import json
import pytest
from backend.solver import CampusScheduler
from backend.app.validation.validator import OfficialValidatorAdapter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_PATH = os.path.join(BASE_DIR, "data", "official", "cit_public.json")
DISRUPTION_PATH = os.path.join(BASE_DIR, "data", "official", "sample_disruption.json")
EXPORTS_DIR = os.path.join(BASE_DIR, "exports")
SCHEDULE_PATH = os.path.join(EXPORTS_DIR, "schedule.json")
SCHEDULE_AFTER_PATH = os.path.join(EXPORTS_DIR, "schedule_after.json")


def test_starter_pack_dataset_counts():
    assert os.path.exists(DATASET_PATH), "cit_public.json must exist"
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Verify exact Section 5 counts from problem statement
    assert len(data["rooms"]) == 27, "Must have exactly 27 rooms"
    assert len(data["faculty"]) == 40, "Must have exactly 40 faculty members"
    assert len(data["student_groups"]) == 14, "Must have exactly 14 student groups"
    assert len(data["courses"]) == 62, "Must have exactly 62 courses"
    assert len(data["sessions"]) == 189, "Must have exactly 189 sessions"
    
    total_hours = sum(s["duration"] for s in data["sessions"])
    assert total_hours == 243, "Must have exactly 243 teaching hours/week"

    assert len(data["spectra_bookings"]) == 25, "Must have 25 Spectra bookings"
    cancelled_count = sum(1 for b in data["spectra_bookings"] if b.get("status") == "cancelled")
    assert cancelled_count == 1, "Must have exactly 1 cancelled booking request"

    assert len(data["midsem_exams"]) == 41, "Must have exactly 41 midsem exams"


def test_solver_generates_zero_hard_violations():
    scheduler = CampusScheduler(DATASET_PATH)
    timetable = scheduler.solve_weekly_timetable()
    assert len(timetable) == 189, "All 189 sessions must be scheduled"

    exams = scheduler.solve_midsem_exams()
    assert len(exams) == 41, "All 41 midsem exams must be scheduled"

    bookings = scheduler.evaluate_spectra_bookings(timetable)
    assert len(bookings) == 25, "All 25 bookings must be evaluated"

    adapter = OfficialValidatorAdapter()
    assert adapter.is_loaded(), "validator.py must be loaded"

    res = adapter.validate_schedule(SCHEDULE_PATH)
    assert res.is_valid, f"Schedule must have 0 hard violations! Got: {res.hard_constraint_violations}"
    assert res.violations_count == 0


def test_disruption_minimal_displacement():
    assert os.path.exists(SCHEDULE_PATH)
    assert os.path.exists(SCHEDULE_AFTER_PATH)

    adapter = OfficialValidatorAdapter()
    res_after = adapter.validate_schedule(SCHEDULE_AFTER_PATH)
    assert res_after.is_valid, f"Disruption schedule must have 0 hard violations! Got: {res_after.hard_constraint_violations}"

    # Verify displacement
    with open(SCHEDULE_PATH, "r", encoding="utf-8") as f:
        before = json.load(f)
    with open(SCHEDULE_AFTER_PATH, "r", encoding="utf-8") as f:
        after = json.load(f)

    b_map = {e["session_id"]: (e["day"], e["start_period"], e["room_id"]) for e in before["timetable"]}
    a_map = {e["session_id"]: (e["day"], e["start_period"], e["room_id"]) for e in after["timetable"]}

    moved = [sid for sid in b_map if sid in a_map and b_map[sid] != a_map[sid]]
    assert len(moved) <= 3, f"Minimal displacement violated: {len(moved)} sessions moved (expected <= 3)"
