import json
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.types import AgentState
from app.schemas.cover_letter import CoverLetterOutput, ToneVariant

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4,
    google_api_key=settings.google_api_key,
)


def cover_letter_node(state: AgentState) -> AgentState:
    resume_text = state.get("resume_text", "")
    job_description = state.get("job_description", "")

    if not resume_text:
        return {**state, "error": "No resume found. Upload a resume first."}

    if not job_description:
        prompt = f"""You are a professional cover letter writer. Write a compelling general cover letter for the candidate based on their resume.

The cover letter should highlight the candidate's strengths, experience, and skills. Make it adaptable so they can customize it for any job application.

Resume:
{resume_text}

Return ONLY valid JSON in this exact format:
{{
  "primary_letter": "Full formal cover letter with proper formatting...",
  "tone_variants": [
    {{"tone": "formal", "content": "Formal version..."}},
    {{"tone": "conversational", "content": "Conversational version..."}},
    {{"tone": "concise", "content": "Brief, punchy version..."}}
  ]
}}"""
    else:
        prompt = f"""You are a professional cover letter writer. Write a tailored cover letter based on the resume and job description.

Resume:
{resume_text}

Job Description:
{job_description}

Return ONLY valid JSON in this exact format:
{{
  "primary_letter": "Full formal cover letter with proper formatting...",
  "tone_variants": [
    {{"tone": "formal", "content": "Formal version..."}},
    {{"tone": "conversational", "content": "Conversational version..."}},
    {{"tone": "concise", "content": "Brief, punchy version..."}}
  ]
}}"""

    try:
        response = llm.invoke(prompt).content.strip()
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
        output = CoverLetterOutput(**data)
    except Exception as e:
        return {**state, "error": f"Cover letter generation failed: {str(e)}"}

    return {
        **state,
        "analysis_results": {**state.get("analysis_results", {}), "cover_letter": data},
        "output": output,
    }
