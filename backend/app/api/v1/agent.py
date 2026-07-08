from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any, Literal
from app.agents.supervisor import supervisor_agent
from app.agents.types import AgentState
from app.state.session_store import SESSION_STORE

router = APIRouter(prefix="/agent", tags=["Agent"])

AgentIntent = Literal[
    "analyze", "chat", "job_match", "ats", "cover_letter",
    "interview_prep", "mock_interview", "career_path", "enhance"
]


class AgentInvokeRequest(BaseModel):
    session_id: str
    intent: AgentIntent = "analyze"
    resume_text: str = ""
    job_description: str = ""
    user_message: str = ""
    chat_history: List[dict] = []


class AgentInvokeResponse(BaseModel):
    session_id: str
    active_agent: str
    output: Any = None
    error: str = ""
    analysis_results: dict = {}
    chat_history: List[dict] = []


@router.post("/invoke", response_model=AgentInvokeResponse)
def invoke_agent(request: AgentInvokeRequest):
    session = SESSION_STORE.get(request.session_id, {})

    initial_state: AgentState = {
        "resume_text": request.resume_text or session.get("resume_text", ""),
        "resume_data": session.get("resume_data", {}),
        "job_description": request.job_description or session.get("job_description", ""),
        "chat_history": request.chat_history or session.get("chat_history", []),
        "user_id": session.get("user_id", ""),
        "session_id": request.session_id,
        "active_agent": request.intent,
        "analysis_results": session.get("analysis_results", {}),
        "output": None,
        "user_message": request.user_message,
        "error": "",
    }

    try:
        result = supervisor_agent.invoke(initial_state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent invocation failed: {str(e)}")

    SESSION_STORE[request.session_id] = {
        "resume_text": result.get("resume_text", initial_state["resume_text"]),
        "resume_data": result.get("resume_data", initial_state["resume_data"]),
        "job_description": result.get("job_description", initial_state["job_description"]),
        "chat_history": result.get("chat_history", initial_state["chat_history"]),
        "user_id": result.get("user_id", initial_state["user_id"]),
        "analysis_results": result.get("analysis_results", initial_state["analysis_results"]),
    }

    return AgentInvokeResponse(
        session_id=request.session_id,
        active_agent=result.get("active_agent", request.intent),
        output=result.get("output"),
        error=result.get("error", ""),
        analysis_results=result.get("analysis_results", {}),
        chat_history=result.get("chat_history", initial_state["chat_history"]),
    )
