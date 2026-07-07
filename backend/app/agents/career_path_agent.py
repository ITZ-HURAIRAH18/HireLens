import json
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.types import AgentState
from app.schemas.career_path import CareerPathOutput, SkillGap, Certification, LearningMilestone

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    google_api_key=settings.google_api_key,
)


def career_path_node(state: AgentState) -> AgentState:
    resume_text = state.get("resume_text", "")
    job_description = state.get("job_description", "")
    target_role = job_description if job_description else "senior role in your field"

    if not resume_text:
        return {**state, "error": "resume_text is required"}

    prompt = f"""You are a career development expert. Analyze the resume and create a career advancement roadmap.

Resume:
{resume_text}

Target Role: {target_role}

Return ONLY valid JSON in this exact format:
{{
  "target_role": "{target_role}",
  "skill_gaps": [
    {{"skill": "Cloud Architecture", "current_level": "beginner", "required_level": "advanced", "priority": "high"}}
  ],
  "certifications": [
    {{"name": "AWS Solutions Architect", "provider": "Amazon", "estimated_time": "3 months", "relevance": "highly relevant"}}
  ],
  "learning_roadmap": [
    {{"phase": "Phase 1: Foundation", "duration": "1-2 months", "focus": "Core skill building", "skills": ["Skill A", "Skill B"]}}
  ],
  "estimated_timeline": "6-12 months to reach target role"
}}"""

    try:
        response = llm.invoke(prompt).content.strip()
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
        output = CareerPathOutput(**data)
    except Exception as e:
        return {**state, "error": f"Career path analysis failed: {str(e)}"}

    return {
        **state,
        "analysis_results": {**state.get("analysis_results", {}), "career_path": data},
        "output": output,
    }
