from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Optional
from datetime import datetime, timedelta
import os
import re

from sqlalchemy import func, text
from sqlalchemy.orm import Session
from decimal import Decimal

from ..schemas.budget import BudgetRequest, BudgetResponse, CostBreakdown as CostBreakdownSchema
from ..schemas.chat import ChatRequest, ChatResponse
from ..schemas.newsletter import NewsletterRequest, NewsletterResponse
from ..schemas.analytics import (
    BudgetCalculationCreate, PageViewCreate, UserEventCreate,
    AnalyticsSummary, CityCount, StyleCount, BudgetCalculationResponse
)
from ..domain.cost_calculator import CostCalculator
from ..domain.seasonality import get_season
from ..domain.travel_tips import get_travel_tips, get_city_recommendations
from ..services.exchange_rate import ExchangeRateService
from ..services.chat import ChatService
from ..services.google_maps import GoogleMapsService
from ..middleware.security import validate_city, validate_session_id, sanitize_string, normalize_city
from ..db.database import get_db
from ..db.models import BudgetCalculation, PageView, UserEvent, NewsletterSubscriber, ChatSession

router = APIRouter()

exchange_service = ExchangeRateService()
chat_service = ChatService()
maps_service = GoogleMapsService()

VALID_CITIES = ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa", "Nagoya", "Hiroshima", "Nara", "Yokohama"]
VALID_TRAVEL_STYLES = ["budget", "mid", "luxury"]


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    checks = {"server": "healthy"}
    
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception:
        checks["database"] = "unhealthy"
    
    all_healthy = all(status == "healthy" for status in checks.values())
    
    return {
        "status": "ok" if all_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": checks
    }


@router.get("/health/live")
async def liveness_check():
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}


@router.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={"status": "not_ready", "error": "Database connection failed"}
        )


@router.get("/exchange-rate")
async def get_exchange_rate():
    result = await exchange_service.get_exchange_rate()
    return result


@router.post("/budget", response_model=BudgetResponse)
async def calculate_budget(request: BudgetRequest):
    if not validate_city(request.city):
        raise HTTPException(status_code=400, detail="Invalid city")
    if request.travel_style not in VALID_TRAVEL_STYLES:
        raise HTTPException(status_code=400, detail="Invalid travel style")
    if not (1 <= request.num_days <= 90):
        raise HTTPException(status_code=400, detail="Days must be between 1 and 90")
    if not (1 <= request.num_travelers <= 20):
        raise HTTPException(status_code=400, detail="Travelers must be between 1 and 20")
    if not (1 <= request.month <= 12):
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    
    normalized_city = normalize_city(request.city)
    
    rate_data = await exchange_service.get_exchange_rate()
    exchange_rate = rate_data["rate"]
    
    calculator = CostCalculator(exchange_rate=exchange_rate)
    breakdown = calculator.calculate_budget(
        city=normalized_city,
        num_days=request.num_days,
        num_travelers=request.num_travelers,
        travel_style=request.travel_style,
        month=request.month,
        include_flights=request.include_flights,
        shopping_budget=request.shopping_budget
    )
    
    season, season_label = get_season(request.month)
    total_jpy = calculator.convert_to_jpy(breakdown.total)
    
    return BudgetResponse(
        breakdown=CostBreakdownSchema(
            flights=breakdown.flights,
            accommodation=breakdown.accommodation,
            food=breakdown.food,
            transport=breakdown.transport,
            activities=breakdown.activities,
            shopping=breakdown.shopping,
            total=breakdown.total,
            daily_average=breakdown.daily_average
        ),
        exchange_rate=exchange_rate,
        total_jpy=total_jpy,
        season=season,
        season_label=season_label
    )


@router.get("/tips")
async def get_tips(travel_style: str = "mid"):
    if travel_style not in VALID_TRAVEL_STYLES:
        raise HTTPException(status_code=400, detail="Invalid travel style")
    tips = get_travel_tips(travel_style)
    return {"tips": tips}


@router.get("/recommendations/{city}")
async def get_recommendations(city: str):
    if not validate_city(city):
        raise HTTPException(status_code=400, detail="Invalid city")
    normalized_city = normalize_city(city)
    recommendations = get_city_recommendations(normalized_city)
    return recommendations


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    if not request.message or len(request.message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message is required")
    
    if len(request.message) > 4000:
        raise HTTPException(status_code=400, detail="Message too long (max 4000 characters)")
    
    if request.session_id and not validate_session_id(request.session_id):
        raise HTTPException(status_code=400, detail="Invalid session ID format")
    
    if request.history and len(request.history) > 50:
        raise HTTPException(status_code=400, detail="Too many messages in history (max 50)")
    
    try:
        referer = req.headers.get("referer", "https://japan-travel-budget.replit.app")
        
        sanitized_message = sanitize_string(request.message, 4000)
        
        history = None
        if request.history:
            history = [
                {"role": h.role, "content": sanitize_string(h.content, 4000)} 
                for h in request.history 
                if h.role in ["user", "assistant"] and len(h.content.strip()) > 0
            ]
        
        response = await chat_service.send_message(
            message=sanitized_message,
            history=history,
            referer=referer
        )
        
        return ChatResponse(
            message=response,
            session_id=request.session_id
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/google-maps-configured")
async def check_google_maps_configured():
    return {"configured": maps_service.is_configured()}


EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

@router.post("/newsletter", response_model=NewsletterResponse)
async def subscribe_newsletter(request: NewsletterRequest):
    if not request.email or not EMAIL_REGEX.match(request.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if len(request.email) > 254:
        raise HTTPException(status_code=400, detail="Email too long")
    
    return NewsletterResponse(
        success=True,
        message="Thank you for subscribing!"
    )


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "japan-travel-budget-api"}


@router.post("/analytics/budget")
async def track_budget_calculation(request: BudgetCalculationCreate, db: Session = Depends(get_db)):
    try:
        calculation = BudgetCalculation(
            session_id=sanitize_string(request.session_id, 100) if request.session_id else None,
            departure_date=sanitize_string(request.departure_date, 20) if request.departure_date else None,
            return_date=sanitize_string(request.return_date, 20) if request.return_date else None,
            travelers=request.travelers,
            cities=[sanitize_string(c, 50) for c in request.cities],
            travel_style=sanitize_string(request.travel_style, 20),
            total_budget_sgd=request.total_budget_sgd,
            per_person_sgd=request.per_person_sgd,
            exchange_rate=request.exchange_rate,
            breakdown=request.breakdown
        )
        db.add(calculation)
        db.commit()
        db.refresh(calculation)
        return {"success": True, "id": calculation.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to track budget calculation")


@router.post("/analytics/pageview")
async def track_page_view(request: PageViewCreate, db: Session = Depends(get_db)):
    try:
        page_view = PageView(
            session_id=sanitize_string(request.session_id, 100) if request.session_id else None,
            page_path=sanitize_string(request.page_path, 500),
            referrer=sanitize_string(request.referrer, 500) if request.referrer else None,
            user_agent=sanitize_string(request.user_agent, 500) if request.user_agent else None
        )
        db.add(page_view)
        db.commit()
        db.refresh(page_view)
        return {"success": True, "id": page_view.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to track page view")


@router.post("/analytics/event")
async def track_user_event(request: UserEventCreate, db: Session = Depends(get_db)):
    try:
        event = UserEvent(
            session_id=sanitize_string(request.session_id, 100) if request.session_id else None,
            event_type=sanitize_string(request.event_type, 100),
            event_category=sanitize_string(request.event_category, 100),
            event_data=request.event_data
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return {"success": True, "id": event.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to track event")


@router.get("/analytics/dashboard")
async def get_analytics_dashboard(days: int = 30, db: Session = Depends(get_db)):
    try:
        days = min(max(1, days), 365)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        budget_count = db.query(func.count(BudgetCalculation.id)).filter(
            BudgetCalculation.created_at >= start_date
        ).scalar() or 0
        
        page_view_count = db.query(func.count(PageView.id)).filter(
            PageView.created_at >= start_date
        ).scalar() or 0
        
        event_count = db.query(func.count(UserEvent.id)).filter(
            UserEvent.created_at >= start_date
        ).scalar() or 0
        
        subscriber_count = db.query(func.count(NewsletterSubscriber.id)).scalar() or 0
        session_count = db.query(func.count(ChatSession.id)).scalar() or 0
        
        city_stats = db.execute(text("""
            SELECT unnest(cities) as city, COUNT(*) as count 
            FROM budget_calculations 
            WHERE created_at >= :start_date
            GROUP BY city 
            ORDER BY count DESC 
            LIMIT 10
        """), {"start_date": start_date}).fetchall()
        
        style_stats = db.execute(text("""
            SELECT travel_style as style, COUNT(*) as count 
            FROM budget_calculations 
            WHERE created_at >= :start_date
            GROUP BY travel_style 
            ORDER BY count DESC
        """), {"start_date": start_date}).fetchall()
        
        avg_stats = db.execute(text("""
            SELECT 
                COALESCE(AVG(total_budget_sgd::numeric), 0) as avg_budget,
                COALESCE(AVG(travelers), 0) as avg_travelers
            FROM budget_calculations 
            WHERE created_at >= :start_date
        """), {"start_date": start_date}).fetchone()
        
        recent_calcs = db.query(BudgetCalculation).order_by(
            BudgetCalculation.created_at.desc()
        ).limit(10).all()
        
        return {
            "period": f"{days} days",
            "total_budget_calculations": budget_count,
            "total_page_views": page_view_count,
            "total_user_events": event_count,
            "total_newsletter_subscribers": subscriber_count,
            "total_chat_sessions": session_count,
            "popular_cities": [{"city": row[0], "count": row[1]} for row in city_stats],
            "popular_travel_styles": [{"style": row[0], "count": row[1]} for row in style_stats],
            "average_budget": float(avg_stats[0]) if avg_stats else 0,
            "average_travelers": float(avg_stats[1]) if avg_stats else 0,
            "recent_calculations": [
                {
                    "id": calc.id,
                    "session_id": calc.session_id,
                    "departure_date": calc.departure_date,
                    "return_date": calc.return_date,
                    "travelers": calc.travelers,
                    "cities": calc.cities,
                    "travel_style": calc.travel_style,
                    "total_budget_sgd": float(calc.total_budget_sgd),
                    "per_person_sgd": float(calc.per_person_sgd),
                    "exchange_rate": float(calc.exchange_rate),
                    "breakdown": calc.breakdown,
                    "created_at": calc.created_at.isoformat() if calc.created_at else None
                }
                for calc in recent_calcs
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get analytics data")
