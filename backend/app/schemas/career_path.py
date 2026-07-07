from pydantic import BaseModel
from typing import List, Optional


class SkillGap(BaseModel):
    skill: str
    current_level: str
    required_level: str
    priority: str


class Certification(BaseModel):
    name: str
    provider: str
    estimated_time: str
    relevance: str


class LearningMilestone(BaseModel):
    phase: str
    duration: str
    focus: str
    skills: List[str]


class CareerPathOutput(BaseModel):
    target_role: str
    skill_gaps: List[SkillGap]
    certifications: List[Certification]
    learning_roadmap: List[LearningMilestone]
    estimated_timeline: str
