from fastapi import APIRouter
from app.api.v1 import health, resume, chat
from fastapi import APIRouter, HTTPException
from typing import Dict, List
from app.agents.resume_chat_agent import chat_with_resume_agent
api_router = APIRouter()

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"]
)

api_router.include_router(
    resume.router,
    prefix="/resume",
    tags=["Resume"]
)

api_router.include_router(
    chat.router,
    prefix="/resume/chat", 
    tags=["Resume Chat"]
)
