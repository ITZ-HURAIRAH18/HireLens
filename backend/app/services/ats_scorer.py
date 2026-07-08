import re
from typing import List, Dict

ACTION_VERBS = {
    "achieved", "accelerated", "administered", "advised", "allocated", "analyzed",
    "architected", "automated", "built", "chaired", "championed", "closed",
    "coached", "collaborated", "consolidated", "created", "cut", "debugged",
    "decreased", "delivered", "designed", "developed", "devised", "diagnosed",
    "directed", "documented", "doubled", "drove", "earned", "eliminated",
    "enabled", "engineered", "established", "evaluated", "executed", "expanded",
    "expedited", "facilitated", "generated", "grew", "guided", "hired",
    "identified", "implemented", "improved", "increased", "initiated",
    "innovated", "installed", "integrated", "introduced", "invented",
    "investigated", "launched", "led", "managed", "mentored", "merged",
    "negotiated", "optimized", "orchestrated", "organized", "outpaced",
    "overhauled", "oversaw", "pioneered", "planned", "prevented", "produced",
    "programmed", "promoted", "proposed", "proved", "provided", "raised",
    "reached", "realized", "rebuilt", "recommended", "reduced", "reengineered",
    "reorganized", "replaced", "resolved", "restructured", "revamped",
    "revitalized", "saved", "set", "simplified", "slashed", "solved",
    "spearheaded", "standardized", "started", "streamlined", "strengthened",
    "surpassed", "synthesized", "systematized", "transformed", "upgraded",
    "won", "wrote",
}

STANDARD_SECTION_KEYWORDS = [
    "experience", "work experience", "employment", "professional experience",
    "education", "academic", "academic background",
    "skills", "technical skills", "core competencies", "expertise",
    "projects", "professional projects",
    "summary", "professional summary", "profile", "objective",
    "certifications", "certificates",
    "publications", "awards", "honors", "volunteer", "languages",
]

TECHNICAL_KEYWORDS = {
    "python", "java", "javascript", "typescript", "go", "rust", "c++", "c#",
    "sql", "nosql", "mongodb", "postgresql", "mysql", "redis",
    "react", "angular", "vue", "node", "django", "flask", "fastapi",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "git", "linux", "api", "rest", "graphql", "machine learning", "deep learning",
    "data science", "data engineering", "analytics", "nlp", "computer vision",
    "agile", "scrum", "ci/cd", "devops", "testing", "automation",
    "tensorflow", "pytorch", "pandas", "numpy", "spark", "hadoop",
    "html", "css", "sass", "webpack", "babel", "redux",
    "tableau", "power bi", "looker", "airflow", "kafka",
    "microservices", "serverless", "saas", "restful",
}

QUANTIFICATION_PATTERNS = [
    r'\d+%',
    r'\$\s*\d+(?:[kKmMbB]|,\d{3})?',
    r'\d+[kKmMbB]',
    r'(?:increased|decreased|reduced|improved|grew|boosted|raised|lowered|cut|slashed)\s+by\s+\d+',
    r'\d+x',
    r'over\s+\d+',
    r'more\s+than\s+\d+',
    r'\d+\s*(?:employees|customers|users|clients|projects|teams|people|reports|countries|cities|offices|locations|stores)',
    r'\d{1,3}(?:,\d{3})+\+?',
    r'^\d{1,2}\s*(?:years?|months?|weeks?)',
]


def detect_sections(lines: List[str]) -> List[str]:
    detected = []
    for line in lines:
        lower = line.lower().strip().rstrip(":")
        for kw in STANDARD_SECTION_KEYWORDS:
            if lower == kw or lower.startswith(kw + ":"):
                detected.append(kw)
                break
    return detected


def count_quantified_achievements(text: str) -> int:
    count = 0
    for line in text.split("\n"):
        for pat in QUANTIFICATION_PATTERNS:
            if re.search(pat, line, re.IGNORECASE):
                count += 1
                break
    return count


def count_action_verbs(text: str) -> int:
    count = 0
    for line in text.split("\n"):
        words = set(line.lower().split())
        if words & ACTION_VERBS:
            count += 1
    return count


def count_bullet_points(text: str) -> int:
    count = 0
    for line in text.split("\n"):
        stripped = line.strip()
        if stripped and stripped[0] in ("•", "-", "*", "·", "→", "➢", "◆", "▸"):
            count += 1
    return count


def has_linkedin(lines: List[str]) -> bool:
    return any("linkedin" in l.lower() for l in lines)


def has_github(lines: List[str]) -> bool:
    return any("github" in l.lower() for l in lines)


def has_portfolio(lines: List[str]) -> bool:
    return any("portfolio" in l.lower() for l in lines)


def count_technical_skills(text: str) -> int:
    lower = text.lower()
    return sum(1 for kw in TECHNICAL_KEYWORDS if kw in lower)


def estimate_total_lines(text: str) -> int:
    return len([l for l in text.split("\n") if l.strip()])


def compute_format_score(text: str, detected_sections: List[str]) -> int:
    score = 100

    required = {"experience", "education", "skills"}
    found = set()
    for s in detected_sections:
        for r in required:
            if r in s:
                found.add(r)

    missing = required - found
    missing_penalty = len(missing) * 12
    score -= missing_penalty

    bullet_count = count_bullet_points(text)
    if bullet_count == 0:
        score -= 25
    elif bullet_count < 5:
        score -= 10

    lines = text.split("\n")
    table_like = sum(1 for l in lines if "|" in l or l.count("\t") > 1)
    if table_like > 3:
        score -= 15

    return max(0, min(100, score))


def compute_keyword_score(text: str, detected_sections: List[str]) -> int:
    skill_count = count_technical_skills(text)
    if skill_count >= 15:
        return 100
    elif skill_count >= 10:
        return 85
    elif skill_count >= 7:
        return 70
    elif skill_count >= 4:
        return 55
    elif skill_count >= 2:
        return 40
    elif skill_count >= 1:
        return 25
    else:
        return 10


def compute_content_score(text: str) -> int:
    quantified = count_quantified_achievements(text)
    action_verbs = count_action_verbs(text)

    score = 50
    score += min(quantified * 8, 30)
    score += min(action_verbs * 4, 20)

    return max(0, min(100, score))


def compute_completeness_score(lines: List[str], text: str) -> int:
    score = 0

    if any("@" in l for l in lines):
        score += 15
    if any(re.search(r"\+?\d[\d\s\-().]{7,}\d", l) for l in lines):
        score += 15
    if has_linkedin(lines):
        score += 10
    if has_github(lines) or has_portfolio(lines):
        score += 10

    detected = set(detect_sections(lines))
    for section in ("experience", "education", "skills"):
        if any(section in s for s in detected):
            score += 15
        else:
            score += 0

    total = estimate_total_lines(text)
    if total < 20:
        score -= 10

    return max(0, min(100, score))


def compute_readability_score(text: str) -> int:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return 50

    total = len(lines)

    bullet_count = count_bullet_points(text)
    bullet_ratio = bullet_count / max(total, 1)
    if bullet_ratio >= 0.3:
        bullet_score = 25
    elif bullet_ratio >= 0.15:
        bullet_score = 18
    else:
        bullet_score = 10

    long_lines = sum(1 for l in lines if len(l.split()) > 30)
    long_ratio = long_lines / total
    length_score = 25 - int(long_ratio * 25)
    length_score = max(0, length_score)

    very_short_lines = sum(1 for l in lines if len(l.split()) < 3)
    if very_short_lines > total * 0.3:
        density_score = 15
    else:
        density_score = 25

    short_lines = total
    if short_lines > 200:
        size_score = 15
    elif short_lines > 120:
        size_score = 20
    else:
        size_score = 25

    score = bullet_score + length_score + density_score + size_score
    return max(0, min(100, score))


def compute_ats_scores(text: str) -> Dict:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    detected_sections = detect_sections(lines)

    format_score = compute_format_score(text, detected_sections)
    keyword_score = compute_keyword_score(text, detected_sections)
    content_score = compute_content_score(text)
    completeness_score = compute_completeness_score(lines, text)
    readability_score = compute_readability_score(text)

    ats_score = round(
        format_score * 0.20
        + keyword_score * 0.25
        + content_score * 0.25
        + completeness_score * 0.15
        + readability_score * 0.15
    )

    return {
        "format_score": format_score,
        "keyword_score": keyword_score,
        "content_score": content_score,
        "completeness_score": completeness_score,
        "readability_score": readability_score,
        "ats_score": ats_score,
    }
