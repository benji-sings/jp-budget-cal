from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import time
import re


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60, chat_requests_per_minute: int = 10):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.chat_requests_per_minute = chat_requests_per_minute
        self.request_counts: dict = defaultdict(list)
        self.chat_request_counts: dict = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        is_chat_endpoint = request.url.path == "/api/chat" and request.method == "POST"
        
        if is_chat_endpoint:
            self.chat_request_counts[client_ip] = [
                t for t in self.chat_request_counts[client_ip] 
                if current_time - t < 60
            ]
            
            if len(self.chat_request_counts[client_ip]) >= self.chat_requests_per_minute:
                return JSONResponse(
                    status_code=429,
                    content={"error": "Too many chat requests. Please wait before sending another message."}
                )
            
            self.chat_request_counts[client_ip].append(current_time)
        
        if request.url.path.startswith("/api/"):
            self.request_counts[client_ip] = [
                t for t in self.request_counts[client_ip] 
                if current_time - t < 60
            ]
            
            if len(self.request_counts[client_ip]) >= self.requests_per_minute:
                return JSONResponse(
                    status_code=429,
                    content={"error": "Too many requests. Please slow down."}
                )
            
            self.request_counts[client_ip].append(current_time)
        
        response = await call_next(request)
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response


class RequestValidationMiddleware(BaseHTTPMiddleware):
    SUSPICIOUS_PATTERNS = [
        re.compile(r"\.\.\/", re.IGNORECASE),
        re.compile(r"<script", re.IGNORECASE),
        re.compile(r"javascript:", re.IGNORECASE),
        re.compile(r"on\w+\s*=", re.IGNORECASE),
        re.compile(r"union\s+select", re.IGNORECASE),
        re.compile(r"drop\s+table", re.IGNORECASE),
        re.compile(r"insert\s+into", re.IGNORECASE),
        re.compile(r"delete\s+from", re.IGNORECASE),
    ]
    
    async def dispatch(self, request: Request, call_next):
        url_path = request.url.path
        query_string = str(request.url.query)
        
        for pattern in self.SUSPICIOUS_PATTERNS:
            if pattern.search(url_path) or pattern.search(query_string):
                print(f"[SECURITY] Suspicious request blocked from {request.client.host if request.client else 'unknown'}: {url_path}")
                return JSONResponse(
                    status_code=400,
                    content={"error": "Invalid request"}
                )
        
        response = await call_next(request)
        return response


VALID_CITIES = ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa", "Nagoya", "Hiroshima", "Nara", "Yokohama"]
VALID_CITIES_LOWER = [c.lower() for c in VALID_CITIES]
UUID_PATTERN = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", re.IGNORECASE)
LEGACY_SESSION_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{1,100}$")


def validate_city(city: str) -> bool:
    return city in VALID_CITIES or city.lower() in VALID_CITIES_LOWER


def normalize_city(city: str) -> str:
    lower_city = city.lower()
    if lower_city in VALID_CITIES_LOWER:
        idx = VALID_CITIES_LOWER.index(lower_city)
        return VALID_CITIES[idx]
    return city


def validate_session_id(session_id: str) -> bool:
    return bool(UUID_PATTERN.match(session_id) or LEGACY_SESSION_PATTERN.match(session_id))


def sanitize_string(input_str: str, max_length: int = 2000) -> str:
    if not isinstance(input_str, str):
        return ""
    sanitized = input_str[:max_length]
    sanitized = re.sub(r"<[^>]*>", "", sanitized)
    sanitized = re.sub(r"on\w+\s*=", "", sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r"javascript:", "", sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r"data:", "", sanitized, flags=re.IGNORECASE)
    return sanitized.strip()
