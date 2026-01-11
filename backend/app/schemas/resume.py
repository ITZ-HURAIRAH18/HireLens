from pydantic import BaseModel
from typing import List, Optional


class ResumeSections(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[str] = []
    education: List[str] = []
    projects: List[str] = []


class ResumeResponse(BaseModel):
    message: str
    data: ResumeSections
