import json
from typing import AsyncGenerator
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4,
    google_api_key=settings.google_api_key,
)


async def stream_chat_response(
    system_prompt: str,
    chat_history: list,
    user_message: str,
) -> AsyncGenerator[str, None]:
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(chat_history)
    messages.append({"role": "user", "content": user_message})

    async for chunk in llm.astream(messages):
        if chunk.content:
            yield f"data: {json.dumps({'token': chunk.content})}\n\n"
    yield "data: [DONE]\n\n"
