# Japan Travel Budget Calculator

## Overview

A comprehensive Japan travel budget calculator designed specifically for Singaporean travelers. The application allows users to estimate trip costs including flights, accommodation, transportation, food, activities, and shopping. All calculations are done in SGD with real-time JPY exchange rate conversion.

The calculator features a Material Design-inspired interface with Japanese minimalist aesthetic, supporting both light and dark themes. Users can configure trip details, select destinations, and get detailed cost breakdowns with visual charts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Query for server state, React useState for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Charts**: Recharts for budget visualization (pie charts, bar charts)
- **Date Handling**: date-fns for date calculations

### Backend Architecture (Modular Python)
- **Primary Backend**: FastAPI (Python) with modular architecture
- **Gateway**: Express.js serves frontend and proxies API requests to Python
- **API Design**: RESTful endpoints under `/api/` prefix
- **Port Configuration**: Express on 5000 (public), Python on 5001 (internal)

### Python Backend Structure (`python_app/`)
```
python_app/
├── main.py           # FastAPI app entry point
├── api/              # Route handlers
│   └── routes.py     # API endpoint definitions
├── domain/           # Pure business logic (no framework dependencies)
│   ├── cost_calculator.py   # Budget calculation engine
│   ├── seasonality.py       # Season detection and pricing multipliers
│   └── travel_tips.py       # Tips and recommendations
├── services/         # External API integrations
│   ├── exchange_rate.py     # Currency conversion service
│   ├── chat.py              # OpenRouter/Claude integration
│   └── google_maps.py       # Google Maps API
├── db/               # Database layer
│   ├── database.py          # SQLAlchemy connection
│   └── models.py            # ORM models
├── schemas/          # Pydantic validation models
│   ├── budget.py
│   ├── chat.py
│   ├── analytics.py
│   └── newsletter.py
└── tests/            # Python test suite
    ├── test_api.py
    ├── test_cost_calculator.py
    ├── test_seasonality.py
    └── test_travel_tips.py
```

### TypeScript Tests (`tests/`)
```
tests/
├── api.test.ts           # Express API integration tests
├── setup.ts              # Test setup configuration
├── unit/                 # Unit tests
│   ├── schema.test.ts           # Schema validation tests
│   ├── pricing-data.test.ts     # Pricing data tests
│   ├── security.test.ts         # Security function tests
│   └── calculator-logic.test.ts # Calculator business logic
└── integration/          # Integration tests
    └── api.test.ts       # API structure tests
```

### Startup Scripts
- `start-all.sh` - Starts both Python backend (port 5001) and Node.js frontend (port 5000) with proper cleanup handling
- `run_python.py` - Python FastAPI entry point with uvicorn

### Data Layer
- **Python ORM**: SQLAlchemy with Alembic migrations
- **Legacy ORM**: Drizzle ORM (TypeScript, for compatibility)
- **Database**: PostgreSQL
- **Schema Validation**: Pydantic (Python), Zod (TypeScript)

### Key Design Patterns
- **Domain-Driven Design**: Business logic isolated in `domain/` package
- **Service Layer**: External APIs wrapped in `services/` package
- **Repository Pattern**: Database access through `db/` layer
- **Dependency Injection**: FastAPI's Depends for clean dependency management

### Build Configuration
- **Development**: `npm run dev` runs Express + Vite; Python runs separately via `python run_python.py`
- **Production**: Express serves static frontend and proxies to Python backend
- **Database**: `npm run db:push` (Drizzle) or `alembic upgrade head` (SQLAlchemy)

### Environment Variables
- `USE_PYTHON_BACKEND=true` - Enable Python backend (proxy mode)
- `PYTHON_BACKEND_URL` - Python backend URL (default: http://localhost:5001)
- `DATABASE_URL` - PostgreSQL connection string
- `OPENROUTER_API_KEY` - OpenRouter API key for chat
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `SESSION_SECRET` - Session encryption key

## External Dependencies

### Third-Party APIs
- **Exchange Rate API**: `https://api.exchangerate-api.com/v4/latest/SGD` - Fetched hourly with caching for SGD to JPY conversion
- **OpenRouter API**: Claude Sonnet for travel chat assistant
- **Google Maps API**: Place details and ratings

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **SQLAlchemy**: Python ORM with Alembic migrations
- **Drizzle ORM**: TypeScript ORM (legacy compatibility)

### External Services
- **Unsplash**: Hero images and city thumbnails loaded from Unsplash CDN

### Key Python Packages
- **Framework**: fastapi, uvicorn
- **Database**: sqlalchemy, alembic, psycopg2-binary
- **Validation**: pydantic, email-validator
- **HTTP**: httpx (async HTTP client)
- **Config**: python-dotenv

### Key NPM Packages
- **UI**: @radix-ui/* primitives, class-variance-authority, lucide-react icons
- **Data**: @tanstack/react-query, zod, drizzle-orm, drizzle-zod
- **Proxy**: http-proxy-middleware
- **Utilities**: date-fns, clsx, tailwind-merge

## Security Configuration

### Application Security
- **Rate Limiting**: 60 req/min general, 10 req/min for chat endpoints
- **Input Validation**: Zod schemas (TypeScript), Pydantic models (Python)
- **XSS Protection**: Multi-pattern sanitization on all user input
- **SSRF Protection**: Internal IP range blocking for coordinate validation

### Docker Security (Production)
- **CIS Docker Benchmark Level 2** compliance
- **WAF**: ModSecurity v3 with OWASP Core Rule Set v4
- **Container Hardening**: Non-root users, read-only filesystems, capability dropping

### Security Documentation
- `HARDENING.md` - CIS controls mapping, WAF configuration, attack simulation results
- `server/security.ts` - Express.js security middleware (60+ attack pattern signatures)
- `python_app/middleware/security.py` - FastAPI security middleware
- `tests/waf_simulation.py` - Attack simulation test suite (36 scenarios)

## Performance Optimizations

### Server-Side
- **Compression**: gzip compression at level 6 with 1KB threshold via `compression` middleware
- **ETag Caching**: Exchange rate and weather endpoints return ETags for conditional requests (304 responses)
- **Static Asset Caching**: Configured in `server/static.ts`
  - JS/CSS/Fonts: 1 year with `immutable` directive
  - Images: 1 day cache
  - HTML: no-cache for fresh content

### Client-Side
- **React Query Cache**: 5-minute staleTime, 30-minute gcTime for optimal cache reuse
- **Debounced Search**: `useDebounce` hook (200ms) for search inputs to reduce re-renders
- **Image Optimization**: Lazy loading with `loading="lazy"` and `decoding="async"` for thumbnails
- **Local City Images**: All 10 city images stored locally in `attached_assets/` for reliable loading
- **Code Splitting**: React.lazy for Home/NotFound pages, and heavy components (Chatbot, WeatherForecast, BeginnerGuide)
- **Component Memoization**: React.memo applied to all calculator components (Flight, Food, Accommodation, Transport, Shopping, Budget, Activities)
- **Prefetching**: Exchange rate prefetched on app initialization via QueryClient

### API Caching Strategy
- **Exchange Rate**: Cached for 1 hour server-side, ETag-based conditional requests
- **Weather Data**: Cached for 15 minutes server-side, ETag-based conditional requests
- **Place Details**: Cached for 7 days (Google Maps API quota optimization)
- **Attractions**: Cached for 24 hours, ETag-based conditional requests (OpenStreetMap data)

### Database Optimizations
- **Connection Pooling**: PostgreSQL configured with max 10 connections, 20s idle timeout, prepared statements enabled

## Recent Changes

- **Jan 2026**: Enhanced security with 60+ attack pattern signatures for SQL injection, XSS, command injection, and more
- **Jan 2026**: Added malicious user-agent blocking for security scanners (sqlmap, nikto, burpsuite, etc.)
- **Jan 2026**: WAF simulation tests expanded from 27 to 36 scenarios with 100% pass rate
- **Jan 2026**: Security fix - Removed @vercel/node package and api/index.ts (unused Vercel serverless), eliminating all npm vulnerabilities
- **Jan 2026**: Updated Express to 4.22.1, body-parser to 1.20.4, qs to 6.14.1 for security patches
- **Jan 2026**: Docker configuration updates: nginx service with health checks, attached_assets support, docker-requirements.txt
- **Jan 2026**: All 162 tests passing (119 TypeScript + 43 Python) with 0 npm vulnerabilities
- **Jan 2026**: Major performance optimizations: React.lazy code splitting, React.memo for all calculator components, QueryClient prefetching, ETag caching for attractions API
- **Jan 2026**: Database connection pooling with max 10 connections, 20s idle timeout, prepared statements
- **Jan 2026**: Export button now opens HTML budget summary in new browser tab (instead of downloading)
- **Jan 2026**: Changed emergency fund from percentage-based to fixed $100 per person
- **Jan 2026**: Added React.memo optimization to StarRating and ActivityRating components
- **Jan 2026**: Added performance optimizations including compression, ETags, and static asset caching
- **Jan 2026**: Created `useDebounce` hook at `client/src/hooks/use-debounce.ts`
- **Jan 2026**: Updated all city images to local assets for better reliability
- **Jan 2026**: Fixed activities calculator rendering issue with type assertions

## Test Summary

- **Total Tests**: 162 (119 TypeScript + 43 Python)
- **npm Vulnerabilities**: 0
- **Test Commands**:
  - TypeScript: `npx vitest run`
  - Python: `cd python_app && python -m pytest tests/ -v`
  - Both: `./start-all.sh` then run tests in separate terminal

## API Endpoints

### Express.js Routes (server/routes.ts)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Full health status with dependencies |
| `/api/health/live` | GET | Kubernetes liveness probe |
| `/api/health/ready` | GET | Kubernetes readiness probe |
| `/api/exchange-rate` | GET | SGD to JPY exchange rate with ETag caching |
| `/api/weather/:city` | GET | Weather forecast for city with ETag caching |
| `/api/attractions/:city` | GET | Tourist attractions from OpenStreetMap |
| `/api/place-details` | GET | Google Maps place details |
| `/api/maps-embed` | GET | Google Maps embed URL |
| `/api/chat/:sessionId` | GET | Chat history for session |
| `/api/chat` | POST | Send message to AI assistant |
| `/api/newsletter/subscribe` | POST | Newsletter subscription |
| `/api/analytics/budget` | POST | Track budget calculation |
| `/api/analytics/pageview` | POST | Track page view |
| `/api/analytics/event` | POST | Track custom event |
| `/api/analytics/dashboard` | GET | Aggregated analytics data |

### Python FastAPI Routes (python_app/api/routes.py)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Python backend health status |
| `/api/health/live` | GET | Liveness probe |
| `/api/health/ready` | GET | Readiness probe |
| `/api/exchange-rate` | GET | Exchange rate service |
| `/api/budget` | POST | Calculate trip budget |
| `/api/tips` | GET | Travel tips by style |
| `/api/recommendations/:city` | GET | City recommendations |
| `/api/chat` | POST | AI chat service |
| `/api/google-maps-configured` | GET | Google Maps API status |
| `/api/newsletter` | POST | Newsletter subscription |
| `/api/analytics/*` | Various | Analytics tracking |
