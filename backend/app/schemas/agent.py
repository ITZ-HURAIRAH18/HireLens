from pydantic import BaseModel
from typing import List


class ResumeAgentOutput(BaseModel):
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    improvement_tips: List[str]
    suggested_roles: List[str]
