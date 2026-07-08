from pydantic import BaseModel
from typing import List, Optional


class ATSFix(BaseModel):
    issue: str
    severity: str
    recommendation: str


class ATSOutput(BaseModel):
    format_score: int
    keyword_score: int
    content_score: int
    completeness_score: int
    readability_score: int
    ats_compatibility_score: int
    critical_issues: List[ATSFix]
    warnings: List[ATSFix]
    suggestions: List[ATSFix]
    summary: str
    missing_keywords: List[str] = []
    keyword_suggestions: List[str] = []
