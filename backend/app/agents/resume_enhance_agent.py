import json
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.types import AgentState

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    google_api_key=settings.google_api_key,
)

ENHANCE_PROMPT = """You are a professional resume writer and ATS optimization expert. Rewrite the resume below to make it significantly stronger.

Rules:
- Use strong action verbs and quantify achievements with metrics wherever possible
- Improve formatting for ATS compatibility (standard section headings, clean structure)
- Add relevant industry keywords naturally
- Fix grammar, spelling, and improve phrasing
- Keep all factual information accurate — do NOT fabricate experience
- Output as a complete, ready-to-use resume text
- Maintain the same sections (contact, summary, experience, education, skills, projects)

Return ONLY valid JSON with no markdown formatting:
{{
  "enhanced_text": "the complete rewritten resume...",
  "changes_summary": "Bullet-point summary of key improvements made",
  "keywords_added": ["keyword1", "keyword2"]
}}

Original Resume:
{resume_text}
"""


def enhance_resume_node(state: AgentState) -> AgentState:
    resume_text = state.get("resume_text", "")
    if not resume_text.strip():
        return {**state, "error": "No resume found. Upload a resume first."}

    prompt = ENHANCE_PROMPT.format(resume_text=resume_text)

    try:
        response = _llm.invoke(prompt).content.strip()
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
    except Exception as e:
        return {**state, "error": f"Resume enhancement failed: {str(e)}"}

    return {
        **state,
        "output": data,
    }
