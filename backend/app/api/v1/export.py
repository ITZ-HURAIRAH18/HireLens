import re
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/export", tags=["Export"])

SECTION_HEADINGS = [
    "professional summary", "summary", "profile", "objective", "career objective",
    "work experience", "experience", "professional experience", "employment", "work history",
    "education", "academic background", "academic",
    "technical skills", "skills", "core competencies", "competencies", "key skills",
    "certifications", "certificates", "licenses",
    "projects", "project",
    "languages",
    "interests", "activities", "volunteer",
    "publications", "awards", "honors",
    "contact", "personal information",
]


class ExportRequest(BaseModel):
    content: str
    title: str = "document"
    format: str = "pdf"


def _is_section_heading(line):
    stripped = line.strip()
    lower = re.sub(r'[^a-z\s]', '', stripped.lower()).strip()
    for heading in SECTION_HEADINGS:
        if lower == heading or lower.startswith(heading):
            return True
    return False


def _build_resume_story(content, styles):
    lines = content.split("\n")
    story = []

    contact_lines = []
    sections = []
    current_heading = None
    current_body = []

    for line in lines:
        stripped = line.strip()
        if _is_section_heading(stripped):
            if current_heading:
                sections.append((current_heading, "\n".join(current_body).strip()))
            elif current_body:
                contact_lines = current_body
            current_heading = stripped
            current_body = []
        else:
            current_body.append(line)

    if current_heading:
        sections.append((current_heading, "\n".join(current_body).strip()))
    elif current_body:
        contact_lines = current_body

    header_style = ParagraphStyle(
        "CVName",
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=4,
        textColor=HexColor("#0F1115"),
    )
    contact_style = ParagraphStyle(
        "CVContact",
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        spaceAfter=2,
        textColor=HexColor("#4B5563"),
    )
    section_heading_style = ParagraphStyle(
        "CVSectionHeading",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=13,
        spaceBefore=12,
        spaceAfter=2,
        textColor=HexColor("#0F1115"),
    )
    body_style = ParagraphStyle(
        "CVBody",
        fontName="Times-Roman",
        fontSize=10,
        leading=13,
        alignment=TA_JUSTIFY,
        spaceAfter=3,
        textColor=HexColor("#2D3748"),
    )
    bullet_style = ParagraphStyle(
        "CVBullet",
        fontName="Times-Roman",
        fontSize=10,
        leading=13,
        alignment=TA_LEFT,
        spaceAfter=2,
        leftIndent=14,
        bulletIndent=4,
        textColor=HexColor("#2D3748"),
    )
    subheading_style = ParagraphStyle(
        "CVSubheading",
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=13,
        spaceBefore=6,
        spaceAfter=1,
        textColor=HexColor("#1A202C"),
    )
    date_style = ParagraphStyle(
        "CVDate",
        fontName="Helvetica-Oblique",
        fontSize=9.5,
        leading=12,
        spaceAfter=1,
        textColor=HexColor("#4A5568"),
    )

    if contact_lines:
        contact_text = contact_lines[0].strip()
        if contact_text:
            story.append(Paragraph(contact_text, header_style))
        extra = [l.strip() for l in contact_lines[1:] if l.strip()]
        if extra:
            story.append(Paragraph(" | ".join(extra), contact_style))
        story.append(Spacer(1, 4))
        story.append(Table(
            [[""]],
            colWidths=[6.5 * inch],
            rowHeights=[1.5],
            style=TableStyle([
                ("LINEBELOW", (0, 0), (-1, -1), 1.5, HexColor("#2a2a2a")),
            ]),
        ))
        story.append(Spacer(1, 8))

    for heading, body in sections:
        story.append(Paragraph(heading, section_heading_style))
        story.append(Table(
            [[""]],
            colWidths=[6.5 * inch],
            rowHeights=[0.8],
            style=TableStyle([
                ("LINEBELOW", (0, 0), (-1, -1), 0.8, HexColor("#2a2a2a")),
            ]),
        ))
        story.append(Spacer(1, 4))

        for line in body.split("\n"):
            stripped = line.strip()
            if not stripped:
                continue

            if stripped.startswith("•") or stripped.startswith("-") or stripped.startswith("*"):
                text = re.sub(r'^[•\-*]\s*', '', stripped)
                story.append(Paragraph(f"<bullet>&bull;</bullet>{text}", bullet_style))
            elif re.match(r'^\d+[.)]\s', stripped):
                text = re.sub(r'^\d+[.)]\s*', '', stripped)
                story.append(Paragraph(f"<bullet>&bull;</bullet>{text}", bullet_style))
            elif re.match(r'^[A-Z][A-Z\s]{2,}$', stripped) and len(stripped) < 60:
                story.append(Paragraph(stripped, subheading_style))
            elif re.match(r'^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|spring|summer|fall|winter|present|current|\d{4})', stripped, re.I):
                story.append(Paragraph(stripped, date_style))
            else:
                story.append(Paragraph(stripped, body_style))

        story.append(Spacer(1, 4))

    return story


@router.post("/resume")
def export_resume(request: ExportRequest, current_user: User = Depends(get_current_user)):
    if request.format == "pdf":
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=0.7 * inch,
            rightMargin=0.7 * inch,
            topMargin=0.6 * inch,
            bottomMargin=0.6 * inch,
        )
        styles = getSampleStyleSheet()
        story = _build_resume_story(request.content, styles)
        doc.build(story)
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={request.title}.pdf"},
        )
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
