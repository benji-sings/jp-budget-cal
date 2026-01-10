# Japan Travel Budget Calculator - Technical Architecture

This document provides a comprehensive overview of the system architecture, technology stack, data flows, and design patterns used in the Japan Travel Budget Calculator application.

**Last Updated**: January 2026
**Test Status**: 162 tests passing (119 TypeScript + 43 Python) + 36 WAF security scenarios
**Security Status**: 0 npm vulnerabilities, 60+ attack pattern signatures
**Startup**: `npm run dev` (Express only) or `./start-all.sh` (Express + Python)

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CLIENT LAYER                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              React 18 + TypeScript                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │  │
│  │  │    Pages    │  │ Components  │  │    Hooks    │  │    State Management     │  │  │
│  │  │  ─────────  │  │  ─────────  │  │  ─────────  │  │  ───────────────────    │  │  │
│  │  │ • Home      │  │ • Chatbot   │  │ • useToast  │  │ • TanStack Query        │  │  │
│  │  │ • NotFound  │  │ • Activity  │  │ • useForm   │  │ • React useState        │  │  │
│  │  │             │  │ • Weather   │  │ • useMobile │  │ • QueryClient Cache     │  │  │
│  │  │             │  │ • Charts    │  │             │  │                         │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘  │  │
│  │                                                                                    │  │
│  │  ┌──────────────────────────────┐  ┌──────────────────────────────────────────┐  │  │
│  │  │       UI Framework           │  │              Styling                      │  │  │
│  │  │  ────────────────────        │  │  ────────────────────────                 │  │  │
│  │  │ • shadcn/ui Components       │  │ • Tailwind CSS                            │  │  │
│  │  │ • Radix UI Primitives        │  │ • CSS Variables (Theming)                 │  │  │
│  │  │ • Lucide React Icons         │  │ • Dark/Light Mode Support                 │  │  │
│  │  │ • Recharts (Visualization)   │  │ • Responsive Design                       │  │  │
│  │  └──────────────────────────────┘  └──────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            │ HTTP/REST (JSON)
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    GATEWAY LAYER                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Express.js Server (Port 5000)                              │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                              API Routes                                      │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │  │  │
│  │  │  │ /api/health │ │/api/weather │ │/api/attract │ │ /api/exchange-rate  │   │  │  │
│  │  │  │             │ │   /:city    │ │ ions/:city  │ │                     │   │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │  │  │
│  │  │  │  /api/chat  │ │/api/chat/:id│ │/api/place-  │ │  /api/maps-embed    │   │  │  │
│  │  │  │   (POST)    │ │   (GET)     │ │  details    │ │                     │   │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                    │  │
│  │  ┌──────────────────────────────┐  ┌──────────────────────────────────────────┐  │  │
│  │  │      In-Memory Caches        │  │         Static File Server               │  │  │
│  │  │  ────────────────────        │  │  ────────────────────────                 │  │  │
│  │  │ • Exchange Rate (1hr TTL)    │  │ • Vite Dev Server (Development)          │  │  │
│  │  │ • Weather Data (15min TTL)   │  │ • Static Build (Production)              │  │  │
│  │  │ • Attractions (24hr TTL)     │  │ • ETag support for conditional requests  │  │  │
│  │  │ • Place Details (7day TTL)   │  │ • gzip compression (level 6)             │  │  │
│  │  └──────────────────────────────┘  └──────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                            │                                             │
│                      ┌─────────────────────┴─────────────────────┐                      │
│                      │  USE_PYTHON_BACKEND=true (Optional Proxy) │                      │
│                      └─────────────────────┬─────────────────────┘                      │
│                                            ▼                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     Python FastAPI Server (Port 5001) [Optional]                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                              API Routes                                      │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │  │  │
│  │  │  │ /api/budget │ │  /api/tips  │ │/api/recomm- │ │ /api/exchange-rate  │   │  │  │
│  │  │  │   (POST)    │ │             │ │endations/:c │ │                     │   │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │  │  │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────────────┐   │  │  │
│  │  │  │  /api/chat  │ │/api/newslet │ │          /api/health                │   │  │  │
│  │  │  │   (POST)    │ │    ter      │ │                                     │   │  │  │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────────────────────┐   │  │
│  │  │                        Domain Layer (Pure Business Logic)                   │   │  │
│  │  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐   │   │  │
│  │  │  │  CostCalculator  │ │   Seasonality    │ │      TravelTips          │   │   │  │
│  │  │  │  ──────────────  │ │   ───────────    │ │      ───────────         │   │   │  │
│  │  │  │ • calculate_     │ │ • get_season()   │ │ • get_travel_tips()      │   │   │  │
│  │  │  │   budget()       │ │ • get_seasonal_  │ │ • get_city_              │   │   │  │
│  │  │  │ • convert_to_    │ │   multiplier()   │ │   recommendations()      │   │   │  │
│  │  │  │   jpy()          │ │ • get_weather_   │ │ • MONEY_SAVING_TIPS      │   │   │  │
│  │  │  │ • CITY_PRICING   │ │   info()         │ │ • CITY_RECOMMENDATIONS   │   │   │  │
│  │  │  └──────────────────┘ └──────────────────┘ └──────────────────────────┘   │   │  │
│  │  └────────────────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                                    │  │
│  │  ┌────────────────────────────────────────────────────────────────────────────┐   │  │
│  │  │                        Services Layer (External APIs)                       │   │  │
│  │  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐   │   │  │
│  │  │  │ ExchangeRate     │ │   ChatService    │ │   GoogleMapsService      │   │   │  │
│  │  │  │ Service          │ │                  │ │                          │   │   │  │
│  │  │  └──────────────────┘ └──────────────────┘ └──────────────────────────┘   │   │  │
│  │  └────────────────────────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            │ SQL (PostgreSQL Protocol)
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA LAYER                                            │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              PostgreSQL Database                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                              Tables                                          │  │  │
│  │  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐    │  │  │
│  │  │  │  chat_sessions   │ │  chat_messages   │ │    newsletter_subs       │    │  │  │
│  │  │  │  ──────────────  │ │  ──────────────  │ │    ────────────────      │    │  │  │
│  │  │  │ • id (PK)        │ │ • id (PK)        │ │ • id (PK)                │    │  │  │
│  │  │  │ • session_id     │ │ • session_id(FK) │ │ • email                  │    │  │  │
│  │  │  │ • created_at     │ │ • role           │ │ • created_at             │    │  │  │
│  │  │  │                  │ │ • content        │ │                          │    │  │  │
│  │  │  │                  │ │ • created_at     │ │                          │    │  │  │
│  │  │  └──────────────────┘ └──────────────────┘ └──────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                    │  │
│  │  ┌──────────────────────────────┐  ┌──────────────────────────────────────────┐  │  │
│  │  │      Drizzle ORM (TS)        │  │        SQLAlchemy ORM (Python)           │  │  │
│  │  │  ────────────────────        │  │  ────────────────────────────            │  │  │
│  │  │ • shared/schema.ts           │  │ • python_app/db/models.py                │  │  │
│  │  │ • drizzle-zod validation     │  │ • Alembic migrations                     │  │  │
│  │  │ • Type-safe queries          │  │ • Async session management               │  │  │
│  │  └──────────────────────────────┘  └──────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            │ HTTPS (REST/JSON)
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               EXTERNAL SERVICES LAYER                                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐   │
│  │  Exchange Rate  │ │   OpenRouter    │ │  Google Maps    │ │    Open-Meteo       │   │
│  │      API        │ │      API        │ │      API        │ │       API           │   │
│  │  ─────────────  │ │  ─────────────  │ │  ─────────────  │ │  ─────────────────  │   │
│  │ exchangerate-   │ │ Claude Sonnet   │ │ Places API      │ │ Weather Forecast    │   │
│  │ api.com         │ │ Chat Completions│ │ Embed API       │ │ 14-day forecast     │   │
│  │                 │ │                 │ │ Nearby Search   │ │                     │   │
│  │ SGD→JPY rates   │ │ AI Travel Chat  │ │ Place Details   │ │ Temperature/Rain    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────────┘   │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                          OpenStreetMap Overpass API                              │   │
│  │  ───────────────────────────────────────────────────────────                     │   │
│  │  • Tourism attractions (museums, viewpoints, theme parks)                        │   │
│  │  • Historic sites (castles, monuments, shrines, temples)                         │   │
│  │  • Leisure locations (parks, gardens)                                            │   │
│  │  • Geo-coordinates for mapping                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Budget Calculation Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │  React   │      │  Express │      │ Exchange │      │  Client  │
│  Input   │─────▶│  Form    │─────▶│   API    │─────▶│ Rate API │─────▶│ Response │
└──────────┘      └──────────┘      └──────────┘      └──────────┘      └──────────┘
     │                 │                 │                 │                 │
     │  Form Data      │  POST /budget   │  GET /latest    │  SGD→JPY rate   │
     │  • city         │  • city         │  /SGD           │  • rate: 0.0089 │
     │  • days         │  • num_days     │                 │                 │
     │  • travelers    │  • num_travelers│                 │                 │
     │  • style        │  • travel_style │                 │                 │
     │  • month        │  • month        │                 │                 │
     └─────────────────┴─────────────────┴─────────────────┴─────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   CostCalculator    │
                              │   ───────────────   │
                              │ 1. Get city pricing │
                              │ 2. Apply seasonal   │
                              │    multiplier       │
                              │ 3. Calculate totals │
                              │ 4. Convert to JPY   │
                              └─────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │   Response JSON     │
                              │   ─────────────     │
                              │ • breakdown         │
                              │   - flights         │
                              │   - accommodation   │
                              │   - food            │
                              │   - transport       │
                              │   - activities      │
                              │   - shopping        │
                              │   - total           │
                              │ • exchange_rate     │
                              │ • total_jpy         │
                              │ • season            │
                              └─────────────────────┘
```

### 2. Chat Message Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │ Chatbot  │      │  Express │      │OpenRouter│      │ Database │
│  Message │─────▶│Component │─────▶│   API    │─────▶│   API    │─────▶│  (Save)  │
└──────────┘      └──────────┘      └──────────┘      └──────────┘      └──────────┘
     │                 │                 │                 │                 │
     │  "Plan 5 day    │  POST /chat     │  POST /chat/   │  Store message  │
     │   Tokyo trip"   │  • messages[]   │  completions   │  • session_id   │
     │                 │  • sessionId    │  • model:      │  • role: user   │
     │                 │                 │    claude-3.5  │  • content      │
     │                 │                 │  • messages    │                 │
     │                 │                 │                 │                 │
     │                 │◀────────────────┼─────────────────┼─────────────────┤
     │                 │  AI Response    │  Stream/JSON    │  Store response │
     │                 │  with travel    │  completion     │  • role: asst   │
     │◀────────────────┤  advice         │                 │  • content      │
     │  Display in UI  │                 │                 │                 │
     └─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### 3. Weather & Attractions Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  City    │      │  React   │      │  Express │      │ External │
│ Selection│─────▶│  Query   │─────▶│   API    │─────▶│   APIs   │
└──────────┘      └──────────┘      └──────────┘      └──────────┘
     │                 │                 │                 │
     │  Select         │  Parallel       │                 │
     │  "Tokyo"        │  Requests:      │                 │
     │                 │                 │                 │
     │                 │  ┌──────────────┼─────────────────┤
     │                 │  │GET /weather/ │  Open-Meteo     │
     │                 │  │   Tokyo      │  14-day forecast│
     │                 │  └──────────────┼─────────────────┤
     │                 │                 │                 │
     │                 │  ┌──────────────┼─────────────────┤
     │                 │  │GET /attract- │  OSM Overpass   │
     │                 │  │ions/Tokyo    │  POI query      │
     │                 │  └──────────────┼─────────────────┤
     │                 │                 │                 │
     │                 │  ┌──────────────┼─────────────────┤
     │                 │  │GET /place-   │  Google Maps    │
     │                 │  │details?...   │  Places API     │
     │                 │  └──────────────┼─────────────────┤
     │                 │                 │                 │
     │◀────────────────┼─────────────────┼─────────────────┤
     │  Combined UI    │  Merged data    │  Cached results │
     │  with weather,  │  with ratings   │  (24hr/7day)    │
     │  attractions    │                 │                 │
     └─────────────────┴─────────────────┴─────────────────┘
```

## Component Details

### Frontend Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **Home Page** | Main calculator interface | Trip configuration, budget breakdown, charts |
| **Chatbot** | AI travel assistant | Message history, session persistence, travel-focused responses |
| **Activity Cards** | Display attractions | Google Maps links, ratings, pricing, categories |
| **Weather Widget** | 14-day forecast | Temperature, precipitation, weather codes |
| **Budget Charts** | Cost visualization | Pie charts (category breakdown), bar charts (daily costs) |
| **Theme Provider** | Dark/Light mode | System preference detection, localStorage persistence |

### Backend Services

| Service | Responsibility | Caching Strategy |
|---------|----------------|------------------|
| **Exchange Rate** | Currency conversion (SGD→JPY) | 1-hour TTL, fallback to default rate |
| **Weather** | 14-day forecasts via Open-Meteo | React Query cache (5 min stale time) |
| **Attractions** | POI data from OpenStreetMap | 24-hour server-side cache |
| **Place Details** | Ratings from Google Maps | 7-day server-side cache |
| **Chat** | AI responses via OpenRouter | No cache, messages stored in DB |

### Domain Modules (Python)

| Module | Functions | Data |
|--------|-----------|------|
| **cost_calculator.py** | `calculate_budget()`, `convert_to_jpy()` | `CITY_PRICING`, `FLIGHT_PRICES` |
| **seasonality.py** | `get_season()`, `get_seasonal_multiplier()`, `get_weather_info()` | `SEASONS`, `MONTH_MULTIPLIERS` |
| **travel_tips.py** | `get_travel_tips()`, `get_city_recommendations()` | `MONEY_SAVING_TIPS`, `CITY_RECOMMENDATIONS` |

## Design Patterns

### 1. Domain-Driven Design (Python Backend)
The Python backend follows DDD principles with clear separation:
- **Domain Layer**: Pure business logic with no framework dependencies
- **Services Layer**: External API adapters with error handling
- **API Layer**: FastAPI routes with request/response validation
- **DB Layer**: SQLAlchemy models and session management

### 2. Gateway Pattern
Express.js serves as the primary gateway:
- Handles all frontend requests on port 5000
- Optionally proxies to Python backend (port 5001)
- Provides caching layer for external API responses
- Serves static files in production

### 3. Repository Pattern
Database access is abstracted through storage interfaces:
- TypeScript: `IStorage` interface in `server/storage.ts`
- Python: SQLAlchemy models with async session management

### 4. Service Adapter Pattern
External APIs are wrapped in service classes:
- `ExchangeRateService`: Currency API with fallback
- `ChatService`: OpenRouter API with system prompts
- `GoogleMapsService`: Places API with rate limiting awareness

### 5. Client-Side Caching
TanStack Query manages frontend caching:
- Automatic refetching on window focus
- Configurable stale times per query
- Optimistic updates for mutations
- Query invalidation after mutations

## Security Considerations

### Security Middleware Stack

#### Express.js Security (Port 5000)

The Express.js server implements a comprehensive security middleware stack defined in `server/security.ts`:

| Middleware | Purpose | Configuration |
|------------|---------|---------------|
| **Helmet** | Sets security HTTP headers | CSP, X-Frame-Options, X-Content-Type-Options, HSTS |
| **Rate Limiting (General)** | Prevents abuse | 60 requests/minute per IP |
| **Rate Limiting (Chat)** | Protects AI endpoint | 10 requests/minute per IP |
| **CORS** | Cross-origin control | Whitelisted origins only (localhost, *.replit.dev) |
| **Request Size Limit** | Prevents large payload attacks | Maximum 100KB body |
| **Input Validation** | express-validator middleware | Per-endpoint validation rules |

#### Python FastAPI Security (Port 5001)

The Python backend implements matching security in `python_app/middleware/security.py`:

| Middleware | Purpose | Configuration |
|------------|---------|---------------|
| **SecurityHeadersMiddleware** | HTTP security headers | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection |
| **RateLimitMiddleware** | Request throttling | 60 req/min general, 10 req/min chat |
| **RequestValidationMiddleware** | Pattern detection | Blocks XSS, SQL injection patterns |
| **CORSMiddleware** | Cross-origin control | Whitelisted origins matching Express |

### Input Validation & Sanitization

All user input is validated and sanitized before processing:

| Input Type | Validation | Sanitization |
|------------|------------|--------------|
| **City Parameters** | Case-insensitive whitelist (Tokyo, Osaka, Kyoto, etc.) | Auto-normalized to proper case |
| **Session IDs** | UUID v4 OR legacy alphanumeric format | Blocks special characters |
| **Chat Messages** | Max 4000 chars, max 50 messages | Strips HTML tags, event handlers, javascript:/data: URIs |
| **Coordinates** | Range validation (lat: -90 to 90, lng: -180 to 180) | Numeric type coercion |
| **Email (Newsletter)** | Regex validation, max 254 chars | Trim whitespace |
| **Budget Request** | Days 1-90, travelers 1-20, month 1-12, valid travel style | City name normalization |
| **Place Names** | Max 200 chars | XSS pattern removal |

### Sanitization Functions

Both backends implement consistent sanitization:

```typescript
// TypeScript (server/security.ts)
export const sanitizeString = (input: string, maxLength: number = 2000): string => {
  return input
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, "")           // Strip HTML tags
    .replace(/on\w+\s*=/gi, "")        // Remove event handlers
    .replace(/javascript:/gi, "")      // Block javascript: URIs
    .replace(/data:/gi, "")            // Block data: URIs
    .trim();
};
```

```python
# Python (python_app/middleware/security.py)
def sanitize_string(input_str: str, max_length: int = 2000) -> str:
    sanitized = input_str[:max_length]
    sanitized = re.sub(r"<[^>]*>", "", sanitized)
    sanitized = re.sub(r"on\w+\s*=", "", sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r"javascript:", "", sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r"data:", "", sanitized, flags=re.IGNORECASE)
    return sanitized.strip()
```

### Security Best Practices

| Layer | Security Measure | Implementation |
|-------|------------------|----------------|
| **Environment** | API keys stored in secrets | Never exposed to client, accessed via process.env |
| **Input Validation** | Schema validation | Zod (TS), Pydantic (Python), express-validator |
| **Chat Safety** | AI topic restriction | System prompt limits to Japan travel topics only |
| **Database** | SQL injection prevention | Parameterized queries via Drizzle/SQLAlchemy ORMs |
| **CORS** | Origin whitelisting | Specific domains, no wildcards |
| **CSP** | Script source control | Helmet CSP configuration |
| **Rate Limiting** | DoS prevention | IP-based throttling with configurable windows |
| **Request Sanitization** | XSS prevention | Multi-pattern sanitization on all user input |
| **Session Security** | Flexible ID format | Supports UUID and legacy alphanumeric for backward compatibility |

## Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Server Caching** | In-memory caches for exchange rates, attractions, place details |
| **Client Caching** | TanStack Query with 5-minute staleTime, 30-minute gcTime |
| **React.memo** | Memoized StarRating, ActivityRating components to prevent re-renders |
| **Debounced Search** | useDebounce hook (200ms) for search inputs |
| **gzip Compression** | Level 6 compression with 1KB threshold via compression middleware |
| **ETag Caching** | Exchange rate and weather endpoints support conditional requests (304) |
| **Static Asset Caching** | JS/CSS: 1 year immutable; Images: 1 day; HTML: no-cache |
| **Image Optimization** | Local city images with lazy loading and async decoding |
| **Parallel Requests** | Promise.all for independent API calls |

## Environment Configuration

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `OPENROUTER_API_KEY` | AI chat functionality | Required for chat |
| `GOOGLE_MAPS_API_KEY` | Maps and place details | Required for maps |
| `SESSION_SECRET` | Session encryption | Required |
| `USE_PYTHON_BACKEND` | Enable Python backend proxy | `false` |
| `PYTHON_BACKEND_URL` | Python server URL | `http://localhost:5001` |

## Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| Express.js | 5000 | Public-facing gateway, frontend hosting |
| Python FastAPI | 5001 | Internal API (when enabled) |
| PostgreSQL | 5432 | Database (via DATABASE_URL) |

## Docker Deployment

The application supports containerized deployment using Docker with multi-stage builds for optimized production images.

### Container Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Docker Compose Network                             │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐  │
│  │   PostgreSQL    │    │  Express.js     │    │  Python FastAPI         │  │
│  │   Container     │◄───│  Container      │───►│  Container (Optional)   │  │
│  │                 │    │                 │    │                         │  │
│  │  Port: 5432     │    │  Port: 5000     │    │  Port: 5001             │  │
│  │  Volume: data   │    │  Health: /api/  │    │  Health: /api/health    │  │
│  │                 │    │         health  │    │                         │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────┘  │
│         ▲                       ▲                        ▲                   │
│         │                       │                        │                   │
│    Named Volume            Host: 5000               Profile: python          │
│    postgres_data                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Docker Images

#### Node.js/Express Image (Dockerfile)

| Stage | Purpose | Key Operations |
|-------|---------|----------------|
| **Builder** | Compile application | Install all deps, copy source, run `npm run build` |
| **Production** | Runtime image | Install prod deps only, copy dist/, run as non-root |

Build output structure:
```
dist/
├── index.cjs          # Server bundle (Express + all routes)
└── public/            # Client assets
    ├── index.html
    ├── favicon.png
    └── assets/
        ├── index-*.css
        └── index-*.js
```

#### Python/FastAPI Image (Dockerfile.python)

| Stage | Purpose | Key Operations |
|-------|---------|----------------|
| **Builder** | Install dependencies | Create venv, install from requirements.txt |
| **Production** | Runtime image | Copy venv, copy app code, run as non-root |

### Docker Compose Services

| Service | Image | Ports | Dependencies | Profile |
|---------|-------|-------|--------------|---------|
| **db** | postgres:15-alpine | 5432 | - | default |
| **app** | japan-travel-app | 5000 | db (healthy) | default |
| **python-api** | japan-travel-python | 5001 | db (healthy) | python |

### Security Features

| Feature | Implementation |
|---------|----------------|
| **Non-root Users** | Both containers run as UID 1001 |
| **Health Checks** | HTTP checks on /api/health endpoints |
| **Named Volumes** | PostgreSQL data persisted across restarts |
| **Environment Isolation** | Secrets passed via environment variables |
| **Minimal Images** | Alpine-based Node, slim Python images |

### Build Commands

```bash
# Build Node.js image
docker build -t japan-travel-app .

# Build Python image
docker build -t japan-travel-python -f Dockerfile.python .

# Start with docker-compose (Express only)
docker-compose up -d

# Start with Python backend
docker-compose --profile python up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Environment Variables (Docker)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | Yes | postgres | Database username |
| `POSTGRES_PASSWORD` | Yes | - | Database password |
| `POSTGRES_DB` | Yes | japan_travel | Database name |
| `SESSION_SECRET` | Yes | - | Session encryption key |
| `OPENROUTER_API_KEY` | Yes | - | AI chatbot API key |
| `GOOGLE_MAPS_API_KEY` | Yes | - | Maps integration key |
| `USE_PYTHON_BACKEND` | No | false | Enable Python backend proxy |

### Configuration Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for Node.js/Express |
| `Dockerfile.python` | Multi-stage build for Python/FastAPI |
| `docker-compose.yml` | Service orchestration |
| `.dockerignore` | Exclude files from build context |
| `.env.example` | Environment variable template |

## Data Analytics

The application includes comprehensive analytics infrastructure for business intelligence and user behavior tracking.

### Analytics Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Analytics Data Model                                │
│                                                                              │
│  ┌─────────────────────────┐     ┌─────────────────────────────────────┐    │
│  │   budget_calculations   │     │            page_views               │    │
│  │   ───────────────────   │     │            ──────────               │    │
│  │ • id (serial PK)        │     │ • id (serial PK)                    │    │
│  │ • session_id            │     │ • session_id                        │    │
│  │ • departure_date        │     │ • page_path                         │    │
│  │ • return_date           │     │ • referrer                          │    │
│  │ • travelers             │     │ • user_agent                        │    │
│  │ • cities[]              │     │ • created_at                        │    │
│  │ • travel_style          │     └─────────────────────────────────────┘    │
│  │ • total_budget_sgd      │                                                │
│  │ • per_person_sgd        │     ┌─────────────────────────────────────┐    │
│  │ • exchange_rate         │     │           user_events               │    │
│  │ • breakdown (JSONB)     │     │           ───────────               │    │
│  │ • created_at            │     │ • id (serial PK)                    │    │
│  └─────────────────────────┘     │ • session_id                        │    │
│                                  │ • event_type                        │    │
│  ┌─────────────────────────┐     │ • event_category                    │    │
│  │   newsletter_subscribers│     │ • event_data (JSONB)                │    │
│  │   ─────────────────────│     │ • created_at                        │    │
│  │ • id (serial PK)        │     └─────────────────────────────────────┘    │
│  │ • email (unique)        │                                                │
│  │ • created_at            │     ┌─────────────────────────────────────┐    │
│  └─────────────────────────┘     │          chat_sessions              │    │
│                                  │          ─────────────              │    │
│                                  │ • id (serial PK)                    │    │
│                                  │ • session_id (unique)               │    │
│                                  │ • created_at                        │    │
│                                  │ • updated_at                        │    │
│                                  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Analytics API Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/analytics/budget` | POST | Track budget calculation | `{ success, id }` |
| `/api/analytics/pageview` | POST | Track page view | `{ success, id }` |
| `/api/analytics/event` | POST | Track user event | `{ success, id }` |
| `/api/analytics/dashboard` | GET | Get analytics summary | Dashboard data |

### Dashboard Data Structure

```json
{
  "period": "30 days",
  "totalBudgetCalculations": 150,
  "totalPageViews": 5000,
  "totalUserEvents": 2500,
  "totalNewsletterSubscribers": 75,
  "totalChatSessions": 200,
  "popularCities": [
    { "city": "Tokyo", "count": 80 },
    { "city": "Osaka", "count": 45 },
    { "city": "Kyoto", "count": 40 }
  ],
  "popularTravelStyles": [
    { "style": "midrange", "count": 90 },
    { "style": "budget", "count": 40 },
    { "style": "luxury", "count": 20 }
  ],
  "averageBudget": 3500.00,
  "averageTravelers": 2.5,
  "recentCalculations": [...]
}
```

### Event Types for Tracking

| Event Category | Event Types | Use Case |
|---------------|-------------|----------|
| `navigation` | `page_view`, `tab_switch` | Track user journey |
| `interaction` | `button_click`, `form_submit` | Track UI engagement |
| `calculator` | `budget_calculated`, `city_selected` | Track feature usage |
| `chat` | `message_sent`, `session_started` | Track chatbot engagement |
| `conversion` | `newsletter_signup`, `trip_planned` | Track business goals |

### Business Intelligence Queries

The analytics schema supports the following business questions:

| Business Question | Data Source |
|-------------------|-------------|
| Which cities are most popular? | `budget_calculations.cities` aggregation |
| What is the average trip budget? | `budget_calculations.total_budget_sgd` avg |
| How many travelers per trip? | `budget_calculations.travelers` avg |
| What travel style is preferred? | `budget_calculations.travel_style` count |
| Which pages get most traffic? | `page_views.page_path` aggregation |
| What is the user conversion rate? | `newsletter_subscribers` / `page_views` ratio |
| How engaged are users with chat? | `chat_sessions` + `chat_messages` count |

### Analytics Implementation Files

| File | Purpose |
|------|---------|
| `shared/schema.ts` | Drizzle schema definitions for analytics tables |
| `server/storage.ts` | Analytics CRUD operations and dashboard queries |
| `server/routes.ts` | Analytics API endpoint handlers |
| `python_app/db/models.py` | SQLAlchemy models for Python backend |
| `python_app/schemas/analytics.py` | Pydantic validation schemas |
| `python_app/api/routes.py` | Python analytics endpoints |

### Data Retention and Privacy

| Consideration | Implementation |
|---------------|----------------|
| **Session ID** | Optional, can be null for anonymous tracking |
| **User Agent** | Stored for device analytics, truncated to 500 chars |
| **Personal Data** | Only email stored (newsletter), no PII in events |
| **Data Sanitization** | All inputs sanitized before storage |
| **Retention** | No automatic deletion (implement as needed) |

---

## Horizontal Scaling Architecture

The application is designed to scale horizontally for high-availability Docker deployments.

### Scaled Deployment Architecture

```
                                    ┌─────────────────┐
                                    │   Load Balancer │
                                    │     (nginx)     │
                                    │    Port 80/443  │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
           ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
           │  Express App  │        │  Express App  │        │  Express App  │
           │   Replica 1   │        │   Replica 2   │        │   Replica 3   │
           │   Port 5000   │        │   Port 5000   │        │   Port 5000   │
           └───────┬───────┘        └───────┬───────┘        └───────┬───────┘
                   │                        │                        │
                   └────────────────────────┼────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
                    ▼                                               ▼
           ┌───────────────┐                               ┌───────────────┐
           │     Redis     │                               │  PostgreSQL   │
           │  Session/Cache│                               │   Database    │
           │   Port 6379   │                               │   Port 5432   │
           └───────────────┘                               └───────────────┘
```

### Stateless Application Design

For horizontal scaling, the application follows stateless architecture principles:

| Component | Single Instance | Scaled (Multi-Replica) |
|-----------|-----------------|------------------------|
| Sessions | In-memory (memorystore) | Redis (connect-redis) |
| Rate Limiting | In-memory counters | Redis-backed counters |
| Exchange Rate Cache | In-memory | Redis with TTL |
| Attractions Cache | In-memory | Redis with TTL |
| File Uploads | Local filesystem | Object storage (S3/GCS) |

**Note**: The infrastructure (Redis service, environment variables) is configured. To fully enable stateless scaling, implement Redis-backed session storage using `connect-redis` and migrate caches from in-memory objects to Redis.

### Health Check Endpoints

The application exposes Kubernetes/Docker-compatible health endpoints:

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/api/health` | Full health status | `{ status, checks: { server, database } }` |
| `/api/health/live` | Liveness probe | `{ status: "alive" }` |
| `/api/health/ready` | Readiness probe | `{ status: "ready" }` or 503 |

### Load Balancer Configuration (nginx)

The nginx configuration (`nginx/nginx.conf`) provides:

- **Least connections** load balancing algorithm
- **Health checks** with automatic failover
- **WebSocket support** for real-time features
- **Request buffering** for large payloads
- **X-Forwarded headers** for proper client IP tracking

### Docker Compose Scaling

Use `docker-compose.scaled.yml` for multi-replica deployment:

```bash
# Start with 3 Express replicas and 2 Python replicas
docker-compose -f docker-compose.scaled.yml up -d

# Scale dynamically
docker-compose -f docker-compose.scaled.yml up -d --scale app=5 --scale python-api=3
```

### Environment Variables for Scaling

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |
| `TRUST_PROXY` | Enable proxy headers | `true` |
| `NODE_ENV` | Production mode | `production` |
| `DATABASE_URL` | PostgreSQL connection | Required |

### Redis Key Namespaces

| Namespace | Purpose | TTL |
|-----------|---------|-----|
| `sess:*` | Session data | 24h |
| `cache:exchange:` | Exchange rate cache | 1h |
| `cache:places:*` | Place details cache | 7d |
| `cache:attractions:*` | OSM attractions | 24h |
| `rate:*` | Rate limiting counters | 1min |

### Connection Pooling

For high-replica deployments, use connection pooling:

| Service | Recommendation |
|---------|----------------|
| PostgreSQL | PgBouncer for connection pooling |
| Redis | Built-in connection pooling via ioredis |

### Monitoring and Observability

For production deployments, integrate:

| Category | Recommended Tools |
|----------|-------------------|
| Metrics | Prometheus + Grafana |
| Logging | ELK Stack or Loki |
| Tracing | Jaeger or Zipkin |
| Alerts | Alertmanager |

### Kubernetes Deployment

For Kubernetes deployments:

```yaml
# Horizontal Pod Autoscaler example
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: japan-travel-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: japan-travel-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Scaling Considerations

| Concern | Solution |
|---------|----------|
| **Session Affinity** | Not required (Redis-backed sessions) |
| **Database Connections** | Use connection pooling with PgBouncer |
| **Cache Invalidation** | Redis pub/sub for cross-replica coordination |
| **Zero-Downtime Deploys** | Rolling updates with health checks |
| **Log Aggregation** | Centralized logging (stdout → log collector) |

## Security Architecture

The application implements a comprehensive defense-in-depth security strategy across multiple layers.

### Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Layer 1: Web Application Firewall                   │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │  • ModSecurity v3 with OWASP Core Rule Set v4                         │  │
│  │  • 100+ attack patterns blocked (SQLi, XSS, RCE, Log4Shell, etc.)     │  │
│  │  • Paranoia Level 2 with custom rules for modern attacks              │  │
│  │  • Scanner/bot detection and rate limiting                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Layer 2: Application Security                       │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │  • Helmet.js security headers (CSP, X-Frame-Options, etc.)            │  │
│  │  • Rate limiting (60 req/min general, 10 req/min for chat)            │  │
│  │  • Input validation with Zod (TS) and Pydantic (Python)               │  │
│  │  • XSS sanitization on all user input                                 │  │
│  │  • SSRF protection with internal IP range blocking                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Layer 3: Container Security                         │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │  • CIS Docker Benchmark Level 2 compliance                            │  │
│  │  • Non-root users, read-only filesystems                              │  │
│  │  • Capability dropping (cap_drop: ALL)                                │  │
│  │  • Resource limits (memory, CPU, PIDs)                                │  │
│  │  • Network isolation with disabled ICC                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Layer 4: Data Security                              │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │  • SQL injection prevention via parameterized queries (ORMs)          │  │
│  │  • Secrets stored as environment variables, never in code             │  │
│  │  • Session encryption with configurable secrets                       │  │
│  │  • API keys proxied server-side, never exposed to clients             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### WAF Attack Coverage

| Attack Category | CRS Rule Range | Custom Rules |
|-----------------|----------------|--------------|
| SQL Injection | 942xxx | - |
| Cross-Site Scripting (XSS) | 941xxx | - |
| Remote Code Execution | 932xxx | - |
| Local File Inclusion | 930xxx | - |
| Remote File Inclusion | 931xxx | - |
| Log4Shell / JNDI | - | 1000500 |
| HTTP Request Smuggling | - | 1000700-1000701 |
| SSRF | - | 1000600 |
| XXE | - | 1000900-1000901 |
| Scanner/Bot Detection | 913xxx | - |

### Security Documentation

| Document | Purpose |
|----------|---------|
| [HARDENING.md](HARDENING.md) | CIS Docker Benchmark controls, WAF configuration |
| [server/security.ts](server/security.ts) | Express.js security middleware |
| [python_app/middleware/security.py](python_app/middleware/security.py) | FastAPI security middleware |
| [tests/waf_simulation.py](tests/waf_simulation.py) | Attack simulation test suite |

For detailed security hardening information, see [HARDENING.md](HARDENING.md).
