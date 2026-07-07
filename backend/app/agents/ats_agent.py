import json
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.types import AgentState
from app.schemas.ats import ATSOutput, ATSFix

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
    google_api_key=settings.google_api_key,
)


def ats_optimization_node(state: AgentState) -> AgentState:
    resume_text = state.get("resume_text", "")

    if not resume_text:
        return {**state, "error": "resume_text is required"}

    prompt = f"""You are an ATS (Applicant Tracking System) compatibility expert. Analyze this resume for ATS parsing issues.

Resume:
{resume_text}

Return ONLY valid JSON in this exact format:
{{
  "ats_compatibility_score": <0-100>,
  "critical_issues": [
    {{"issue": "Missing standard section headings", "severity": "critical", "recommendation": "Use standard headings like 'Work Experience' instead of 'My Journey'"}}
  ],
  "warnings": [
    {{"issue": "Bullet points use special characters", "severity": "warning", "recommendation": "Use standard bullet points (- or *)"}}
  ],
  "suggestions": [
    {{"issue": "Consider adding more keywords", "severity": "suggestion", "recommendation": "Add industry-specific keywords from job descriptions"}}
  ],
  "summary": "2-3 sentence summary of ATS compatibility"
}}"""

    try:
        response = llm.invoke(prompt).content.strip()
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
        output = ATSOutput(**data)
    except Exception as e:
        return {**state, "error": f"ATS analysis failed: {str(e)}"}

    return {
        **state,
        "analysis_results": {**state.get("analysis_results", {}), "ats": data},
        "output": output,
    }
