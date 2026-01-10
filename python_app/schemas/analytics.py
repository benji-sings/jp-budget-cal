from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


class BudgetCalculationCreate(BaseModel):
    session_id: Optional[str] = None
    departure_date: Optional[str] = None
    return_date: Optional[str] = None
    travelers: int = Field(..., ge=1, le=20)
    cities: List[str] = Field(..., min_length=1)
    travel_style: str
    total_budget_sgd: float
    per_person_sgd: float
    exchange_rate: float
    breakdown: dict


class PageViewCreate(BaseModel):
    session_id: Optional[str] = None
    page_path: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None


class UserEventCreate(BaseModel):
    session_id: Optional[str] = None
    event_type: str
    event_category: str
    event_data: Optional[dict] = None


class CityCount(BaseModel):
    city: str
    count: int


class StyleCount(BaseModel):
    style: str
    count: int


class BudgetCalculationResponse(BaseModel):
    id: int
    session_id: Optional[str]
    departure_date: Optional[str]
    return_date: Optional[str]
    travelers: int
    cities: List[str]
    travel_style: str
    total_budget_sgd: float
    per_person_sgd: float
    exchange_rate: float
    breakdown: dict
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    period: str
    total_budget_calculations: int
    total_page_views: int
    total_user_events: int
    total_newsletter_subscribers: int
    total_chat_sessions: int
    popular_cities: List[CityCount]
    popular_travel_styles: List[StyleCount]
    average_budget: float
    average_travelers: float
    recent_calculations: List[BudgetCalculationResponse]
