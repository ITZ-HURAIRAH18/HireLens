import json
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.types import AgentState
from app.schemas.ats import ATSOutput, ATSFix

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    google_api_key=settings.google_api_key,
    model_kwargs={"generation_config": {"seed": 42}},
)

_ATS_RUBRIC = """
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


def ats_optimization_node(state: AgentState) -> AgentState:
    resume_text = state.get("resume_text", "")

    if not resume_text:
        return {**state, "error": "resume_text is required"}

    scoring_prompt = f"""You are an expert ATS compatibility scoring system.
{_ATS_RUBRIC}

For each criterion, assign a score 0-100. The final ats_compatibility_score is the weighted sum.

Then analyze ATS parsing issues and return ONLY valid JSON with no markdown formatting:

{{
  "ats_compatibility_score": <computed weighted average 0-100>,
  "format_score": <0-100>,
  "keyword_score": <0-100>,
  "content_score": <0-100>,
  "completeness_score": <0-100>,
  "readability_score": <0-100>,
  "critical_issues": [
    {{"issue": "description", "severity": "critical", "recommendation": "fix"}}
  ],
  "warnings": [
    {{"issue": "description", "severity": "warning", "recommendation": "fix"}}
  ],
  "suggestions": [
    {{"issue": "description", "severity": "suggestion", "recommendation": "fix"}}
  ],
  "summary": "2-3 sentence summary of ATS compatibility"
}}

Resume:
{resume_text}
"""

    try:
        response = _llm.invoke(scoring_prompt).content.strip()
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
