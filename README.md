# Japan Travel Budget Calculator

A comprehensive travel budget calculator designed specifically for Singaporean travelers planning trips to Japan. Get accurate cost estimates in SGD with real-time exchange rates, seasonal pricing adjustments, and personalized recommendations.

## Features

### Budget Calculator
- **Flight Estimates**: Budget and full-service airline pricing from Singapore to major Japanese cities
- **Accommodation Options**: Hostels, business hotels, and mid-range hotels with city-specific pricing
- **Transportation**: JR Pass options, airport transfers (N'EX, Haruka, Limousine Bus), and IC card budgets
- **Food Budgets**: Three tiers (budget, mid-range, splurge) with daily cost estimates
- **Activities**: Curated list of popular attractions with entry fees and Google Maps integration
- **Shopping & Misc**: Connectivity options (Pocket WiFi, eSIM, Tourist SIM), shopping budgets, and tax-free savings calculator

### Smart Features
- **Real-time Exchange Rates**: Live SGD to JPY conversion with hourly updates and ETag caching
- **Seasonal Pricing**: Automatic adjustments for cherry blossom season, autumn foliage, and year-end holidays
- **Multi-city Support**: Plan trips to Tokyo, Osaka, Kyoto, Hiroshima, Fukuoka, Okinawa, Nagoya, Sapporo, Nara, and Hakone
- **Travel Style Tiers**: Budget, mid-range, and luxury presets that adjust all estimates accordingly
- **Performance Optimized**: gzip compression, ETag caching, debounced search, React.memo components, and optimized React Query settings

### Interactive Elements
- **AI Travel Assistant**: Claude-powered chatbot for personalized Japan travel advice
- **Google Maps Integration**: View activity locations with star ratings and map popups
- **Dynamic Hero Section**: Background images change based on selected destinations
- **Export & Share**: View detailed HTML budget summaries in new browser tab or share trip plans

### Design
- Modern, Japanese-inspired aesthetic with Material Design elements
- Fully responsive for mobile, tablet, and desktop
- Light and dark theme support
- "Made for Singaporeans, by Singaporeans" branding

## Screenshots of the Web Application

### Dark and Light Mode

![Dark Mode](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/001_dark-mode.png)

![Light Mode](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/002_white-mode.png)

### Hero Banner and Destination Selection
Hero Banner will change accordingly to the first Destination City selected by the user. 

![Hero Banner to First Selected Destination](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/003_hero-banner-to-first-selected-destination.png)

### Activities and Attractions

![Activities and Attractions](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/004_activities-n-attractions.png)

### Google Maps Integration

![Google Maps Integration - View 1](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/005_google-maps-integration_1.png)

![Google Maps Integration - View 2](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/005_google-maps-integration_2.png)

### City Recommendations

![City Recommendations](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/006_city-recommendations.png)

### Exported HTML Budget Summary

![Exported HTML](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/007_exported-html.png)

### Newsletter Subscription
Newsletter subscription feature that needs to be to be integrated to a SMTP Server later. It is usually used for affiliate marketing. 

![Subscribe to Newsletter](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/008_subscribe-newletters-marketing.png)

### AI Travel Assistant Chatbot

![Chatbot Interface 1](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/009_chatbot_1.png)

![Chatbot Interface 2](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/009_chatbot_2.png)

There is a simple system prompt within the AI chatbot to prevent users from abusing the chatbot. 

![Chatbot System Prompt](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/009_chatbot-system-prompt.png)

### Security Testing
It shows the database table of the message prompt of the chatbot. It seems the simple system prompt will block off some web application attacks too. 

![Security Testing](https://github.com/benji-sings/jp-budget-cal/blob/main/pictures/010_security-testing_1.png)

## Security

The application implements a comprehensive defense-in-depth security strategy across multiple layers.

### Security Layers

| Layer | Components | Purpose |
|-------|------------|---------|
| **WAF** | ModSecurity v3, OWASP CRS v4 | Block 100+ attack patterns |
| **Application** | Helmet.js, rate limiting, input validation | Runtime protection |
| **Container** | CIS Docker Benchmark Level 2 | Isolation and hardening |
| **Data** | Parameterized queries, encrypted secrets | Data protection |

### Web Application Firewall (WAF)

Production deployments include ModSecurity WAF with OWASP Core Rule Set v4:

- **Attack Coverage**: SQL injection, XSS, RCE, path traversal, Log4Shell, SSRF, XXE
- **Custom Rules**: Modern attack patterns including HTTP request smuggling
- **Scanner Detection**: Blocks known vulnerability scanners (sqlmap, nikto, etc.)
- **Paranoia Level 2**: Balanced security with minimal false positives

### Application Security

- **Helmet.js**: Secure HTTP headers (CSP, X-Frame-Options, X-Content-Type-Options)
- **Attack Pattern Blocking**: 60+ signatures for SQL injection, XSS, command injection, Log4Shell, XXE
- **Malicious User-Agent Blocking**: Blocks security scanners (sqlmap, nikto, burpsuite, etc.)
- **Rate Limiting**: 60 requests/minute general, 10 requests/minute for chat
- **Input Validation**: Zod (TypeScript), Pydantic (Python), express-validator
- **XSS Sanitization**: Strips HTML tags, event handlers, javascript: URIs
- **SSRF Protection**: Internal IP range blocking for coordinate validation

### Container Security (CIS Level 2)

- Non-root users in all containers
- Read-only root filesystems with tmpfs for writable paths
- Capability dropping (`cap_drop: ALL`)
- Resource limits (memory, CPU, PIDs)
- Network isolation with disabled inter-container communication

### API Security

- API keys stored as environment secrets, never exposed to clients
- Parameterized queries via ORMs prevent SQL injection
- AI chatbot restricted to Japan travel topics via system prompt

See [HARDENING.md](HARDENING.md) for detailed security documentation including CIS controls mapping and WAF configuration.

## Data Analytics

The application includes a comprehensive analytics infrastructure for business intelligence and tracking user behavior.

### Analytics Features
- **Budget Calculation Tracking**: Records all budget calculations with trip details, cities, travel style, and costs
- **Page View Tracking**: Monitors page visits with referrer and user agent data
- **User Event Tracking**: Flexible event logging with customizable categories and JSON metadata
- **Analytics Dashboard**: Aggregated metrics endpoint for business reporting

### Analytics API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/budget` | POST | Track budget calculation |
| `/api/analytics/pageview` | POST | Track page view |
| `/api/analytics/event` | POST | Track custom user event |
| `/api/analytics/dashboard?days=30` | GET | Get aggregated analytics |

### Dashboard Metrics
The dashboard endpoint returns:
- Total budget calculations, page views, and user events
- Newsletter subscriber count and chat session count
- Most popular cities and travel styles
- Average budget and traveler count
- Recent budget calculations

### Database Schema for Analytics
```sql
-- Budget calculations with full trip details
budget_calculations (id, session_id, cities[], travel_style, total_budget_sgd, ...)

-- Page view tracking
page_views (id, session_id, page_path, referrer, user_agent, created_at)

-- Flexible event tracking with JSON metadata
user_events (id, session_id, event_type, event_category, event_data, created_at)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed analytics documentation.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS with shadcn/ui components
- Recharts for budget visualization
- Wouter for routing
- TanStack Query for data fetching

### Backend (Dual Architecture)
The application supports two backend options:

#### Express.js (Default)
- Node.js with Express
- Drizzle ORM with PostgreSQL
- RESTful API design
- Runs on port 5000

#### Python/FastAPI (Optional)
- FastAPI with async support
- SQLAlchemy ORM with Alembic migrations
- Modular domain-driven design
- Runs on port 5001 (proxied through Express)

### APIs
- Exchange Rate API for live currency conversion
- OpenRouter API for AI chatbot (Claude Sonnet)
- Google Maps Embed API for activity locations
- Open-Meteo API for weather forecasts
- OpenStreetMap Overpass API for attractions data

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+ (optional, for Python backend)
- PostgreSQL database

### Environment Variables
```
DATABASE_URL=your_postgresql_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
SESSION_SECRET=your_session_secret
USE_PYTHON_BACKEND=false  # Set to true to enable Python backend
```

### Installation
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (optional)
pip install -r docker-requirements.txt

# Push database schema
npm run db:push

# Start development server (Express only)
npm run dev

# Start both servers (Express + Python)
./start-all.sh
# The start-all.sh script:
# - Starts Python backend on port 5001
# - Waits 3 seconds for Python to initialize
# - Verifies Python process is running
# - Starts Node.js frontend on port 5000
# - Cleans up Python process on exit (Ctrl+C)
```

The application will be available at `http://localhost:5000`.

## Docker Deployment

The application includes Docker configuration for containerized deployment.

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start with Docker Compose

1. **Clone the repository and create environment file:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. **Start the application (Express only):**
```bash
docker-compose up -d
```

3. **Start with Python backend enabled:**
```bash
docker-compose --profile python up -d
```

4. **View logs:**
```bash
docker-compose logs -f app
```

5. **Stop the application:**
```bash
docker-compose down
```

### Building Individual Images

```bash
# Build Node.js/Express image
docker build -t japan-travel-app .

# Build Python/FastAPI image
docker build -t japan-travel-python -f Dockerfile.python .
```

### Running Standalone Containers

```bash
# Run Node.js app (requires external PostgreSQL)
docker run -d \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e SESSION_SECRET=your_secret \
  -e OPENROUTER_API_KEY=your_key \
  -e GOOGLE_MAPS_API_KEY=your_key \
  japan-travel-app

# Run Python API (optional, requires external PostgreSQL)
docker run -d \
  -p 5001:5001 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e OPENROUTER_API_KEY=your_key \
  -e GOOGLE_MAPS_API_KEY=your_key \
  japan-travel-python
```

### Docker Configuration Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for Node.js/Express frontend and gateway |
| `Dockerfile.python` | Multi-stage build for Python FastAPI backend |
| `docker-compose.yml` | Orchestration with PostgreSQL, Express, and optional Python |
| `.dockerignore` | Excludes unnecessary files from Docker builds |
| `.env.example` | Template for environment variables |

### Environment Variables for Docker

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_USER` | Yes | PostgreSQL username (default: postgres) |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password |
| `POSTGRES_DB` | Yes | Database name (default: japan_travel) |
| `SESSION_SECRET` | Yes | Session encryption key |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI chatbot |
| `GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key |
| `USE_PYTHON_BACKEND` | No | Enable Python backend proxy (default: false) |

### Production Deployment Notes

1. **Security**: Always use strong passwords and rotate secrets regularly
2. **Persistence**: PostgreSQL data is stored in a named volume (`postgres_data`)
3. **Health Checks**: Both containers include health checks for orchestration
4. **Non-root Users**: Containers run as non-root users for security
5. **Multi-stage Builds**: Images are optimized with multi-stage builds

### CIS Docker Benchmark Level 2 Compliance

The Docker configuration is hardened according to CIS Docker Benchmark v1.7.0 Level 2 standards:

#### Container Runtime Security (Section 5)
| Control | Description | Implementation |
|---------|-------------|----------------|
| 5.3 | Restrict Linux capabilities | `cap_drop: ALL` + minimal `cap_add` only where required |
| 5.10-5.11 | Set memory and CPU limits | `mem_limit`, `cpus`, `mem_reservation` |
| 5.12 | Mount root filesystem read-only | `read_only: true` with tmpfs mounts |
| 5.14 | Restrict acquiring new privileges | `security_opt: no-new-privileges:true` |
| 5.25 | Restrict container capabilities | No unnecessary capabilities (e.g., no NET_BIND_SERVICE for high ports) |
| 5.26 | Check container health | `HEALTHCHECK` in Dockerfiles |
| 5.28 | Use PIDs cgroup limit | `ulimits.nproc: 100` |
| 5.29 | Use user-defined networks | Custom bridge network with ICC disabled |

#### Container Image Security (Section 4)
| Control | Description | Implementation |
|---------|-------------|----------------|
| 4.1 | Create non-root user | `USER nodejs` / `USER python` |
| 4.1 | Use trusted base images | Official Node.js and Python Alpine images |
| 4.3 | Exclude secrets from build | Comprehensive `.dockerignore` |
| 4.6 | Remove package manager cache | `npm cache clean`, `rm -rf /var/lib/apt/lists/*` |
| 4.7 | Use COPY over ADD | Only COPY instruction used |

#### Logging & Resource Controls (Section 2)
| Control | Description | Implementation |
|---------|-------------|----------------|
| 2.13 | Configure centralized logging | `json-file` driver with size limits |
| 2.14 | Restrict new privileges | `no-new-privileges` security option |

#### Network Isolation
- User-defined bridge network with disabled inter-container communication
- Services communicate only through explicit network links
- No privileged ports exposed (all ports > 1024 internally)

## Horizontal Scaling

The application is designed for horizontal scaling with Docker Compose or Kubernetes.

### Scaled Deployment with Docker Compose

Use `docker-compose.scaled.yml` for multi-replica deployment with nginx load balancer:

```bash
# Start with nginx, Redis, PostgreSQL, and 3 app replicas
docker-compose -f docker-compose.scaled.yml up -d

# Scale dynamically
docker-compose -f docker-compose.scaled.yml up -d --scale app=5

# Enable Python backend with scaling
docker-compose -f docker-compose.scaled.yml --profile python up -d --scale app=3 --scale python-api=2
```

### Scaling Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.scaled.yml` | Multi-replica orchestration with nginx and Redis |
| `nginx/nginx.conf` | Load balancer configuration with least-connections |
| `.env.example` | Template including Redis and scaling variables |

### Health Check Endpoints

| Endpoint | Purpose | Container Health Check |
|----------|---------|----------------------|
| `/api/health` | Full status with dependencies | Docker HEALTHCHECK |
| `/api/health/live` | Liveness probe | Kubernetes livenessProbe |
| `/api/health/ready` | Readiness probe | Kubernetes readinessProbe |

### Scaling Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection for sessions/cache | `redis://redis:6379` |
| `TRUST_PROXY` | Enable X-Forwarded headers | `true` |

### Architecture for Scaling

- **Load balancing**: nginx with least-connections and Docker DNS resolver
- **Redis infrastructure**: Redis service configured for session/cache externalization
- **Health probes**: Kubernetes-compatible liveness and readiness endpoints
- **Database pooling**: Recommend PgBouncer for high replica counts

**Note**: Infrastructure is prepared for stateless scaling. For full horizontal scaling, implement Redis-backed session storage using `connect-redis` middleware.

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed horizontal scaling documentation.

## Running Tests

### All Tests
```bash
# Run both Python and TypeScript tests
npm test
```

### Python Tests Only
```bash
PYTHONPATH=. python -m pytest python_app/tests/ -v
```

### TypeScript Tests Only
```bash
npx vitest run tests/api.test.ts
```

### Test Coverage Summary

| Module | Tests | Description |
|--------|-------|-------------|
| TypeScript Unit Tests | 77 | Schema validation, pricing data, security functions, calculator logic |
| TypeScript Integration Tests | 10 | API structure, newsletter, chat |
| TypeScript API Tests | 32 | Health endpoints, analytics, weather, attractions, chat, ETag caching |
| Python Cost Calculator | 9 | Budget calculation logic, currency conversion |
| Python Seasonality | 9 | Season detection, price multipliers, weather info |
| Python Travel Tips | 9 | Money-saving tips, city recommendations |
| Python FastAPI Endpoints | 16 | API endpoints (budget, tips, recommendations, health probes) |

**Total: 162 tests** (119 TypeScript + 43 Python)

### Security Status
- **npm vulnerabilities**: 0 (clean audit)
- **WAF security tests**: 36 scenarios, 100% pass rate
- **Express**: 4.22.1 (latest security patches)
- **Dependencies**: All up-to-date with security fixes

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and pricing data
│   │   └── pages/          # Page components
├── server/
│   ├── index.ts            # Express server entry
│   ├── routes.ts           # API routes
│   ├── security.ts         # Security middleware & validation
│   └── storage.ts          # Database operations
├── python_app/
│   ├── main.py             # FastAPI app entry point
│   ├── api/                # Route handlers
│   │   └── routes.py       # API endpoint definitions
│   ├── domain/             # Pure business logic
│   │   ├── cost_calculator.py   # Budget calculation engine
│   │   ├── seasonality.py       # Season detection and pricing
│   │   └── travel_tips.py       # Tips and recommendations
│   ├── services/           # External API integrations
│   │   ├── exchange_rate.py     # Currency conversion
│   │   ├── chat.py              # OpenRouter/Claude integration
│   │   └── google_maps.py       # Google Maps API
│   ├── db/                 # Database layer
│   │   ├── database.py          # SQLAlchemy connection
│   │   └── models.py            # ORM models
│   ├── middleware/         # Security middleware
│   │   └── security.py          # Rate limiting, validation, sanitization
│   ├── schemas/            # Pydantic validation models
│   └── tests/              # Python test suite
├── shared/
│   └── schema.ts           # Zod schemas and types
├── tests/
│   ├── api.test.ts         # Express API integration tests
│   ├── setup.ts            # Test setup configuration
│   ├── unit/               # Unit tests
│   │   ├── schema.test.ts  # Schema validation tests
│   │   ├── pricing-data.test.ts  # Pricing data tests
│   │   ├── security.test.ts      # Security function tests
│   │   └── calculator-logic.test.ts  # Calculator logic tests
│   └── integration/        # Integration tests
│       └── api.test.ts     # API structure tests
├── nginx/                  # Load balancer configuration (horizontal scaling)
│   ├── nginx.conf          # Basic nginx configuration
│   ├── nginx-waf.conf      # WAF-enabled nginx configuration
│   └── modsecurity/        # ModSecurity WAF rules
│       ├── main.conf       # ModSecurity main config
│       └── custom-rules.conf # Application-specific rules
├── docker-compose.yml      # Docker deployment
├── docker-compose.scaled.yml  # Horizontal scaling deployment
├── docker-requirements.txt # Python dependencies for Docker
├── docker.env.example      # Environment variables template
├── run_python.py           # Python FastAPI entry point (uvicorn launcher)
└── start-all.sh            # Script to run both servers (with cleanup)
```

## Key Files

- `client/src/lib/pricing-data.ts` - All travel cost data and calculations
- `client/src/pages/home.tsx` - Main calculator page
- `client/src/components/chatbot.tsx` - AI travel assistant
- `client/src/hooks/use-debounce.ts` - Debounce hook for search inputs (200ms)
- `shared/schema.ts` - Data validation schemas
- `server/routes.ts` - Express API endpoints with ETag support
- `server/static.ts` - Static asset caching configuration
- `server/security.ts` - Security middleware with 60+ attack pattern signatures, rate limiting, input validation
- `python_app/domain/cost_calculator.py` - Python budget calculation engine
- `python_app/api/routes.py` - FastAPI endpoints
- `python_app/middleware/security.py` - Python security middleware

## Architecture Notes

### Domain-Driven Design (Python Backend)
- Business logic is isolated in the `domain/` package with no framework dependencies
- External APIs are wrapped in the `services/` package
- Database access goes through the `db/` layer
- FastAPI's dependency injection provides clean dependency management

### Dual ORM Support
- **Drizzle ORM** (TypeScript): Used by Express backend
- **SQLAlchemy** (Python): Used by FastAPI backend with Alembic migrations

Both ORMs connect to the same PostgreSQL database, ensuring data consistency.

## Supported Cities

The application supports 10 major Japanese cities:
- Tokyo, Osaka, Kyoto, Hiroshima, Fukuoka
- Okinawa, Nagoya, Hokkaido, Nara, Yokohama

Each city has:
- City-specific pricing data for accommodation, food, and activities
- Curated attractions from OpenStreetMap
- Weather forecasts from Open-Meteo
- Google Maps integration for place details

## Future Improvements

The following enhancements would improve production readiness and business capabilities:

### 1. HTTPS Encryption

**Current State**: Application runs on HTTP (port 5000).

**Recommended Approach**:
- Deploy reverse proxy (nginx, Caddy, or Traefik) with SSL termination
- Use Let's Encrypt for free SSL certificates
- Update application configuration:
  - Set `TRUST_PROXY=true` environment variable
  - Enable secure session cookies (`cookie.secure = true`)
  - Update Helmet.js to enforce HTTPS redirects

**Benefits**: Encrypted data transmission, production security compliance, browser trust indicators.

### 2. Custom Domain Name

**Current State**: Accessible via IP address or localhost.

**Recommended Approach**:
- Register domain (e.g., `japanbudget.sg`, `traveljapan.sg`)
- Configure DNS A record to server IP
- Set up multi-environment subdomains (production, staging, dev)
- Update CORS whitelist in `server/security.ts` to include production domain
- Add domain to Google Maps API key restrictions

**Benefits**: Professional branding, easier sharing, required for SSL certificates.

### 3. Business User Dashboard

**Current State**: Analytics data collected via `/api/analytics/dashboard` but no admin UI.

**Recommended Features**:

| Feature | Description |
|---------|-------------|
| **Budget Trends** | Charts showing calculations over time, popular cities, average budgets by travel style |
| **User Engagement** | Page views, chat session metrics, newsletter growth, feature adoption rates |
| **Data Export** | CSV/PDF export for business intelligence and reporting |

**Implementation Approach**:
- Add admin authentication using Passport.js (already installed)
- Create protected `/admin/dashboard` route
- Reuse Recharts and shadcn/ui components for visualization
- Add export endpoints for CSV/PDF reports
- Implement role-based access control (RBAC)

**Security Requirements**:
- Authentication middleware on all admin routes
- Audit logging for admin actions
- Rate limiting on admin endpoints
- Optional: Two-factor authentication (2FA)

**Benefits**: Data-driven decisions, user behavior insights, growth monitoring, monetization opportunities.

### 4. Landing Page for Multiple Countries

**Current State**: Application is designed specifically for Singaporean travelers planning trips to Japan.

**Recommended Approach**:
- Create a landing page with country/destination selection
- Expand budget calculator architecture to support multiple destinations:
  - South Korea, Taiwan, Thailand, Vietnam, Europe, USA, etc.
  - Country-specific pricing data modules
  - Multi-currency support (SGD as base, local currency conversions)
- Implement dynamic routing: `/[country]/calculator` (e.g., `/japan/calculator`, `/korea/calculator`)
- Reuse existing components with country-specific data injection
- Country-specific features:
  - Local attraction APIs and POI data
  - Regional weather services
  - Country-specific travel tips and cultural guides
  - Transportation options (rail passes, local transit)

**Technical Architecture**:
- Create `countries/` directory with modular pricing data per destination
- Update schema to support country parameter in all API endpoints
- Extend AI chatbot to provide country-specific travel advice
- Update database schema to track country selection in analytics

**Benefits**: Market expansion, broader audience reach, reusable architecture, increased user engagement, competitive differentiation, scalable business model.

### 5. Code Review and Cleaning up AI Slop

### 6. Fixing Up Broken Features

### 7. Improve more on the UI/UX

### 8. Actual Pen-test and Verification of Security Measures 

### 9. Hardening of the Underlying System OS  

### 10. Make Use of the Analytics to Build a Recommender Engine to Enhance the Web Application (via Reverse ETL)  

### 11. Explore the use of Apache Airflow v3 for Data Engineering 

### 12. Integration of More Data Sources to the Web Application 

### 13. Explore the use of Prometheus and Grafana for Observability

### Implementation Priority Table

No.  | Improvement | Priority | Effort | Impact |
|-------------|-------------|----------|--------|--------|
| 1. | HTTPS Encryption | High | Low-Medium | Critical for production |
| 2. | Custom Domain | High | Low | Required for branding |
| 3. | Business Dashboard | Medium | Medium-High | Valuable for growth |
| 4. | Multi-Country Landing | Medium-Low | High | Long-term growth opportunity |
| 5. | Code Review and Cleaning up AI Slop | High | High | 
| 6. | Fixing Up Broken Features | High | Medium-High
| 7. | Improve more on the UI/UX | Medium | High | Need to be more intuitive for the user journey and more customers-centric to deliver value
| 8. | Actual Pen-test and Verification of Security Measures | Medium | High 
| 9. | Hardening of the Underlying System OS | Medium | Medium-High | Need to do additional functionality test for the web application after hardening the System OS
| 10. | Make Use of the Analytics to Build a Recommender Engine to Enhance the Web Application (via Reverse ETL) | Low | High | Long-term for growth
| 11. | Explore the use of Apache Airflow v3 for Data Engineering | Low | Low
| 12. | Integration of More Data Sources to the Web Application | High | Medium | Valuable for growth
| 13. | Explore the use of Prometheus and Grafana for Observability | Low | Low 

## Disclaimer
The author initially created this project for the exploration of open-source tools and to learn more about the concepts of Software Development. The author has a physics and mathematics background based on his educational training. He is not a computer scientist. But is an advocate for the [Linux Foundation (LF)](https://www.linuxfoundation.org/) and the [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/). 
