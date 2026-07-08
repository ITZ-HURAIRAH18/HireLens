import json
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.types import AgentState
from app.schemas.interview import InterviewPrepOutput, InterviewQuestion, MockInterviewFeedback

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4,
    google_api_key=settings.google_api_key,
)


def interview_prep_node(state: AgentState) -> AgentState:
    resume_text = state.get("resume_text", "")
    job_description = state.get("job_description", "")
    target_role = job_description.split("\n")[0] if job_description else "the target role"

    if not resume_text.strip():
        return {**state, "error": "No resume found. Upload a resume first."}

    prompt = f"""You are an interview preparation expert. Generate likely interview questions based on the resume and target role.

Resume:
{resume_text}

Target Role: {target_role}
{chr(10) + 'Job Description:' + chr(10) + job_description if job_description else ''}

Return ONLY valid JSON in this exact format:
{{
  "target_role": "{target_role}",
  "questions": [
    {{"category": "behavioral", "question": "Tell me about a time you led a project...", "tips": "Use the STAR method: Situation, Task, Action, Result"}},
    {{"category": "technical", "question": "What is your experience with...", "tips": "Be specific about tools and outcomes"}},
    {{"category": "role-specific", "question": "How would you approach...", "tips": "Relate your answer to the job description"}}
  ],
  "preparation_tips": "2-3 sentence preparation advice"
}}"""

    try:
        response = llm.invoke(prompt).content.strip()
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
        output = InterviewPrepOutput(**data)
    except Exception as e:
        return {**state, "error": f"Interview prep failed: {str(e)}"}

    return {
        **state,
        "analysis_results": {**state.get("analysis_results", {}), "interview_prep": data},
        "output": output,
    }


def mock_interview_node(state: AgentState) -> AgentState:
    user_message = state.get("user_message", "")
    context = state.get("analysis_results", {}).get("interview_prep", {})

    if not user_message:
        return {**state, "error": "user_message is required for mock interview"}

    prompt = f"""You are a mock interview coach. Evaluate the user's answer to an interview question.

Context - Target Role: {context.get('target_role', 'the role')}

User's Answer:
{user_message}

Return ONLY valid JSON in this exact format:
{{
  "clarity_score": <0-100>,
  "structure_score": <0-100>,
  "star_method_score": <0-100>,
  "relevance_score": <0-100>,
  "feedback": "Detailed 2-3 sentence feedback on the answer",
  "improved_answer": "A polished version of their answer using STAR method"
}}"""

    try:
        response = llm.invoke(prompt).content.strip()
        if response.startswith("```"):
            response = response.replace("```json", "").replace("```", "").strip()
        data = json.loads(response)
        output = MockInterviewFeedback(**data)
    except Exception as e:
        return {**state, "error": f"Mock interview feedback failed: {str(e)}"}

    return {
        **state,
        "output": output,
    }
