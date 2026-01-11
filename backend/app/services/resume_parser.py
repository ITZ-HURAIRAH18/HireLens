import pdfplumber
from docx import Document
import re
from app.schemas.resume import ResumeSections


def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])


def parse_resume_text(text: str) -> ResumeSections:
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    email = next((l for l in lines if "@" in l), None)
    phone = next((l for l in lines if re.search(r"\+?\d{10,13}", l)), None)
    name = lines[0] if lines else None

    skills, experience, education, projects = [], [], [], []
    current_section = None

    for line in lines:
        lower = line.lower()

        if "skill" in lower:
            current_section = "skills"
            continue
        if "experience" in lower:
            current_section = "experience"
            continue
        if "education" in lower:
            current_section = "education"
            continue
        if "project" in lower:
            current_section = "projects"
            continue

        if current_section == "skills":
            skills.append(line)
        elif current_section == "experience":
            experience.append(line)
        elif current_section == "education":
            education.append(line)
        elif current_section == "projects":
            projects.append(line)

    return ResumeSections(
        name=name,
        email=email,
        phone=phone,
        skills=skills,
        experience=experience,
        education=education,
        projects=projects
    )
