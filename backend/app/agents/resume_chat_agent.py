from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings
from app.agents.types import AgentState

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4,
    google_api_key=settings.google_api_key,
)


def chat_with_resume_agent(
    analysis: dict,
    chat_history: list,
    user_message: str
) -> str:
    system_prompt = f"""
You are a professional resume advisor and ATS expert.

Resume Analysis:
Summary: {analysis.get("summary")}
Strengths: {analysis.get("strengths")}
Weaknesses: {analysis.get("weaknesses")}
Improvements: {analysis.get("improvement_tips")}
Suggested Roles: {analysis.get("suggested_roles")}
ATS Score: {analysis.get("ats_score")}/100

Rules:
- Answer ONLY using this analysis
- Be professional and actionable
"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(chat_history)
    messages.append({"role": "user", "content": user_message})

    response = llm.invoke(messages)
    return response.content.strip()


def chat_node(state: AgentState) -> AgentState:
    if not state.get("resume_text", "").strip():
        return {**state, "error": "No resume found. Upload a resume first."}
    analysis = state.get("analysis_results", {})
    chat_history = state.get("chat_history", [])
    user_message = state.get("user_message", "")

    reply = chat_with_resume_agent(analysis, chat_history, user_message)

    updated_history = list(chat_history)
    updated_history.append({"role": "user", "content": user_message})
    updated_history.append({"role": "assistant", "content": reply})

    return {
        "chat_history": updated_history,
        "output": {"reply": reply, "chat_history": updated_history},
    }
