from pydantic import BaseModel
from typing import Optional


class ResumeAgentOutput(BaseModel):
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    improvement_tips: list[str]
    suggested_roles: list[str]
    ats_score: int
    format_score: Optional[int] = None
    keyword_score: Optional[int] = None
    content_score: Optional[int] = None
    completeness_score: Optional[int] = None
    readability_score: Optional[int] = None
