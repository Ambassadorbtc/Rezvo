from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ConversationStatus(str, Enum):
    AUTO_RESOLVED = "auto_resolved"
    NEEDS_REVIEW = "needs_review"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class ConversationSource(str, Enum):
    WEB = "web"
    APP_OWNER = "app_owner"
    APP_DINER = "app_diner"
    DASHBOARD = "dashboard"


class SupportMessageCreate(BaseModel):
    user_message: str
    assistant_message: str
    input_tokens: int = 0
    output_tokens: int = 0
    is_escalation: bool = False


class SupportMessage(BaseModel):
    id: str = Field(alias="_id")
    conversation_id: str
    user_message: str
    assistant_message: str
    input_tokens: int
    output_tokens: int
    is_escalation: bool
    created_at: datetime

    class Config:
        populate_by_name = True


class ConversationCreate(BaseModel):
    source: ConversationSource
    page_url: Optional[str] = None
    user_id: Optional[str] = None


class ConversationUpdate(BaseModel):
    status: Optional[ConversationStatus] = None
    escalated: Optional[bool] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None


class SupportConversation(BaseModel):
    id: str = Field(alias="_id")
    source: ConversationSource
    page_url: Optional[str] = None
    user_id: Optional[str] = None
    status: ConversationStatus
    escalated: bool
    message_count: int
    total_input_tokens: int
    total_output_tokens: int
    estimated_cost_usd: int
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True


class ConversationResponse(BaseModel):
    id: str
    source: ConversationSource
    page_url: Optional[str] = None
    user_id: Optional[str] = None
    status: ConversationStatus
    escalated: bool
    message_count: int
    total_input_tokens: int
    total_output_tokens: int
    estimated_cost_usd: float
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[SupportMessage]] = None

    class Config:
        from_attributes = True


class TopQuestion(BaseModel):
    question: str
    count: int


class DailyConversations(BaseModel):
    date: str
    count: int


class AnalyticsResponse(BaseModel):
    total_conversations: int
    total_messages: int
    auto_resolved_pct: float
    escalated_pct: float
    avg_messages_per_conversation: float
    total_cost_usd: float
    top_questions: List[TopQuestion]
    conversations_by_day: List[DailyConversations]
