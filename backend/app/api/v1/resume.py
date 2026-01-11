from fastapi import APIRouter

router = APIRouter()


@router.post("/upload")
def upload_resume():
    return {
        "message": "Resume upload endpoint (coming next)"
    }
