import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import tempfile
import os
import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.api.v1.chat import SESSION_STORE
from app.services.resume_parser import (
    extract_text_from_pdf,
    extract_text_from_docx,
    parse_resume_text
)
from app.schemas.resume import ResumeResponse
from app.agents.resume_agent import resume_agent
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import AnalysisResult
from sqlalchemy.orm import Session


class ResumeListItem(BaseModel):
    id: str
    filename: str
    resume_text: str
    created_at: Optional[datetime] = None

router = APIRouter(tags=["Resume"])


@router.get("/list", response_model=List[ResumeListItem])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.asc())
        .all()
    )
    return [
        ResumeListItem(
            id=str(r.id),
            filename=r.original_filename,
            resume_text=r.resume_text or "",
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF or DOCX allowed")

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        file_path = tmp.name

    try:
        if file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(file_path)
        else:
            text = extract_text_from_docx(file_path)

        structured_resume = parse_resume_text(text)
        return {"message": "Resume parsed successfully", "data": structured_resume}

    finally:
        os.remove(file_path)


@router.post("/analyze")
async def analyze_resume_with_agent(resume_data: dict):
    if "resume_text" not in resume_data:
        raise HTTPException(status_code=400, detail="resume_text key is required")

    result = resume_agent.invoke({"resume_text": resume_data["resume_text"]})
    return result["output"]


@router.post("/upload-and-analyze")
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF or DOCX allowed")

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        file_path = tmp.name

    try:
        resume_text = (
            extract_text_from_pdf(file_path)
            if file.filename.endswith(".pdf")
            else extract_text_from_docx(file_path)
        )

        parsed_resume = parse_resume_text(resume_text)
        agent_result = resume_agent.invoke({"resume_text": resume_text})
        ai_analysis = agent_result["output"].model_dump()

        resume_record = Resume(
            user_id=current_user.id,
            original_filename=file.filename,
            resume_text=resume_text,
            parsed_data=json.dumps(parsed_resume.model_dump() if hasattr(parsed_resume, "model_dump") else parsed_resume),
        )
        db.add(resume_record)
        db.flush()

        analysis = AnalysisResult(
            resume_id=resume_record.id,
            analysis_type="resume_analysis",
            result_data=json.dumps(ai_analysis),
            score=ai_analysis.get("ats_score"),
        )
        db.add(analysis)

        current_user.analyses_count = (current_user.analyses_count or 0) + 1
        db.commit()
        db.refresh(resume_record)

        session_id = str(uuid.uuid4())
        SESSION_STORE[session_id] = {
            "analysis": ai_analysis,
            "resume_text": resume_text,
            "chat_history": []
        }

        return {
            "message": "Resume uploaded & analyzed successfully",
            "session_id": session_id,
            "resume_id": str(resume_record.id),
            "parsed_resume": parsed_resume,
            "ai_analysis": ai_analysis,
        }
    finally:
        os.remove(file_path)
