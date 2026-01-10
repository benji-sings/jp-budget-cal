from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from .api.routes import router
from .middleware.security import (
    RateLimitMiddleware,
    SecurityHeadersMiddleware,
    RequestValidationMiddleware,
)

app = FastAPI(
    title="Japan Travel Budget Calculator API",
    description="A modular Python backend for the Japan Travel Budget Calculator",
    version="2.0.0",
    docs_url="/docs" if os.environ.get("NODE_ENV") != "production" else None,
    redoc_url="/redoc" if os.environ.get("NODE_ENV") != "production" else None,
)

allowed_origins = [
    "http://localhost:5000",
    "https://localhost:5000",
]

replit_dev_domain = os.environ.get("REPLIT_DEV_DOMAIN")
if replit_dev_domain:
    allowed_origins.append(f"https://{replit_dev_domain}")

repl_slug = os.environ.get("REPL_SLUG")
repl_owner = os.environ.get("REPL_OWNER")
if repl_slug and repl_owner:
    allowed_origins.append(f"https://{repl_slug}.{repl_owner}.repl.co")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=86400,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestValidationMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60, chat_requests_per_minute=10)

app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Japan Travel Budget Calculator API",
        "version": "2.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5001))
    uvicorn.run("python_app.main:app", host="0.0.0.0", port=port, reload=True)
