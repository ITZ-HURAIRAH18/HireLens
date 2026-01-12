from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import TypedDict
from app.schemas.agent import ResumeAgentOutput
from app.core.config import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    google_api_key=settings.google_api_key
)

class ResumeState(TypedDict):
    resume_text: str
    output: ResumeAgentOutput

# -------- Nodes -------- #
def summarize_resume(state: ResumeState):
    prompt = f"""
Summarize the following resume professionally:

{state['resume_text']}
"""
    summary = llm.invoke(prompt).content
    return {"summary": summary}


def analyze_resume(state: ResumeState):
    prompt = f"""
Analyze this resume and provide:
- strengths
- weaknesses
- suggested job roles
- improvement tips

Resume:
{state['resume_text']}
"""
    response = llm.invoke(prompt).content

    return {
        "output": ResumeAgentOutput(
            summary=state["summary"],
            strengths=["Strong technical background"],
            weaknesses=["Needs clearer impact metrics"],
            improvement_tips=["Add measurable achievements"],
            suggested_roles=["Backend Developer", "AI Engineer"]
        )
    }

# -------- Graph -------- #
graph = StateGraph(ResumeState)
graph.add_node("summarize", summarize_resume)
graph.add_node("analyze", analyze_resume)
graph.set_entry_point("summarize")
graph.add_edge("summarize", "analyze")
graph.add_edge("analyze", END)

resume_agent = graph.compile()
