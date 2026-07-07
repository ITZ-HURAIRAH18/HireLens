from pydantic import BaseModel
from typing import List


class ATSFix(BaseModel):
    issue: str
    severity: str
    recommendation: str


class ATSOutput(BaseModel):
    ats_compatibility_score: int
    critical_issues: List[ATSFix]
    warnings: List[ATSFix]
    suggestions: List[ATSFix]
    summary: str
