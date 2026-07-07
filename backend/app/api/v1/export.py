from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/export", tags=["Export"])


class ExportRequest(BaseModel):
    content: str
    title: str = "document"
    format: str = "pdf"


@router.post("/resume")
def export_resume(request: ExportRequest, current_user: User = Depends(get_current_user)):
    if request.format == "pdf":
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        for line in request.content.split("\n"):
            if line.strip():
                story.append(Paragraph(line, styles["Normal"]))
                story.append(Spacer(1, 6))
        doc.build(story)
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={request.title}.pdf"})
    raise HTTPException(status_code=400, detail="Unsupported format")


@router.post("/cover-letter")
def export_cover_letter(request: ExportRequest, current_user: User = Depends(get_current_user)):
    if request.format == "pdf":
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        for line in request.content.split("\n"):
            if line.strip():
                story.append(Paragraph(line, styles["Normal"]))
                story.append(Spacer(1, 6))
        doc.build(story)
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={request.title}.pdf"})
    raise HTTPException(status_code=400, detail="Unsupported format")


@router.post("/report")
def export_report(
    request: ExportRequest,
    current_user: User = Depends(get_current_user),
):
    if request.format == "pdf":
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = [Paragraph("HireLens - Career Report", styles["Title"]), Spacer(1, 12)]
        for line in request.content.split("\n"):
            if line.strip():
                story.append(Paragraph(line, styles["Normal"]))
                story.append(Spacer(1, 6))
        doc.build(story)
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=hirelens-report.pdf"})
    raise HTTPException(status_code=400, detail="Unsupported format")
