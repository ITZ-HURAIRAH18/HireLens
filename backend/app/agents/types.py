from typing import TypedDict, List, Any


class AgentState(TypedDict):
    resume_text: str
    resume_data: dict
    job_description: str
    chat_history: List[dict]
    user_id: str
    session_id: str
    active_agent: str
    analysis_results: dict
    output: Any
    user_message: str
    error: str
