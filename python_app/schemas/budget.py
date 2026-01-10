from pydantic import BaseModel, Field
from typing import Optional


class BudgetRequest(BaseModel):
    city: str = Field(..., description="Destination city in Japan")
    num_days: int = Field(..., ge=1, le=90, description="Number of days")
    num_travelers: int = Field(..., ge=1, le=20, description="Number of travelers")
    travel_style: str = Field("mid", description="Travel style: budget, mid, or luxury")
    month: int = Field(..., ge=1, le=12, description="Travel month (1-12)")
    include_flights: bool = Field(True, description="Include flight costs")
    shopping_budget: float = Field(200.0, ge=0, description="Shopping budget per person in SGD")


class CostBreakdown(BaseModel):
    flights: float
    accommodation: float
    food: float
    transport: float
    activities: float
    shopping: float
    total: float
    daily_average: float


class BudgetResponse(BaseModel):
    breakdown: CostBreakdown
    exchange_rate: float
    total_jpy: float
    season: str
    season_label: str
