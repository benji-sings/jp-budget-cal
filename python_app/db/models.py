from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Numeric, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    session = relationship("ChatSession", back_populates="messages")


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)


class BudgetCalculation(Base):
    __tablename__ = "budget_calculations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    departure_date = Column(String(20), nullable=True)
    return_date = Column(String(20), nullable=True)
    travelers = Column(Integer, nullable=False)
    cities = Column(ARRAY(Text), nullable=False)
    travel_style = Column(String(50), nullable=False)
    total_budget_sgd = Column(Numeric(10, 2), nullable=False)
    per_person_sgd = Column(Numeric(10, 2), nullable=False)
    exchange_rate = Column(Numeric(10, 4), nullable=False)
    breakdown = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PageView(Base):
    __tablename__ = "page_views"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    page_path = Column(Text, nullable=False)
    referrer = Column(Text, nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserEvent(Base):
    __tablename__ = "user_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    event_type = Column(String(100), nullable=False)
    event_category = Column(String(100), nullable=False)
    event_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
