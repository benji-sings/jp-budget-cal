from pydantic import BaseModel, Field, EmailStr


class NewsletterRequest(BaseModel):
    email: EmailStr = Field(..., description="Subscriber email address")


class NewsletterResponse(BaseModel):
    success: bool
    message: str
