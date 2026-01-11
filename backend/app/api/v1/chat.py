from fastapi import APIRouter

router = APIRouter()


@router.post("/")
def chat_with_resume():
    return {
        "message": "Resume chat agent endpoint (coming next)"
    }
