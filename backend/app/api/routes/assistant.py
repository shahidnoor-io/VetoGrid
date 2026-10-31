"""
CampusOS AI - Red-Team-Proof AI Assistant API
Processes natural language (English / Hinglish) venue booking and timetable queries
with multi-layer adversarial prompt injection defenses and deterministic conflict checks.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.app.ai.agent import CampusAIAgent, AgentResponse

router = APIRouter(prefix="/assistant", tags=["Red-Team-Proof AI Assistant"])


class AssistantChatRequest(BaseModel):
    prompt: str = Field(..., description="User query in English or Hinglish")
    user_role: str = Field(default="Club Representative", description="Active user RBAC role")
    requester_id: str = Field(default="REQ-USER-01", description="User ID submitting the request")


@router.post("/chat", response_model=AgentResponse)
def assistant_chat(req: AssistantChatRequest) -> AgentResponse:
    """
    Evaluates conversational requests safely:
    1. Blocks jailbreaks, prompt injection, and unauthorized role escalation
    2. Extracts booking parameters (date, room, period, attendees)
    3. Deterministically validates against timetable, exams, maintenance windows
    4. Suggests conflict-free alternatives or confirms feasibility
    5. Always provides manual form fallback
    """
    return CampusAIAgent.parse_booking_prompt(
        prompt=req.prompt,
        user_role=req.user_role,
        requester_id=req.requester_id
    )
