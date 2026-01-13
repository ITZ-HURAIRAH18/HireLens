import json
import tempfile
import os
from typing import TypedDict

from fastapi import APIRouter, UploadFile, File, HTTPException

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI

from app.schemas.resume import ResumeResponse
from app.schemas.agent import ResumeAgentOutput
from app.services.resume_parser import extract_text_from_pdf, extract_text_from_docx, parse_resume_text
from app.core.config import settings

router = APIRouter(prefix="/resume", tags=["Resume"])

# ---------------- LLM ---------------- #
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    google_api_key=settings.google_api_key,
)

# ---------------- State ---------------- #
class ResumeState(TypedDict):
    resume_text: str
    summary: str
    output: ResumeAgentOutput


# ---------------- Nodes ---------------- #
def summarize_resume(state: ResumeState):
    prompt = f"""
Summarize the following resume in 3–4 professional lines:

{state['resume_text']}
"""
    summary = llm.invoke(prompt).content.strip()
    return {"summary": summary}


def analyze_resume(state: ResumeState):
    prompt = f"""
Analyze the resume and return ONLY valid JSON.

Rules:
- Max 5 words per bullet
- Max 3 items per list
- Be concise

JSON format:
{{
  "summary": "one line only",
  "strengths": [string],
  "weaknesses": [string],
  "improvement_tips": [string],
  "suggested_roles": [string],
  "ats_score": int
}}

Resume:
{state['resume_text']}
"""

    response = llm.invoke(prompt).content.strip()

    # Remove markdown code fences if present
    if response.startswith("```"):
        response = response.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(response)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON from LLM:\n{response}")

    return {
        "output": ResumeAgentOutput(
            summary=state.get("summary", ""),
            strengths=data.get("strengths", []),
            weaknesses=data.get("weaknesses", []),
            improvement_tips=data.get("improvement_tips", []),
            suggested_roles=data.get("suggested_roles", []),
            ats_score=data.get("ats_score", 0),  # default to 0 if missing
        )
    }


# ---------------- Graph ---------------- #
graph = StateGraph(ResumeState)
graph.add_node("summarize", summarize_resume)
graph.add_node("analyze", analyze_resume)
graph.set_entry_point("summarize")
graph.add_edge("summarize", "analyze")
graph.add_edge("analyze", END)

resume_agent = graph.compile()