import json
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.types import AgentState
from app.schemas.job_matching import JobMatchingOutput, SkillGap

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
    google_api_key=settings.google_api_key,
)


def job_matching_node(state: AgentState) -> AgentState:
    resume_text = state.get("resume_text", "")
    job_description = state.get("job_description", "")

    if not resume_text or not job_description:
        return {**state, "error": "Both resume_text and job_description are required"}

    prompt = f"""You are a job matching expert. Analyze how well the resume matches the job description.

Resume:
{resume_text}

Job Description:
{job_description}

Return ONLY valid JSON in this exact format:
{{
  "match_percentage": <0-100>,
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "skill_gaps": [
    {{"skill": "Python", "category": "technical", "importance": "high"}}
  ],
  "overall_assessment": "2-3 sentence assessment"
}}"""

    try:
        response = llm.invoke(prompt).content.strip()
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
        output = JobMatchingOutput(**data)
    except Exception as e:
        return {**state, "error": f"Job matching failed: {str(e)}"}

    return {
        **state,
        "analysis_results": {**state.get("analysis_results", {}), "job_matching": data},
        "output": output,
    }
