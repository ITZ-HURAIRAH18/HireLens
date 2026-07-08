from pydantic import BaseModel
from typing import List, Optional


class ATSFix(BaseModel):
    issue: str
    severity: str
    recommendation: str


class ATSOutput(BaseModel):
    ats_compatibility_score: int
    format_score: Optional[int] = None
    keyword_score: Optional[int] = None
    content_score: Optional[int] = None
    completeness_score: Optional[int] = None
    readability_score: Optional[int] = None
    critical_issues: List[ATSFix]
    warnings: List[ATSFix]
    suggestions: List[ATSFix]
    summary: str
