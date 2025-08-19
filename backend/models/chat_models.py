from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class SessionStatus(str, Enum):
    ACTIVE = "active"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"
    EXPIRED = "expired"


class ChatMessage(BaseModel):
    id: str
    content: str
    sender: str  # "user" or "ai"
    timestamp: datetime
    session_id: str


class ChatSession(BaseModel):
    id: str
    status: SessionStatus
    created_at: datetime
    last_activity: datetime
    filename: Optional[str] = None
    xml_content: Optional[str] = None
    metadata: Dict[str, Any] = {}
    messages: List[ChatMessage] = []


class SessionCreate(BaseModel):
    filename: str


class SessionResponse(BaseModel):
    session_id: str
    status: str
    message: str
    created_at: datetime
