from fastapi import APIRouter, UploadFile, File
from app.services.resume_parser import extract_resume_text

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    resume_text = extract_resume_text(file)

    return {
        "filename": file.filename,
        "characters": len(resume_text),
        "resume_text": resume_text
    }
