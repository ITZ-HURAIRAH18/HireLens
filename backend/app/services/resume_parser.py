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

    name = lines[0] if lines else None
    email = next((l for l in lines if "@" in l), None)
    phone = next((l for l in lines if re.search(r"\+?\d{10,13}", l)), None)

    skills, experience, education, projects = [], [], [], []
    current_section = None

    for line in lines:
        lower = line.lower()

        if "skill" in lower:
            current_section = "skills"
            continue
        elif "experience" in lower:
            current_section = "experience"
            continue
        elif "education" in lower:
            current_section = "education"
            continue
        elif "project" in lower:
            current_section = "projects"
            continue

        if current_section == "skills":
            skills.extend([s.strip() for s in line.split(",") if len(s) < 30])

        elif current_section == "education" and len(education) < 3:
            education.append(line)

        elif current_section == "experience" and len(experience) < 3:
            experience.append(line)

        elif current_section == "projects" and len(projects) < 5:
            projects.append(line.split("—")[0].strip())

    return ResumeSections(
        name=name,
        email=email,
        phone=phone,
        skills=list(set(skills))[:10],
        experience=experience,
        education=education,
        projects=projects
    )
