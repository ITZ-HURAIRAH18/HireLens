from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="Production-level Agentic AI Resume Checker Backend"
    )

    # Configure CORS with regex pattern for Vercel deployments
    # This regex allows:
    # - localhost with any port (for local development)
    # - All *.vercel.app domains (for Vercel deployments including preview branches)
    cors_regex = r"https://.*\.vercel\.app|http://localhost(:\d+)?"
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=cors_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )

    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
# poetry run uvicorn app.main:app --reload
