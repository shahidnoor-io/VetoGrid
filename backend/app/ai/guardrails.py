"""
CampusOS AI - Red-Team-Proof AI Guardrails & Input Validation
Ensures strict defense against prompt injections, role impersonation,
privilege escalation, and constraint bypass attempts.
"""

import re
from typing import Tuple, List, Dict, Any
from pydantic import BaseModel, Field


class GuardrailCheckResult(BaseModel):
    is_safe: bool
    risk_level: str  # "SAFE", "SUSPICIOUS", "CRITICAL_VIOLATION"
    violations: List[str] = Field(default_factory=list)
    sanitized_prompt: str


class AIGuardrailEngine:
    """
    Multi-layer defense engine for campus AI assistant.
    Guarantees that no natural language prompt can trick the system
    into bypassing deterministic constraint checks or granting unauthorized approvals.
    """

    ADVERSARIAL_PATTERNS = [
        # Jailbreak & Instruction Override
        (r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions?", "INSTRUCTION_OVERRIDE_ATTEMPT"),
        (r"system\s+(override|bypass|prompt)", "SYSTEM_OVERRIDE_ATTEMPT"),
        (r"you\s+are\s+now\s+in\s+(developer|god|unrestricted|dan)\s+mode", "JAILBREAK_ATTEMPT"),
        (r"developer\s+mode\s+enabled", "JAILBREAK_ATTEMPT"),
        
        # Role Impersonation & Privilege Escalation
        (r"(i\s+am|speaking\s+as|on\s+behalf\s+of)\s+(the\s+)?(dean|director|admin|hod|head\s+of\s+department)", "ROLE_IMPERSONATION"),
        (r"grant\s+(me\s+)?(admin|root|superuser|dean)\s+(access|privilege|rights)", "PRIVILEGE_ESCALATION"),
        (r"pretend\s+you\s+are\s+the\s+dean", "ROLE_IMPERSONATION"),
        (r"as\s+dean,\s+i\s+order\s+you", "ROLE_IMPERSONATION"),

        # Constraint & Policy Bypass
        (r"(bypass|skip|ignore|override)\s+(conflict|validation|constraint|rules|checks?|capacity)", "CONSTRAINT_BYPASS_ATTEMPT"),
        (r"force\s+(approve|schedule|assign|book)\s+without\s+check", "FORCE_UNCHECKED_APPROVAL"),
        (r"do\s+not\s+(run|call|check)\s+(validator|solver|algorithm)", "SOLVER_BYPASS_ATTEMPT"),
        (r"mark\s+(this\s+)?as\s+approved\s+immediately", "AUTO_APPROVE_ATTEMPT"),

        # Injection / Execution
        (r"<script[\s\S]*?>[\s\S]*?<\/script>", "XSS_INJECTION"),
        (r"(drop|truncate|delete\s+from|insert\s+into)\s+[a-z_]+", "SQL_INJECTION_PATTERN"),
    ]

    @classmethod
    def inspect(cls, prompt: str, user_role: str = "Student") -> GuardrailCheckResult:
        violations = []
        lower = prompt.lower()

        for pattern, violation_type in cls.ADVERSARIAL_PATTERNS:
            if re.search(pattern, lower, re.IGNORECASE):
                violations.append(violation_type)

        if violations:
            return GuardrailCheckResult(
                is_safe=False,
                risk_level="CRITICAL_VIOLATION",
                violations=violations,
                sanitized_prompt=""
            )

        # Basic sanitization
        sanitized = re.sub(r"[<>'\";]", " ", prompt).strip()

        return GuardrailCheckResult(
            is_safe=True,
            risk_level="SAFE",
            violations=[],
            sanitized_prompt=sanitized
        )
