from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import List
from app.core.config import settings
from app.agents.types import AgentState
from app.schemas.ats import ATSOutput, ATSFix
from app.services.ats_scorer import compute_ats_scores


class QualitativeAnalysis(BaseModel):
    critical_issues: List[ATSFix] = Field(description="Show-stopping ATS parsing issues")
    warnings: List[ATSFix] = Field(description="Moderate ATS concerns")
    suggestions: List[ATSFix] = Field(description="Improvement recommendations")
    summary: str = Field(description="2-3 sentence summary of ATS compatibility")
    missing_keywords: List[str] = Field(description="Important industry keywords missing from the resume")
    keyword_suggestions: List[str] = Field(description="Specific keywords to add for better ATS matching")


_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    google_api_key=settings.google_api_key,
    model_kwargs={"generation_config": {"seed": 42}},
)

_structured_llm = _llm.with_structured_output(QualitativeAnalysis)

_QUALITATIVE_PROMPT = """You are an expert ATS (Applicant Tracking System) consultant. Review the resume below and provide qualitative analysis.

Focus ONLY on:
1. Critical issues that would cause ATS rejection
2. Warnings about formatting or content problems
3. Specific, actionable suggestions for improvement
4. A brief summary of ATS compatibility
5. Important industry keywords that are MISSING from this resume
6. Specific keyword suggestions the candidate should add

Do NOT assign any numeric scores. Do NOT calculate any ratings. Only provide qualitative analysis.

Resume:
{resume_text}
"""


def ats_optimization_node(state: AgentState) -> AgentState:
    resume_text = state.get("resume_text", "")

    if not resume_text.strip():
        return {**state, "error": "No resume found. Upload a resume first."}

    # ── Step 1: Python computes deterministic scores ──
    scores = compute_ats_scores(resume_text)

    # ── Step 2: Gemini provides qualitative analysis only ──
    try:
        qualitative = _structured_llm.invoke(
            _QUALITATIVE_PROMPT.format(resume_text=resume_text)
        )
    except Exception as e:
        return {**state, "error": f"ATS qualitative analysis failed: {str(e)}"}

    # ── Step 3: Combine into final output ──
    output = ATSOutput(
        format_score=scores["format_score"],
        keyword_score=scores["keyword_score"],
        content_score=scores["content_score"],
        completeness_score=scores["completeness_score"],
        readability_score=scores["readability_score"],
        ats_compatibility_score=scores["ats_score"],
        critical_issues=qualitative.critical_issues,
        warnings=qualitative.warnings,
        suggestions=qualitative.suggestions,
        summary=qualitative.summary,
        missing_keywords=qualitative.missing_keywords,
        keyword_suggestions=qualitative.keyword_suggestions,
    )

    data = {
        **scores,
        "critical_issues": [i.model_dump() for i in qualitative.critical_issues],
        "warnings": [i.model_dump() for i in qualitative.warnings],
        "suggestions": [i.model_dump() for i in qualitative.suggestions],
        "summary": qualitative.summary,
        "missing_keywords": qualitative.missing_keywords,
        "keyword_suggestions": qualitative.keyword_suggestions,
    }

    return {
        **state,
        "analysis_results": {**state.get("analysis_results", {}), "ats": data},
        "output": output,
    }
