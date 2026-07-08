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

_llm_scoring = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    google_api_key=settings.google_api_key,
    model_kwargs={"generation_config": {"seed": 42}},
)

_llm_general = ChatGoogleGenerativeAI(
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
    return _llm_general.invoke(prompt).content.strip()


ATS_RUBRIC = """
CRITERIA FOR ATS SCORING (weighted average):

1. FORMAT & STRUCTURE (20%)
   - Uses standard section headings (Experience, Education, Skills)
   - Clean layout with consistent formatting
   - Proper bullet points, no special characters
   
2. KEYWORD OPTIMIZATION (25%)
   - Industry-relevant keywords and phrases present
   - Technical skills explicitly listed
   - Keywords match common job descriptions in the field
   
3. CONTENT QUALITY (25%)
   - Achievements are quantified with numbers/metrics
   - Strong action verbs used throughout
   - Results-oriented descriptions, not just duties
   
4. COMPLETENESS (15%)
   - Contact info (email, phone, LinkedIn)
   - Work experience with dates and companies
   - Education section present
   - Skills section present
   
5. READABILITY & CONCISENESS (15%)
   - Clear, scannable content
   - Appropriate length (not too short or too long)
   - Good grammar and spelling
"""

SCORE_SYSTEM_PROMPT = """You are an expert ATS scoring system. Score the resume using the rubric below.

For each criterion, assign a score 0-100, then return the final ats_score as the weighted sum:
- Format & Structure: 20%
- Keyword Optimization: 25%
- Content Quality: 25%
- Completeness: 15%
- Readability & Conciseness: 15%

"""


def _analyze_resume_text(resume_text: str, summary: str = "") -> dict:
    scoring_prompt = f"""{SCORE_SYSTEM_PROMPT}{ATS_RUBRIC}

Return ONLY valid JSON with no markdown formatting:

{{
  "format_score": <0-100>,
  "keyword_score": <0-100>,
  "content_score": <0-100>,
  "completeness_score": <0-100>,
  "readability_score": <0-100>,
  "ats_score": <computed weighted average 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "improvement_tips": ["tip1", "tip2", "tip3"],
  "suggested_roles": ["role1", "role2", "role3"],
  "summary": "one line summary of the resume"
}}

Resume:
{resume_text}
"""

    response = _llm_scoring.invoke(scoring_prompt).content.strip()

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
        "format_score": _safe_int(data.get("format_score")),
        "keyword_score": _safe_int(data.get("keyword_score")),
        "content_score": _safe_int(data.get("content_score")),
        "completeness_score": _safe_int(data.get("completeness_score")),
        "readability_score": _safe_int(data.get("readability_score")),
    }


def _safe_int(v):
    if v is None:
        return None
    try:
        return int(v)
    except (ValueError, TypeError):
        return None


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
