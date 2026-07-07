from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from app.core.security import get_current_user
from app.models.user import User
from app.services.streaming import stream_chat_response
from app.state.session_store import SESSION_STORE

router = APIRouter(prefix="/stream", tags=["Streaming"])


class StreamRequest(BaseModel):
    session_id: str
    message: str
    system_prompt: str = ""


@router.post("/chat")
async def stream_chat(
    request: StreamRequest,
    current_user: User = Depends(get_current_user),
):
    session = SESSION_STORE.get(request.session_id, {})
    analysis = session.get("analysis_results", {})

    system_prompt = request.system_prompt or f"""You are a professional resume advisor and ATS expert.
Resume Analysis:
Summary: {analysis.get('summary')}
Strengths: {analysis.get('strengths')}
Weaknesses: {analysis.get('weaknesses')}
ATS Score: {analysis.get('ats_score')}/100

Rules:
- Answer ONLY using this analysis
- Be professional and actionable"""

    chat_history = session.get("chat_history", [])

    return EventSourceResponse(
        stream_chat_response(system_prompt, chat_history, request.message)
    )
