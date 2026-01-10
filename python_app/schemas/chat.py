from pydantic import BaseModel, Field
from typing import List, Optional


class ChatHistoryItem(BaseModel):
    role: str = Field(..., description="Message role: user or assistant")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message")
    history: Optional[List[ChatHistoryItem]] = Field(default=None, description="Chat history")
    session_id: Optional[str] = Field(default=None, description="Session ID for persistence")


class ChatResponse(BaseModel):
    message: str = Field(..., description="Assistant response")
    session_id: Optional[str] = Field(default=None, description="Session ID")
