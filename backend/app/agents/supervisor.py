from typing import Literal
from langgraph.graph import StateGraph, END
from app.agents.types import AgentState
from app.agents.resume_agent import analyze_resume_node
from app.agents.resume_chat_agent import chat_node
from app.agents.job_matching_agent import job_matching_node
from app.agents.ats_agent import ats_optimization_node
from app.agents.cover_letter_agent import cover_letter_node
from app.agents.interview_agent import interview_prep_node, mock_interview_node
from app.agents.career_path_agent import career_path_node


def router_node(state: AgentState) -> AgentState:
    intent = state.get("active_agent", "analyze")
    return {"active_agent": intent}


def should_continue(state: AgentState) -> Literal[
    "analyze", "chat", "job_match", "ats", "cover_letter",
    "interview_prep", "mock_interview", "career_path", "__end__"
]:
    agent = state.get("active_agent", "analyze")
    valid_agents = [
        "analyze", "chat", "job_match", "ats", "cover_letter",
        "interview_prep", "mock_interview", "career_path"
    ]
    return agent if agent in valid_agents else "__end__"


def build_supervisor():
    graph = StateGraph(AgentState)

    graph.add_node("router", router_node)
    graph.add_node("analyze", analyze_resume_node)
    graph.add_node("chat", chat_node)
    graph.add_node("job_match", job_matching_node)
    graph.add_node("ats", ats_optimization_node)
    graph.add_node("cover_letter", cover_letter_node)
    graph.add_node("interview_prep", interview_prep_node)
    graph.add_node("mock_interview", mock_interview_node)
    graph.add_node("career_path", career_path_node)

    graph.set_entry_point("router")
    graph.add_conditional_edges(
        "router",
        should_continue,
        {
            "analyze": "analyze",
            "chat": "chat",
            "job_match": "job_match",
            "ats": "ats",
            "cover_letter": "cover_letter",
            "interview_prep": "interview_prep",
            "mock_interview": "mock_interview",
            "career_path": "career_path",
            "__end__": END,
        },
    )

    for agent in ["analyze", "chat", "job_match", "ats", "cover_letter", "interview_prep", "mock_interview", "career_path"]:
        graph.add_edge(agent, END)

    return graph.compile()


supervisor_agent = build_supervisor()
