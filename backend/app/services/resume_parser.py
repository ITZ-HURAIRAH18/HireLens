import pdfplumber
from docx import Document
from fastapi import UploadFile, HTTPException


def parse_pdf(file: UploadFile) -> str:
    try:
        text = ""
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text.strip()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to parse PDF file")


def parse_docx(file: UploadFile) -> str:
    try:
        document = Document(file.file)
        text = "\n".join([para.text for para in document.paragraphs])
        return text.strip()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to parse DOCX file")


def extract_resume_text(file: UploadFile) -> str:
    if file.filename.endswith(".pdf"):
        return parse_pdf(file)
    elif file.filename.endswith(".docx"):
        return parse_docx(file)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload PDF or DOCX only."
        )
