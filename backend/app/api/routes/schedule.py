"""
CampusOS AI - Schedule & Optimization API Endpoints
Provides full REST API for:
- Viewing timetable, midsem exams, and Spectra bookings
- Triggering CP-SAT solver
- Applying disruptions with minimal perturbation
- Uploading custom judge datasets and change files (Requirement 9)
- Running independent constraint validation via validator.py
- Natural language & Hinglish venue booking assistant
"""

import os
import sys
import json
import subprocess
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from backend.app.core.config import settings
from backend.solver import CampusScheduler

router = APIRouter(prefix="/schedule", tags=["Scheduling & Optimization"])

DATASET_PATH = os.path.join(settings.PROJECT_ROOT, "data", "official", "cit_public.json")
DISRUPTION_PATH = os.path.join(settings.PROJECT_ROOT, "data", "official", "sample_disruption.json")
EXPORTS_DIR = os.path.join(settings.PROJECT_ROOT, "exports")
SCHEDULE_PATH = os.path.join(EXPORTS_DIR, "schedule.json")
SCHEDULE_AFTER_PATH = os.path.join(EXPORTS_DIR, "schedule_after.json")
VALIDATOR_PATH = os.path.join(settings.PROJECT_ROOT, "validator.py")


class BookingParseRequest(BaseModel):
    user_prompt: str
    requested_by: str = "Faculty / Student"
    role: str = "Faculty"
    priority_tier: int = 4  # 3: Institute, 4: Guest Lecture, 5: Dept, 6: Club


@router.get("/dataset-summary")
def get_dataset_summary() -> Dict[str, Any]:
    if not os.path.exists(DATASET_PATH):
        raise HTTPException(status_code=404, detail="Dataset not found")
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {
        "metadata": data.get("metadata", {}),
        "rooms_count": len(data.get("rooms", [])),
        "faculty_count": len(data.get("faculty", [])),
        "student_groups_count": len(data.get("student_groups", [])),
        "courses_count": len(data.get("courses", [])),
        "sessions_count": len(data.get("sessions", [])),
        "midsem_exams_count": len(data.get("midsem_exams", [])),
        "spectra_bookings_count": len(data.get("spectra_bookings", []))
    }


@router.get("/current")
def get_current_schedule() -> Dict[str, Any]:
    if not os.path.exists(SCHEDULE_PATH):
        raise HTTPException(status_code=404, detail="Schedule not yet generated. Run /solve first.")
    with open(SCHEDULE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/after-disruption")
def get_schedule_after() -> Dict[str, Any]:
    if not os.path.exists(SCHEDULE_AFTER_PATH):
        raise HTTPException(status_code=404, detail="Disruption schedule not yet generated.")
    with open(SCHEDULE_AFTER_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("/solve")
def run_solver() -> Dict[str, Any]:
    """Executes CP-SAT engine and produces exports/schedule.json"""
    if not os.path.exists(DATASET_PATH):
        raise HTTPException(status_code=404, detail="cit_public.json not found")

    scheduler = CampusScheduler(DATASET_PATH)
    timetable = scheduler.solve_weekly_timetable()
    exams = scheduler.solve_midsem_exams()
    booking_decisions = scheduler.evaluate_spectra_bookings(timetable)

    os.makedirs(EXPORTS_DIR, exist_ok=True)
    baseline_schedule = {
        "metadata": {
            "generated_by": "CampusOS AI CP-SAT Engine",
            "institution": "Chilika Institute of Technology",
            "sessions_count": len(timetable),
            "exams_count": len(exams),
            "booking_decisions_count": len(booking_decisions)
        },
        "timetable": timetable,
        "exams": exams,
        "booking_decisions": booking_decisions
    }
    with open(SCHEDULE_PATH, "w", encoding="utf-8") as f:
        json.dump(baseline_schedule, f, indent=2)

    # Validate output
    val_proc = subprocess.run(
        [sys.executable, VALIDATOR_PATH, SCHEDULE_PATH],
        capture_output=True, text=True
    )

    return {
        "status": "success",
        "sessions_scheduled": len(timetable),
        "exams_scheduled": len(exams),
        "bookings_evaluated": len(booking_decisions),
        "validator_output": val_proc.stdout
    }


@router.post("/apply-disruption")
def apply_disruption() -> Dict[str, Any]:
    """Applies sample_disruption.json with minimal displacement"""
    if not os.path.exists(SCHEDULE_PATH):
        run_solver()

    with open(SCHEDULE_PATH, "r", encoding="utf-8") as f:
        baseline = json.load(f)
    with open(DISRUPTION_PATH, "r", encoding="utf-8") as f:
        disruption = json.load(f)

    scheduler = CampusScheduler(DATASET_PATH)
    schedule_after = scheduler.solve_disruption(baseline, disruption)

    with open(SCHEDULE_AFTER_PATH, "w", encoding="utf-8") as f:
        json.dump(schedule_after, f, indent=2)

    val_proc = subprocess.run(
        [sys.executable, VALIDATOR_PATH, SCHEDULE_AFTER_PATH],
        capture_output=True, text=True
    )

    return {
        "status": "success",
        "moved_sessions_count": len(schedule_after.get("rescheduling_diff", [])),
        "moved_sessions": schedule_after.get("rescheduling_diff", []),
        "validator_output": val_proc.stdout
    }


@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Hot-swaps judge dataset (Requirement 9)"""
    content = await file.read()
    try:
        data = json.loads(content.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file: {e}")

    with open(DATASET_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    # Automatically re-solve with new dataset
    solve_res = run_solver()
    return {"status": "dataset_loaded", "solve_summary": solve_res}


@router.post("/upload-disruption")
async def upload_disruption(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Hot-swaps disruption change file (Requirement 9)"""
    content = await file.read()
    try:
        data = json.loads(content.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file: {e}")

    with open(DISRUPTION_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    disrupt_res = apply_disruption()
    return {"status": "disruption_loaded", "disruption_summary": disrupt_res}


@router.post("/parse-booking-request")
def parse_booking_request(req: BookingParseRequest) -> Dict[str, Any]:
    """
    AI Assistant Integration:
    Takes English or Hinglish natural language prompts, parses requested venue, time, and day,
    and runs deterministic conflict validation against current schedule before approving.
    """
    prompt = req.user_prompt.lower()

    # Rule-based deterministic extractor for dates, rooms, and times
    day = "Monday"
    for d in ["monday", "tuesday", "wednesday", "thursday", "friday"]:
        if d in prompt or d[:3] in prompt:
            day = d.capitalize()
            break

    # Extract room
    room_id = "AUD-01"
    for cand_r in ["aud-01", "auditorium", "lt-101", "sh-201", "sh-202", "oat-01", "lab-cs1", "lab-cs2", "lab-phy", "lab-ece"]:
        if cand_r in prompt:
            if "aud" in cand_r: room_id = "AUD-01"
            elif "lt" in cand_r: room_id = "LT-101"
            elif "sh-201" in cand_r: room_id = "SH-201"
            elif "sh-202" in cand_r: room_id = "SH-202"
            elif "oat" in cand_r: room_id = "OAT-01"
            elif "cs1" in cand_r: room_id = "LAB-CS1"
            elif "cs2" in cand_r: room_id = "LAB-CS2"
            elif "phy" in cand_r: room_id = "LAB-PHY"
            elif "ece" in cand_r: room_id = "LAB-ECE"
            break

    # Extract period / time
    start_p = 10
    end_p = 12
    if "evening" in prompt or "sham" in prompt or "raat" in prompt or "6 pm" in prompt or "6 baje" in prompt:
        start_p, end_p = 10, 12
    elif "afternoon" in prompt or "dopahar" in prompt or "2 pm" in prompt or "2 se" in prompt:
        start_p, end_p = 6, 8
    elif "morning" in prompt or "subah" in prompt or "9 am" in prompt:
        start_p, end_p = 2, 4

    # Deterministic validation against current schedule
    if not os.path.exists(SCHEDULE_PATH):
        run_solver()

    with open(SCHEDULE_PATH, "r", encoding="utf-8") as f:
        sched = json.load(f)

    occupied = False
    for entry in sched.get("timetable", []):
        if entry.get("day") == day and entry.get("room_id") == room_id:
            dur = 1
            if entry.get("start_period") in range(start_p, end_p + 1):
                occupied = True
                break

    if not occupied:
        return {
            "status": "APPROVED",
            "extracted_booking": {
                "day": day,
                "start_period": start_p,
                "end_period": end_p,
                "room_id": room_id,
                "requested_by": req.requested_by,
                "priority_tier": req.priority_tier
            },
            "decision_reason": f"Confirmed available in {room_id} on {day} periods P{start_p}-P{end_p}."
        }
    else:
        return {
            "status": "REJECTED_WITH_ALTERNATIVES",
            "conflict": f"Room {room_id} is occupied by scheduled classes on {day} periods P{start_p}-P{end_p}.",
            "suggested_alternatives": [
                {"day": day, "start_period": 10, "end_period": 12, "room_id": room_id, "note": "Evening event period P10-P12"},
                {"day": "Friday", "start_period": start_p, "end_period": end_p, "room_id": "SH-201", "note": "Seminar Hall available"}
            ]
        }
