from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os

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

        return {
            "message": "Resume parsed successfully",
            "data": structured_resume
        }

    finally:
        os.remove(file_path)




@router.post("/analyze")
async def analyze_resume_with_agent(resume_data: dict):
    result = resume_agent.invoke({
        "resume_text": str(resume_data)
    })
    return result["output"]
