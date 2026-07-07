from pydantic import BaseModel
from typing import List, Optional


class InterviewQuestion(BaseModel):
    category: str
    question: str
    tips: str


class InterviewPrepOutput(BaseModel):
    target_role: str
    questions: List[InterviewQuestion]
    preparation_tips: str


class MockInterviewInput(BaseModel):
    question: str
    user_answer: str
    context: dict


class MockInterviewFeedback(BaseModel):
    clarity_score: int
    structure_score: int
    star_method_score: int
    relevance_score: int
    feedback: str
    improved_answer: str
