"""
CampusOS AI - Independent Constraint Validator Adapter
Directly bridges CampusOS AI with the official ground-truth validator.py.
"""

import os
import sys
import subprocess
import json
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ValidationResult(BaseModel):
    is_valid: bool = False
    violations_count: int = 0
    hard_constraint_violations: List[str] = []
    soft_constraint_penalties: Dict[str, float] = {}
    booking_score: int = 0
    summary: str = ""


class OfficialValidatorAdapter:
    def __init__(self, validator_script_path: Optional[str] = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.validator_script_path = validator_script_path or os.path.join(base_dir, "validator.py")
        self._is_official_validator_loaded = os.path.exists(self.validator_script_path)

    def is_loaded(self) -> bool:
        return self._is_official_validator_loaded

    def validate_schedule(self, schedule_file_path: str, after_file_path: Optional[str] = None) -> ValidationResult:
        cmd = [sys.executable, self.validator_script_path, schedule_file_path]
        if after_file_path:
            cmd.extend(["--after", after_file_path])

        proc = subprocess.run(cmd, capture_output=True, text=True)
        output = proc.stdout

        is_valid = proc.returncode == 0
        hard_violations = []
        if "HARD CONSTRAINT VIOLATIONS:" in output:
            parts = output.split("HARD CONSTRAINT VIOLATIONS:")[1].split("------------------------------------------------------------")[0]
            hard_violations = [line.strip() for line in parts.splitlines() if line.strip() and not line.startswith("=")]

        return ValidationResult(
            is_valid=is_valid,
            violations_count=len(hard_violations),
            hard_constraint_violations=hard_violations,
            summary=output
        )
