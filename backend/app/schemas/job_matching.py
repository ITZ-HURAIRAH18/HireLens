from pydantic import BaseModel
from typing import List, Optional


class JobMatchingInput(BaseModel):
    resume_text: str
    resume_data: dict
    job_description: str


class KeywordMatch(BaseModel):
    keyword: str
    matched: bool


class SkillGap(BaseModel):
    skill: str
    category: str
    importance: str


class JobMatchingOutput(BaseModel):
    match_percentage: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    skill_gaps: List[SkillGap]
    overall_assessment: str
