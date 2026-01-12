from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

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
    """
    Conversational agent that talks about resume analysis
    """

    system_prompt = f"""
You are a professional resume advisor and ATS expert.

Here is the resume analysis:
Summary: {analysis.get("summary")}
Strengths: {analysis.get("strengths")}
Weaknesses: {analysis.get("weaknesses")}
Improvement Tips: {analysis.get("improvement_tips")}
Suggested Roles: {analysis.get("suggested_roles")}
ATS Score: {analysis.get("ats_score")}/100

Rules:
- Answer only based on the resume analysis
- Be clear, professional, and actionable
- If asked to improve, give concrete steps
"""

    messages = [
        {"role": "system", "content": system_prompt}
    ]

    # add chat history
    for msg in chat_history:
        messages.append(msg)

    # current user message
    messages.append({"role": "user", "content": user_message})

    response = llm.invoke(messages)
    return response.content.strip()
