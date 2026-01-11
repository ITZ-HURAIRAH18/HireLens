from fastapi import APIRouter
from app.api.v1 import health, resume, chat

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
    prefix="/chat",
    tags=["Chat"]
)
