from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.resume_chat_agent import chat_with_resume_agent
from app.state.session_store import SESSION_STORE
router = APIRouter()




class ChatRequest(BaseModel):
    session_id: str
    message: str


@router.post("/")
def chat_with_resume(request: ChatRequest):
    if request.session_id not in SESSION_STORE:
        raise HTTPException(status_code=404, detail="Session not found")

    session = SESSION_STORE[request.session_id]

    reply = chat_with_resume_agent(
        analysis=session["analysis"],
        chat_history=session["chat_history"],
        user_message=request.message
    )

    session["chat_history"].append({"role": "user", "content": request.message})
    session["chat_history"].append({"role": "assistant", "content": reply})

    return {
        "reply": reply,
        "chat_history": session["chat_history"]
    }