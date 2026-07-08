import json
import tempfile
import os
from typing import TypedDict, List

from fastapi import APIRouter, UploadFile, File, HTTPException

from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

from app.schemas.resume import ResumeResponse
from app.schemas.agent import ResumeAgentOutput
from app.services.resume_parser import extract_text_from_pdf, extract_text_from_docx, parse_resume_text
from app.services.ats_scorer import compute_ats_scores
from app.core.config import settings
from app.agents.types import AgentState

router = APIRouter(prefix="/resume", tags=["Resume"])

_llm_general = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    google_api_key=settings.google_api_key,
)


class ResumeQualitative(BaseModel):
    summary: str = Field(description="One-line summary of the resume")
    strengths: List[str] = Field(description="Top 3 strengths of the resume")
    weaknesses: List[str] = Field(description="Top 3 weaknesses of the resume")
    improvement_tips: List[str] = Field(description="3 specific tips to improve the resume")
    suggested_roles: List[str] = Field(description="3-5 job roles this resume is best suited for")


_structured_llm = _llm_general.with_structured_output(ResumeQualitative)


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
    return _llm_general.invoke(prompt).content.strip()


def _analyze_resume_text(resume_text: str, summary: str = "") -> dict:
    # Step 1: Python computes deterministic ATS scores
    scores = compute_ats_scores(resume_text)

    # Step 2: Gemini provides qualitative analysis
    qualitative_prompt = f"""Analyze this resume and provide:
1. A one-line summary
2. Top 3 strengths
3. Top 3 weaknesses
4. 3 specific improvement tips
5. 3-5 job roles it's best suited for

Resume:
{resume_text}
"""
    try:
        qualitative = _structured_llm.invoke(qualitative_prompt)
    except Exception:
        qualitative = ResumeQualitative(
            summary=summary or "",
            strengths=[],
            weaknesses=[],
            improvement_tips=[],
            suggested_roles=[],
        )

    return {
        "summary": qualitative.summary or summary,
        "strengths": qualitative.strengths,
        "weaknesses": qualitative.weaknesses,
        "improvement_tips": qualitative.improvement_tips,
        "suggested_roles": qualitative.suggested_roles,
        "ats_score": scores["ats_score"],
        "format_score": scores["format_score"],
        "keyword_score": scores["keyword_score"],
        "content_score": scores["content_score"],
        "completeness_score": scores["completeness_score"],
        "readability_score": scores["readability_score"],
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
    if not state.get("resume_text", "").strip():
        return {**state, "error": "No resume found. Upload a resume first."}
    summary = _generate_summary(state["resume_text"])
    data = _analyze_resume_text(state["resume_text"], summary)
    output = ResumeAgentOutput(**data)
    return {
        "analysis_results": {**state.get("analysis_results", {}), **data},
        "output": output,
    }
