from pydantic import BaseModel


class ResumeAgentOutput(BaseModel):
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    improvement_tips: list[str]
    suggested_roles: list[str]
    ats_score: int
