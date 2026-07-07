from app.services.resume_parser import parse_resume_text


def test_parse_resume_text_with_email():
    text = "Jane Smith\njane@company.com\n+9876543210"
    result = parse_resume_text(text)
    assert result.name == "Jane Smith"
    assert result.email == "jane@company.com"
    assert result.phone == "+9876543210"


def test_parse_resume_text_with_sections():
    text_lines = [
        "Jane Smith",
        "jane@email.com",
        "skill",
        "Python",
        "experience",
        "Senior Engineer at Google",
        "education",
        "Stanford University",
    ]
    text = "\n".join(text_lines)
    result = parse_resume_text(text)
    assert len(result.skills) > 0, f"Expected skills, got {result.skills}"
    assert len(result.experience) > 0
    assert len(result.education) > 0


def test_parse_resume_text_empty():
    result = parse_resume_text("")
    assert result.name is None


def test_parse_resume_text_no_sections():
    result = parse_resume_text("Just a name\nsome text without sections")
    assert result.name is not None


def test_parse_resume_text_projects():
    text = "Name\nemail@test.com\nproject\nApp One\nApp Two"
    result = parse_resume_text(text)
    assert len(result.projects) > 0
