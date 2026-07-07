from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import AnalysisResult

router = APIRouter(tags=["Dashboard"])


class RecentAnalysis(BaseModel):
    filename: str
    date: Optional[datetime] = None
    score: Optional[int] = None


class DashboardResponse(BaseModel):
    avg_score: Optional[float] = None
    total_analyses: int = 0
    total_resumes: int = 0
    recent_analyses: List[RecentAnalysis] = []


class HistoryItem(BaseModel):
    filename: str
    date: Optional[datetime] = None
    score: Optional[int] = None


class HistoryResponse(BaseModel):
    items: List[HistoryItem] = []


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume_ids = [
        r.id for r in db.query(Resume.id).filter(Resume.user_id == current_user.id).all()
    ]

    total_resumes = len(resume_ids)
    total_analyses = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.resume_id.in_(resume_ids))
        .count()
        if resume_ids
        else 0
    )
    avg_score = (
        db.query(func.avg(AnalysisResult.score))
        .filter(
            AnalysisResult.resume_id.in_(resume_ids),
            AnalysisResult.score.isnot(None),
        )
        .scalar()
        if resume_ids
        else None
    )

    recent = (
        db.query(AnalysisResult, Resume.original_filename)
        .join(Resume, AnalysisResult.resume_id == Resume.id)
        .filter(Resume.user_id == current_user.id)
        .order_by(AnalysisResult.created_at.desc())
        .limit(10)
        .all()
    )

    recent_analyses = [
        RecentAnalysis(
            filename=filename,
            date=r.created_at,
            score=r.score,
        )
        for r, filename in recent
    ]

    return DashboardResponse(
        avg_score=round(avg_score, 1) if avg_score is not None else None,
        total_analyses=total_analyses,
        total_resumes=total_resumes,
        recent_analyses=recent_analyses,
    )


@router.get("/history", response_model=HistoryResponse)
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(AnalysisResult, Resume.original_filename)
        .join(Resume, AnalysisResult.resume_id == Resume.id)
        .filter(Resume.user_id == current_user.id)
        .order_by(AnalysisResult.created_at.desc())
        .all()
    )

    items = [
        HistoryItem(
            filename=filename,
            date=r.created_at,
            score=r.score,
        )
        for r, filename in rows
    ]

    return HistoryResponse(items=items)
