import pytest
from app.agents.types import AgentState


def make_state(overrides=None):
    base: AgentState = {
        "resume_text": "John Doe\nSoftware Engineer with 5 years experience in Python, React, and AWS.",
        "resume_data": {},
        "job_description": "",
        "chat_history": [],
        "user_id": "test-user",
        "session_id": "test-session",
        "active_agent": "analyze",
        "analysis_results": {},
        "output": None,
        "user_message": "",
        "error": "",
    }
    if overrides:
        base.update(overrides)
    return base


def test_supervisor_graph_structure():
    from app.agents.supervisor import supervisor_agent
    nodes = list(supervisor_agent.get_graph().nodes.keys())
    expected = ["__start__", "router", "analyze", "chat", "job_match", "ats", "cover_letter", "interview_prep", "mock_interview", "career_path", "__end__"]
    for node in expected:
        assert node in nodes, f"Missing node: {node}"


def test_router_analyze_intent():
    from app.agents.supervisor import router_node
    state = make_state({"active_agent": "analyze"})
    result = router_node(state)
    assert result["active_agent"] == "analyze"


def test_router_chat_intent():
    from app.agents.supervisor import router_node
    state = make_state({"active_agent": "chat"})
    result = router_node(state)
    assert result["active_agent"] == "chat"


def test_router_job_match_intent():
    from app.agents.supervisor import router_node
    state = make_state({"active_agent": "job_match"})
    result = router_node(state)
    assert result["active_agent"] == "job_match"


def test_router_ats_intent():
    from app.agents.supervisor import router_node
    state = make_state({"active_agent": "ats"})
    result = router_node(state)
    assert result["active_agent"] == "ats"


def test_router_cover_letter_intent():
    from app.agents.supervisor import router_node
    state = make_state({"active_agent": "cover_letter"})
    result = router_node(state)
    assert result["active_agent"] == "cover_letter"


def test_router_interview_intent():
    from app.agents.supervisor import router_node
    state = make_state({"active_agent": "interview_prep"})
    result = router_node(state)
    assert result["active_agent"] == "interview_prep"


def test_router_mock_interview_intent():
    from app.agents.supervisor import router_node
    state = make_state({"active_agent": "mock_interview"})
    result = router_node(state)
    assert result["active_agent"] == "mock_interview"


def test_router_career_path_intent():
    from app.agents.supervisor import router_node
    state = make_state({"active_agent": "career_path"})
    result = router_node(state)
    assert result["active_agent"] == "career_path"


def test_should_continue_analyze():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "analyze"})
    assert should_continue(state) == "analyze"


def test_should_continue_chat():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "chat"})
    assert should_continue(state) == "chat"


def test_should_continue_job_match():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "job_match"})
    assert should_continue(state) == "job_match"


def test_should_continue_ats():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "ats"})
    assert should_continue(state) == "ats"


def test_should_continue_cover_letter():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "cover_letter"})
    assert should_continue(state) == "cover_letter"


def test_should_continue_interview_prep():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "interview_prep"})
    assert should_continue(state) == "interview_prep"


def test_should_continue_mock_interview():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "mock_interview"})
    assert should_continue(state) == "mock_interview"


def test_should_continue_career_path():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "career_path"})
    assert should_continue(state) == "career_path"


def test_should_continue_unknown():
    from app.agents.supervisor import should_continue
    state = make_state({"active_agent": "unknown"})
    assert should_continue(state) == "__end__"


def test_agent_schemas():
    from app.schemas.agent import ResumeAgentOutput
    data = {"summary": "Test", "strengths": ["A"], "weaknesses": ["B"], "improvement_tips": ["C"], "suggested_roles": ["D"], "ats_score": 85}
    output = ResumeAgentOutput(**data)
    assert output.ats_score == 85
    assert len(output.strengths) == 1


def test_ats_schema():
    from app.schemas.ats import ATSOutput, ATSFix
    fix = ATSFix(issue="Test", severity="critical", recommendation="Fix it")
    output = ATSOutput(ats_compatibility_score=75, critical_issues=[fix], warnings=[], suggestions=[], summary="OK")
    assert output.ats_compatibility_score == 75


def test_job_matching_schema():
    from app.schemas.job_matching import JobMatchingOutput, SkillGap
    gap = SkillGap(skill="Python", category="technical", importance="high")
    output = JobMatchingOutput(match_percentage=80, matched_keywords=["Python"], missing_keywords=["Java"], skill_gaps=[gap], overall_assessment="Good")
    assert output.match_percentage == 80


def test_cover_letter_schema():
    from app.schemas.cover_letter import CoverLetterOutput, ToneVariant
    variant = ToneVariant(tone="formal", content="Dear Sir...")
    output = CoverLetterOutput(primary_letter="Dear...", tone_variants=[variant])
    assert len(output.tone_variants) == 1


def test_interview_schema():
    from app.schemas.interview import InterviewPrepOutput, InterviewQuestion
    q = InterviewQuestion(category="behavioral", question="Tell me about yourself", tips="Be concise")
    output = InterviewPrepOutput(target_role="Engineer", questions=[q], preparation_tips="Prepare well")
    assert len(output.questions) == 1


def test_career_path_schema():
    from app.schemas.career_path import CareerPathOutput, SkillGap, Certification, LearningMilestone
    gap = SkillGap(skill="AWS", current_level="beginner", required_level="advanced", priority="high")
    cert = Certification(name="AWS SA", provider="Amazon", estimated_time="3mo", relevance="high")
    milestone = LearningMilestone(phase="Phase 1", duration="1mo", focus="Basics", skills=["AWS"])
    output = CareerPathOutput(target_role="Architect", skill_gaps=[gap], certifications=[cert], learning_roadmap=[milestone], estimated_timeline="6mo")
    assert output.target_role == "Architect"


def test_mock_interview_schema():
    from app.schemas.interview import MockInterviewFeedback
    data = {"clarity_score": 80, "structure_score": 70, "star_method_score": 60, "relevance_score": 90, "feedback": "Good", "improved_answer": "Better version"}
    output = MockInterviewFeedback(**data)
    assert output.clarity_score == 80


def test_resume_parser():
    from app.services.resume_parser import parse_resume_text
    text = "John Doe\njohn@email.com\n+1234567890\nSkills: Python, React\nExperience: Senior Dev\nEducation: MIT\nProjects: App"
    result = parse_resume_text(text)
    assert result.name == "John Doe"
    assert result.email == "john@email.com"
