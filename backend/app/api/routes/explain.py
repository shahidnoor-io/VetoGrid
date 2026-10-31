"""
CampusOS AI - Deterministic Scheduling & Decision Explainer API
Answers 'Why is X scheduled here?' and 'Why was Y rejected?' with
100% mathematical auditability (0% LLM hallucination).
"""

import re
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.ai.agent import CampusAIAgent

router = APIRouter(prefix="/explain", tags=["Scheduling Explainer & Auditing"])


class ExplainQueryRequest(BaseModel):
    query: str


@router.get("/session/{session_id}")
def explain_session(session_id: str) -> Dict[str, Any]:
    """Provides deterministic proof and constraints that placed this session at its slot."""
    res = CampusAIAgent.explain_session(session_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.get("/booking/{booking_id}")
def explain_booking(booking_id: str) -> Dict[str, Any]:
    """Provides mathematical rationale for venue booking approval or rejection."""
    res = CampusAIAgent.explain_booking(booking_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/query")
def explain_query(req: ExplainQueryRequest) -> Dict[str, Any]:
    """
    Handles natural language questions like:
    - 'Why is SES-001 at 8 AM?'
    - 'Why was B-003 rejected?'
    - 'Why is CS101 scheduled on Monday?'
    Resolves deterministically via solver constraint logs.
    """
    text = req.query.upper()

    # Match session pattern
    ses_match = re.search(r"\b(SES-[A-Z0-9_-]+)\b", text)
    if ses_match:
        sid = ses_match.group(1)
        return CampusAIAgent.explain_session(sid)

    # Match booking pattern
    book_match = re.search(r"\b(REQ-\d{1,3}|B-\d{1,3}|BOOK-[A-Z0-9_-]+)\b", text)
    if book_match:
        bid = book_match.group(1)
        return CampusAIAgent.explain_booking(bid)

    # Match course pattern like CS101, EE201
    course_match = re.search(r"\b([A-Z]{2,3}\d{3})\b", text)
    if course_match:
        cid = course_match.group(1)
        data = CampusAIAgent.load_dataset()
        course_obj = next((c for c in data.get("courses", []) if c.get("code") == cid or c.get("id") == cid), None)
        if course_obj:
            # find first session of this course
            ses = next((s for s in data.get("sessions", []) if s.get("course_id") == course_obj["id"]), None)
            if ses:
                return CampusAIAgent.explain_session(ses["id"])

    return {
        "query": req.query,
        "matched_entity": None,
        "explanation": "Could not identify a specific Session ID (e.g. SES-001), Course Code (e.g. CS101), or Booking ID (e.g. B-003). Please include the ID to view its deterministic constraint breakdown."
    }
