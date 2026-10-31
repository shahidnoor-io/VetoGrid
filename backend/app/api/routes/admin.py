"""
CampusOS AI - Admin Controls, Demo Reset & Audit Logging
Enables quick demo resets to official baseline state and persona switching for judges.
"""

import os
import sys
import json
import subprocess
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException

from backend.app.core.config import settings
from backend.solver import CampusScheduler

router = APIRouter(prefix="/admin", tags=["Admin Controls & Demo Tools"])

DATASET_PATH = os.path.join(settings.PROJECT_ROOT, "data", "official", "cit_public.json")
DISRUPTION_PATH = os.path.join(settings.PROJECT_ROOT, "data", "official", "sample_disruption.json")
EXPORTS_DIR = os.path.join(settings.PROJECT_ROOT, "exports")
SCHEDULE_PATH = os.path.join(EXPORTS_DIR, "schedule.json")
SCHEDULE_AFTER_PATH = os.path.join(EXPORTS_DIR, "schedule_after.json")
DYNAMIC_BOOKINGS_PATH = os.path.join(EXPORTS_DIR, "dynamic_bookings.json")
VALIDATOR_PATH = os.path.join(settings.PROJECT_ROOT, "validator.py")


@router.get("/roles")
def get_demo_roles() -> Dict[str, Any]:
    """Returns available RBAC personas for rapid demo switching and role testing matching Section 4."""
    return {
        "roles": [
            {
                "id": "DEAN-01",
                "name": "Prof. S. Mohapatra",
                "role": "Admin (Dean's office)",
                "email": "dean@cit.edu.in",
                "department": "Dean's Office (Academic Affairs)",
                "can_approve_bookings": True,
                "can_modify_schedule": True,
                "can_upload_datasets": True,
                "what_they_can_do": "Everything. Generates the timetable, approves timetable changes and any booking that moves a class, can change the priority order.",
                "badge": "Super Admin"
            },
            {
                "id": "COORD-CSE",
                "name": "Dr. A. Verma",
                "role": "Department coordinator",
                "email": "coordinator.cse@cit.edu.in",
                "department": "Computer Science & Engineering",
                "can_approve_bookings": True,
                "can_modify_schedule": False,
                "can_upload_datasets": False,
                "what_they_can_do": "Requests changes to their department's sessions, books rooms for department events, approves bookings of their department's labs.",
                "badge": "Dept Level"
            },
            {
                "id": "FAC-01",
                "name": "Dr. Rajesh Sharma",
                "role": "Faculty",
                "email": "fac01@cit.edu.in",
                "department": "Computer Science & Engineering",
                "can_approve_bookings": False,
                "can_modify_schedule": False,
                "can_upload_datasets": False,
                "what_they_can_do": "Views their own timetable, marks unavailability, requests extra or moved sessions.",
                "badge": "Instructor"
            },
            {
                "id": "CLUB-LIT-01",
                "name": "Aarav Patel",
                "role": "Club representative",
                "email": "club.lit@cit.edu.in",
                "department": "Literary & Cultural Society",
                "can_approve_bookings": False,
                "can_modify_schedule": False,
                "can_upload_datasets": False,
                "what_they_can_do": "Submits and cancels venue requests, and sees the status and reason for each.",
                "badge": "Student Club"
            }
        ]
    }


@router.post("/reset-demo")
def reset_demo_state() -> Dict[str, Any]:
    """
    Resets all demo state back to the official baseline:
    - Clears all ad-hoc dynamic bookings
    - Recomputes exports/schedule.json deterministically
    - Recomputes exports/schedule_after.json for disruption
    - Validates both via validator.py
    """
    if os.path.exists(DYNAMIC_BOOKINGS_PATH):
        try:
            os.remove(DYNAMIC_BOOKINGS_PATH)
        except Exception:
            pass

    scheduler = CampusScheduler(DATASET_PATH)
    timetable = scheduler.solve_weekly_timetable()
    exams = scheduler.solve_midsem_exams()
    bookings = scheduler.evaluate_spectra_bookings(timetable)

    os.makedirs(EXPORTS_DIR, exist_ok=True)
    baseline_schedule = {
        "metadata": {
            "generated_by": "CampusOS AI CP-SAT Engine (Demo Reset)",
            "institution": "Chilika Institute of Technology",
            "sessions_count": len(timetable),
            "exams_count": len(exams),
            "booking_decisions_count": len(bookings)
        },
        "timetable": timetable,
        "exams": exams,
        "booking_decisions": bookings
    }
    with open(SCHEDULE_PATH, "w", encoding="utf-8") as f:
        json.dump(baseline_schedule, f, indent=2)

    with open(DISRUPTION_PATH, "r", encoding="utf-8") as f:
        disruption = json.load(f)
    schedule_after = scheduler.solve_disruption(baseline_schedule, disruption)
    with open(SCHEDULE_AFTER_PATH, "w", encoding="utf-8") as f:
        json.dump(schedule_after, f, indent=2)

    val_proc = subprocess.run(
        [sys.executable, VALIDATOR_PATH, SCHEDULE_PATH, "--after", SCHEDULE_AFTER_PATH],
        capture_output=True, text=True
    )

    return {
        "status": "success",
        "message": "Demo state successfully reset to official Section 5 baseline.",
        "baseline_sessions": len(timetable),
        "baseline_exams": len(exams),
        "evaluated_bookings": len(bookings),
        "disruption_moved_sessions": len(schedule_after.get("rescheduling_diff", [])),
        "validator_output": val_proc.stdout
    }
