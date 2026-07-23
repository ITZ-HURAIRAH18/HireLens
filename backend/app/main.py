import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        if not os.getenv("VERCEL"):
            Base.metadata.create_all(bind=engine)
    except Exception:
        pass
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="2.0.0",
        description="Production-level Multi-Agent AI Career Platform Backend",
        lifespan=lifespan,
    )

    cors_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://hire-lensz.vercel.app",
        "https://hire-lens-five.vercel.app",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )

    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()

# Run with: uvicorn app.main:app --reload
# Or: python run.py
