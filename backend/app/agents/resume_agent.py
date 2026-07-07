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
from app.agents.types import AgentState

router = APIRouter(prefix="/resume", tags=["Resume"])

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    google_api_key=settings.google_api_key,
)

# ── Old state (backward compat with existing endpoints) ──
class ResumeState(TypedDict):
    resume_text: str
    summary: str
    output: ResumeAgentOutput


# ── Core logic (shared) ──
def _generate_summary(resume_text: str) -> str:
    prompt = f"""
Summarize the following resume in 3-4 professional lines:

{resume_text}
"""
    return llm.invoke(prompt).content.strip()


def _analyze_resume_text(resume_text: str, summary: str = "") -> dict:
    prompt = f"""
Analyze the resume and return ONLY valid JSON.

Rules:
- Max 5 words per bullet
- Max 3 items per list
- ATS score between 0 and 100

JSON format:
{{
  "summary": "one line",
  "strengths": [string],
  "weaknesses": [string],
  "improvement_tips": [string],
  "suggested_roles": [string],
  "ats_score": number
}}

Resume:
{resume_text}
"""

    response = llm.invoke(prompt).content.strip()

    if response.startswith("```"):
        response = response.replace("```json", "").replace("```", "").strip()

    data = json.loads(response)

    return {
        "summary": summary or data.get("summary", ""),
        "strengths": data.get("strengths", []),
        "weaknesses": data.get("weaknesses", []),
        "improvement_tips": data.get("improvement_tips", []),
        "suggested_roles": data.get("suggested_roles", []),
        "ats_score": int(data.get("ats_score", 0)),
    }


# ── Old graph nodes (backward compat) ──
def summarize_resume(state: ResumeState) -> ResumeState:
    return {"summary": _generate_summary(state["resume_text"])}


def analyze_resume(state: ResumeState) -> ResumeState:
    data = _analyze_resume_text(state["resume_text"], state.get("summary", ""))
    return {"output": ResumeAgentOutput(**data)}


# ── Old compiled graph (backward compat) ──
old_graph = StateGraph(ResumeState)
old_graph.add_node("summarize", summarize_resume)
old_graph.add_node("analyze", analyze_resume)
old_graph.set_entry_point("summarize")
old_graph.add_edge("summarize", "analyze")
old_graph.add_edge("analyze", END)

resume_agent = old_graph.compile()


# ── New supervisor-compatible node ──
def analyze_resume_node(state: AgentState) -> AgentState:
    summary = _generate_summary(state["resume_text"])
    data = _analyze_resume_text(state["resume_text"], summary)
    output = ResumeAgentOutput(**data)
    return {
        "analysis_results": {**state.get("analysis_results", {}), **data},
        "output": output,
    }
