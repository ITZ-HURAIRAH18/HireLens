from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.router import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="Production-level Agentic AI Resume Checker Backend"
    )

    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
# poetry run uvicorn app.main:app --reload
