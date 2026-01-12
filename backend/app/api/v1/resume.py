from app.api.v1.chat import SESSION_STORE
from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os
import uuid

from app.services.resume_parser import (
    extract_text_from_pdf,
    extract_text_from_docx,
    parse_resume_text
)
from app.schemas.resume import ResumeResponse
from app.agents.resume_agent import resume_agent
router = APIRouter(prefix="/resume", tags=["Resume"])


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
    """
    Send raw resume text to agent for analysis.
    """
    if "resume_text" not in resume_data:
        raise HTTPException(status_code=400, detail="resume_text key is required")

    result = resume_agent.invoke({"resume_text": resume_data["resume_text"]})
    return result["output"]




@router.post("/upload-and-analyze")
async def upload_and_analyze_resume(file: UploadFile = File(...)):
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

        session_id = str(uuid.uuid4())
        SESSION_STORE[session_id] = {
            "analysis": agent_result["output"].dict(),
            "chat_history": []
        }

        return {
            "message": "Resume uploaded & analyzed successfully",
            "session_id": session_id,
            "parsed_resume": parsed_resume,
            "ai_analysis": agent_result["output"]
        }

    finally:
        os.remove(file_path)