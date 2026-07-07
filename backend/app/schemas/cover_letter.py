from pydantic import BaseModel
from typing import List, Optional


class CoverLetterInput(BaseModel):
    resume_text: str
    resume_data: dict
    job_description: str
    tone: str = "formal"


class ToneVariant(BaseModel):
    tone: str
    content: str


class CoverLetterOutput(BaseModel):
    primary_letter: str
    tone_variants: List[ToneVariant]
