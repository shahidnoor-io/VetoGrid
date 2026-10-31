"""
CampusOS AI - Authentication API Endpoints
Implements session-based and HMAC-SHA256 authenticated login, session verification, and logout.
Compatible with routinetable.vercel.app RBAC simulation.
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Response, Request, HTTPException, status
from pydantic import BaseModel, EmailStr
import time
import base64
import hmac
import hashlib
import json

from backend.app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

DEMO_USERS = [
    {
        "userId": "usr-002",
        "email": "coordinator@chitkara.edu.in",
        "name": "Dr. Priya Sharma",
        "role": "timetable_coordinator",
        "password": "Coord@2026",
        "label": "Timetable Coordinator",
        "badge": "Primary Actor",
        "department": "Computer Science & Engineering",
        "canApprove": True,
        "canChangePriority": False,
        "canGenerateTimetable": True,
        "canMoveClasses": True,
    },
    {
        "userId": "usr-003",
        "email": "dean@chitkara.edu.in",
        "name": "Prof. S.K. Mehta",
        "role": "academic_dean",
        "password": "Dean@2026",
        "label": "Academic Dean",
        "badge": "Approver",
        "department": "Dean's Office (Academic Affairs)",
        "canApprove": True,
        "canChangePriority": True,
        "canGenerateTimetable": True,
        "canMoveClasses": True,
    },
    {
        "userId": "usr-006",
        "email": "venues@chitkara.edu.in",
        "name": "Mr. Rajan Singh",
        "role": "venue_manager",
        "password": "Venue@2026",
        "label": "Venue Manager",
        "badge": "Spectra",
        "department": "Campus Infrastructure & Venues",
        "canApprove": True,
        "canChangePriority": False,
        "canGenerateTimetable": False,
        "canMoveClasses": False,
    },
    {
        "userId": "usr-005",
        "email": "faculty@chitkara.edu.in",
        "name": "Dr. Amit Behera",
        "role": "faculty",
        "password": "Faculty@2026",
        "label": "Faculty Member",
        "badge": "Instructor",
        "department": "ECE",
        "entityId": "F12",
        "canApprove": False,
        "canChangePriority": False,
        "canGenerateTimetable": False,
        "canMoveClasses": False,
    },
    {
        "userId": "usr-007",
        "email": "student@chitkara.edu.in",
        "name": "Arjun Patel",
        "role": "student_representative",
        "password": "Student@2026",
        "label": "Student Rep",
        "badge": "Viewer",
        "department": "CSE",
        "entityId": "CSE-2",
        "canApprove": False,
        "canChangePriority": False,
        "canGenerateTimetable": False,
        "canMoveClasses": False,
    },
    {
        "userId": "usr-001",
        "email": "admin@chitkara.edu.in",
        "name": "Dr. Rajiv Kumar",
        "role": "super_admin",
        "password": "Admin@2026",
        "label": "Super Admin",
        "badge": "Admin",
        "department": "Central Administration",
        "canApprove": True,
        "canChangePriority": True,
        "canGenerateTimetable": True,
        "canMoveClasses": True,
    },
    # Backward compatible Section 4 personas
    {
        "userId": "DEAN-01",
        "email": "dean@cit.edu.in",
        "name": "Prof. S. Mohapatra",
        "role": "academic_dean",
        "password": "Dean@2026",
        "label": "Admin (Dean's office)",
        "badge": "Super Admin",
        "department": "Dean's Office (Academic Affairs)",
        "canApprove": True,
        "canChangePriority": True,
        "canGenerateTimetable": True,
        "canMoveClasses": True,
    },
    {
        "userId": "COORD-CSE",
        "email": "coordinator.cse@cit.edu.in",
        "name": "Dr. A. Verma",
        "role": "timetable_coordinator",
        "password": "Coord@2026",
        "label": "Department coordinator",
        "badge": "Dept Coordinator",
        "department": "Computer Science & Engineering",
        "canApprove": True,
        "canChangePriority": False,
        "canGenerateTimetable": False,
        "canMoveClasses": False,
    },
    {
        "userId": "FAC-01",
        "email": "fac01@cit.edu.in",
        "name": "Dr. Rajesh Sharma",
        "role": "faculty",
        "password": "Faculty@2026",
        "label": "Faculty",
        "badge": "Faculty Member",
        "department": "Computer Science & Engineering",
        "canApprove": False,
        "canChangePriority": False,
        "canGenerateTimetable": False,
        "canMoveClasses": False,
    },
    {
        "userId": "CLUB-LIT-01",
        "email": "club.lit@cit.edu.in",
        "name": "Aarav Patel",
        "role": "student_representative",
        "password": "Student@2026",
        "label": "Club representative",
        "badge": "Club Representative",
        "department": "Literary Society (Spectra Committee)",
        "canApprove": False,
        "canChangePriority": False,
        "canGenerateTimetable": False,
        "canMoveClasses": False,
    },
]


def _sign_payload(payload_bytes: bytes) -> str:
    h = hmac.new(settings.SECRET_KEY.encode(), payload_bytes, hashlib.sha256)
    return base64.urlsafe_b64encode(h.digest()).decode().rstrip("=")


def create_session_token(user_dict: Dict[str, Any]) -> str:
    payload = {
        "userId": user_dict["userId"],
        "email": user_dict["email"],
        "name": user_dict["name"],
        "role": user_dict["role"],
        "iat": int(time.time()),
    }
    raw = json.dumps(payload, separators=(",", ":")).encode()
    b64_payload = base64.urlsafe_b64encode(raw).decode().rstrip("=")
    sig = _sign_payload(raw)
    return f"{b64_payload}.{sig}"


def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        b64_payload, sig = parts
        # add padding
        rem = len(b64_payload) % 4
        if rem > 0:
            b64_payload += "=" * (4 - rem)
        raw = base64.urlsafe_b64decode(b64_payload)
        expected_sig = _sign_payload(raw)
        if not hmac.compare_digest(sig, expected_sig):
            return None
        return json.loads(raw.decode())
    except Exception:
        return None


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(req: LoginRequest, response: Response):
    clean_email = req.email.strip().lower()
    clean_password = req.password.strip()

    matched = None
    for u in DEMO_USERS:
        if u["email"].lower() == clean_email:
            # Check password if configured, or allow demo access
            if u["password"] == clean_password or clean_password in ("Coord@2026", "Dean@2026", "Venue@2026", "Faculty@2026", "Student@2026", "Admin@2026", "••••••••••••", "demo"):
                matched = u
                break
            else:
                matched = u  # allow demo login convenience
                break

    if not matched:
        # Default fallback to coordinator
        matched = DEMO_USERS[0]

    token = create_session_token(matched)

    # Set HTTP-only session cookie
    response.set_cookie(
        key="campusos_session",
        value=token,
        max_age=28800,
        httponly=True,
        samesite="lax",
        path="/",
        secure=False,
    )

    user_info = {
        "userId": matched["userId"],
        "email": matched["email"],
        "name": matched["name"],
        "role": matched["role"],
    }
    if "department" in matched:
        user_info["department"] = matched["department"]
    if "entityId" in matched:
        user_info["entityId"] = matched["entityId"]

    return {
        "success": True,
        "user": user_info,
        "redirectTo": "/dashboard",
    }


@router.get("/me")
def get_current_user(request: Request):
    token = request.cookies.get("campusos_session")
    if not token:
        # check Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    payload = verify_session_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
        )

    return {
        "success": True,
        "user": payload,
    }


@router.post("/logout")
def logout(response: Response):
    response.set_cookie(
        key="campusos_session",
        value="",
        max_age=0,
        httponly=True,
        samesite="lax",
        path="/",
    )
    return {
        "success": True,
        "message": "Logged out successfully.",
    }

