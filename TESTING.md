# Testing Documentation

This document provides comprehensive documentation for the testing infrastructure of the Japan Travel Budget Calculator application.

## Table of Contents

1. [Overview](#overview)
2. [Test Architecture](#test-architecture)
3. [Running Tests](#running-tests)
4. [TypeScript Tests](#typescript-tests)
   - [Unit Tests](#unit-tests)
   - [Integration Tests](#integration-tests)
   - [API Tests](#api-tests)
5. [Python Tests](#python-tests)
   - [Domain Tests](#domain-tests)
   - [API Endpoint Tests](#api-endpoint-tests)
6. [Test Coverage Summary](#test-coverage-summary)
7. [Writing New Tests](#writing-new-tests)
8. [Continuous Integration](#continuous-integration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The application uses a dual-language testing strategy:

- **TypeScript Tests**: Vitest framework for frontend utilities, API endpoints, and integration testing
- **Python Tests**: pytest framework for backend domain logic, services, and FastAPI endpoints

### Test Principles

1. **Isolation**: Each test is independent and doesn't rely on external state
2. **Determinism**: Tests produce consistent results across runs
3. **Speed**: Unit tests complete quickly; integration tests are optimized for performance
4. **Coverage**: Critical business logic has comprehensive test coverage

---

## Test Architecture

```
tests/                          # TypeScript test suite
├── api.test.ts                 # Express API integration tests
├── setup.ts                    # Test configuration and setup
├── unit/                       # Unit tests
│   ├── schema.test.ts          # Zod schema validation tests
│   ├── pricing-data.test.ts    # Pricing data and calculations
│   ├── security.test.ts        # Security function tests
│   └── calculator-logic.test.ts # Calculator business logic
└── integration/                # Integration tests
    └── api.test.ts             # API structure tests

python_app/tests/               # Python test suite
├── test_api.py                 # FastAPI endpoint tests
├── test_cost_calculator.py     # Budget calculation tests
├── test_seasonality.py         # Season detection tests
└── test_travel_tips.py         # Travel tips and recommendations
```

---

## Running Tests

### All Tests

```bash
# Run both TypeScript and Python tests
npm test
```

### TypeScript Tests Only

```bash
# Run all TypeScript tests
npx vitest run tests/

# Run specific test file
npx vitest run tests/unit/security.test.ts

# Run tests in watch mode (development)
npx vitest tests/

# Run with verbose output
npx vitest run tests/ --reporter=verbose
```

### Python Tests Only

```bash
# Run all Python tests
PYTHONPATH=. python -m pytest python_app/tests/ -v

# Run specific test file
PYTHONPATH=. python -m pytest python_app/tests/test_cost_calculator.py -v

# Run with coverage report
PYTHONPATH=. python -m pytest python_app/tests/ --cov=python_app --cov-report=html

# Run specific test class
PYTHONPATH=. python -m pytest python_app/tests/test_api.py::TestAPIEndpoints -v
```

---

## TypeScript Tests

### Unit Tests

#### Schema Validation Tests (`tests/unit/schema.test.ts`)

Tests Zod schema validation for data integrity:

| Test Group | Tests | Description |
|------------|-------|-------------|
| Budget Calculation Schema | 6 | Validates budget request/response schemas |
| Chat Message Schema | 4 | Validates chat message formats |
| Newsletter Schema | 3 | Validates email subscription data |
| Analytics Schema | 5 | Validates analytics event tracking |

**Example:**
```typescript
describe('budgetCalculationSchema', () => {
  it('validates correct budget calculation data', () => {
    const validData = {
      cities: ['Tokyo', 'Osaka'],
      travelStyle: 'midrange',
      totalBudgetSgd: 5000,
    };
    expect(() => budgetCalculationSchema.parse(validData)).not.toThrow();
  });
});
```

#### Pricing Data Tests (`tests/unit/pricing-data.test.ts`)

Tests pricing calculations and data integrity:

| Test Group | Tests | Description |
|------------|-------|-------------|
| formatCurrency | 5 | SGD and JPY formatting |
| flightPrices | 2 | Flight price data structure |
| accommodationPrices | 2 | Accommodation pricing tiers |
| jrPassPrices | 1 | JR Pass pricing options |
| airportTransferPrices | 1 | Airport transfer costs |
| foodBudgets | 2 | Food budget tiers |
| activities | 3 | Activity data structure |
| getSeason | 7 | Seasonal detection logic |
| seasonalMultipliers | 2 | Seasonal price adjustments |

**Example:**
```typescript
describe('getSeason', () => {
  it('returns cherryBlossom for late March to mid April', () => {
    expect(getSeason(new Date('2025-03-25'))).toBe('cherryBlossom');
    expect(getSeason(new Date('2025-04-10'))).toBe('cherryBlossom');
  });
});
```

#### Security Tests (`tests/unit/security.test.ts`)

Tests security validation and sanitization functions:

| Test Group | Tests | Description |
|------------|-------|-------------|
| validateSessionId | 4 | UUID and legacy session ID validation |
| sanitizeString | 8 | XSS prevention and input sanitization |
| validateCity | 3 | City name validation |
| normalizeCity | 4 | City name normalization |

**Example:**
```typescript
describe('sanitizeString', () => {
  it('removes HTML tags', () => {
    expect(sanitizeString('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('removes javascript: URIs', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
  });
});
```

#### Calculator Logic Tests (`tests/unit/calculator-logic.test.ts`)

Tests business logic for cost calculations:

| Test Group | Tests | Description |
|------------|-------|-------------|
| Connectivity Cost | 4 | WiFi, eSIM, SIM card calculations |
| Emergency Fund | 1 | Fixed emergency fund per person |
| Shopping/Misc Total | 3 | Total cost calculations |
| Transport Cost | 3 | JR Pass, IC card, airport transfers |
| Accommodation Cost | 4 | Rooms needed, average rates |

**Example:**
```typescript
describe('Shopping/Misc Total Cost Calculation', () => {
  it('calculates total cost for single traveler', () => {
    const result = calculateTotalCost(200, 1, 'esim', 7);
    expect(result).toBe(325); // (200 + 100) * 1 + 25
  });
});
```

### Integration Tests

#### API Structure Tests (`tests/integration/api.test.ts`)

Tests API endpoint structure and responses:

| Test | Description |
|------|-------------|
| Health endpoint returns correct structure | Validates `/api/health` response |
| Exchange rate endpoint returns valid data | Validates `/api/exchange-rate` |
| Weather endpoint accepts city parameter | Validates `/api/weather/:city` |
| Newsletter subscription validates email | Validates `/api/newsletter/subscribe` |
| Chat endpoint requires valid session | Validates `/api/chat` authentication |

### API Tests

#### Express API Tests (`tests/api.test.ts`)

End-to-end tests for Express server endpoints:

| Test Group | Tests | Description |
|------------|-------|-------------|
| Health Endpoints | 3 | Health, liveness, readiness probes |
| Exchange Rate | 4 | Rate fetching, ETag caching, 304 responses |
| Weather API | 5 | Weather data, ETag caching, 304 responses |
| Attractions API | 4 | OpenStreetMap attractions, ETag caching |
| Chat API | 5 | Chat history and messaging |
| Newsletter | 2 | Subscription handling |
| Analytics | 6 | Budget, pageview, event tracking |
| Place Details | 2 | Google Maps integration |
| Error Handling | 2 | Invalid requests, rate limiting |

#### ETag Caching Tests

The API tests include comprehensive coverage for HTTP caching mechanisms:

| Endpoint | Test | Description |
|----------|------|-------------|
| `/api/exchange-rate` | ETag header presence | Verifies ETag and Cache-Control headers |
| `/api/exchange-rate` | 304 Not Modified | Validates conditional GET with If-None-Match |
| `/api/weather/:city` | ETag header presence | Verifies ETag and Cache-Control headers |
| `/api/weather/:city` | 304 Not Modified | Validates conditional GET with If-None-Match |
| `/api/attractions/:city` | ETag header presence | Verifies ETag and Cache-Control headers |
| `/api/attractions/:city` | 304 Not Modified | Validates conditional GET with If-None-Match |

**Example:**
```typescript
describe('GET /api/exchange-rate', () => {
  it('should return 304 Not Modified for matching ETag', async () => {
    const firstResponse = await request(BASE_URL).get('/api/exchange-rate');
    expect(firstResponse.status).toBe(200);
    const etag = firstResponse.headers['etag'];
    
    const secondResponse = await request(BASE_URL)
      .get('/api/exchange-rate')
      .set('If-None-Match', etag);
    expect(secondResponse.status).toBe(304);
    expect(secondResponse.body).toEqual({});
  });
});
```

---

## Python Tests

### Domain Tests

#### Cost Calculator Tests (`python_app/tests/test_cost_calculator.py`)

Tests budget calculation engine:

| Test | Description |
|------|-------------|
| test_calculate_budget_moderate_tokyo | Mid-range budget for Tokyo |
| test_calculate_budget_budget_osaka | Budget travel for Osaka |
| test_calculate_budget_luxury_kyoto | Luxury travel for Kyoto |
| test_calculate_budget_without_flights | Calculation excluding flights |
| test_convert_to_jpy | Currency conversion |
| test_convert_to_jpy_zero_rate | Edge case handling |
| test_seasonal_multiplier_applied | Peak vs off-peak pricing |
| test_total_equals_sum_of_components | Total calculation accuracy |
| test_unknown_city_defaults_to_tokyo | Fallback behavior |

**Example:**
```python
def test_seasonal_multiplier_applied(self):
    breakdown_peak = self.calculator.calculate_budget(
        city="tokyo", num_days=7, num_travelers=1,
        travel_style="mid", month=4  # Cherry blossom
    )
    breakdown_off = self.calculator.calculate_budget(
        city="tokyo", num_days=7, num_travelers=1,
        travel_style="mid", month=2  # Off-peak
    )
    assert breakdown_peak.total > breakdown_off.total
```

#### Seasonality Tests (`python_app/tests/test_seasonality.py`)

Tests season detection and weather information:

| Test | Description |
|------|-------------|
| test_get_season_spring | Spring season detection |
| test_get_season_summer | Summer season detection |
| test_get_season_autumn | Autumn foliage detection |
| test_get_season_winter | Winter season detection |
| test_get_seasonal_multiplier_spring | Cherry blossom pricing |
| test_get_seasonal_multiplier_winter_low | Off-peak pricing |
| test_get_seasonal_multiplier_invalid_month | Edge case handling |
| test_get_weather_info_tokyo | Weather data for Tokyo |
| test_get_weather_info_unknown_city | Fallback weather data |

#### Travel Tips Tests (`python_app/tests/test_travel_tips.py`)

Tests recommendations and money-saving tips:

| Test | Description |
|------|-------------|
| test_get_travel_tips_default | Default travel tips |
| test_get_travel_tips_luxury | Luxury-specific tips |
| test_get_city_recommendations_tokyo | Tokyo recommendations |
| test_get_city_recommendations_kyoto | Kyoto recommendations |
| test_get_city_recommendations_osaka | Osaka recommendations |
| test_get_city_recommendations_hokkaido | Hokkaido recommendations |
| test_get_city_recommendations_unknown | Unknown city handling |
| test_money_saving_tips_structure | Tips data structure |
| test_city_recommendations_structure | Recommendations structure |

### API Endpoint Tests

#### FastAPI Tests (`python_app/tests/test_api.py`)

Tests Python backend endpoints:

| Test | Description |
|------|-------------|
| test_health_check | `/api/health` status |
| test_health_liveness_probe | `/api/health/live` probe |
| test_health_readiness_probe | `/api/health/ready` probe |
| test_get_exchange_rate | Exchange rate endpoint |
| test_get_tips | Travel tips endpoint |
| test_get_tips_with_style | Style-specific tips |
| test_get_recommendations_tokyo | Tokyo recommendations |
| test_get_recommendations_kyoto | Kyoto recommendations |
| test_get_recommendations_osaka | Osaka recommendations |
| test_get_recommendations_invalid_city | Invalid city handling |
| test_calculate_budget | Budget calculation |
| test_calculate_budget_budget_style | Budget travel style |
| test_calculate_budget_luxury_style | Luxury travel style |
| test_calculate_budget_invalid_city | Invalid city handling |
| test_calculate_budget_missing_fields | Validation errors |
| test_newsletter_subscribe | Newsletter subscription |

---

## Test Coverage Summary

| Category | Test File | Tests | Description |
|----------|-----------|-------|-------------|
| **TypeScript Unit** | schema.test.ts | 18 | Schema validation |
| **TypeScript Unit** | pricing-data.test.ts | 25 | Pricing calculations |
| **TypeScript Unit** | security.test.ts | 19 | Security functions |
| **TypeScript Unit** | calculator-logic.test.ts | 15 | Calculator logic |
| **TypeScript Integration** | integration/api.test.ts | 10 | API structure |
| **TypeScript API** | api.test.ts | 32 | Express endpoints + ETag caching |
| **Python Domain** | test_cost_calculator.py | 9 | Budget calculations |
| **Python Domain** | test_seasonality.py | 9 | Season detection |
| **Python Domain** | test_travel_tips.py | 9 | Travel tips |
| **Python API** | test_api.py | 16 | FastAPI endpoints |

**Total: 162 tests** (119 TypeScript + 43 Python)

### Security Status (January 2026)

- **npm vulnerabilities**: 0 (clean audit after security updates)
- **WAF security tests**: 36 scenarios, 100% pass rate
- **Removed**: @vercel/node package (had 4 vulnerable dependencies)
- **Updated**: Express 4.22.1, body-parser 1.20.4, qs 6.14.1

### Recent Test Additions (January 2026)

- **Security Tests**: Enhanced WAF simulation from 27 to 36 scenarios
  - SQL injection: 6 tests (UNION SELECT, OR 1=1, DROP TABLE, comment obfuscated, sleep attack, benchmark)
  - XSS: 5 tests (script tag, event handler, javascript URI, iframe, SVG onload)
  - Command injection: 7 tests (semicolon, pipe, backticks, rm -rf, curl, subshell, shell path)
  - Malicious user-agent blocking: 2 tests (sqlmap, nikto)
- **ETag Caching Tests**: 6 new tests for HTTP conditional caching
  - Exchange rate endpoint: ETag header and 304 response validation
  - Weather API: ETag header and 304 response validation
  - Attractions API: ETag header and 304 response validation

---

## Writing New Tests

### TypeScript Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });

  it('handles edge cases', () => {
    expect(() => functionUnderTest(null)).toThrow();
  });
});
```

### Python Test Template

```python
import pytest
from python_app.domain.module import ClassName

class TestClassName:
    def setup_method(self):
        """Setup before each test"""
        self.instance = ClassName()

    def test_specific_behavior(self):
        """Test specific functionality"""
        # Arrange
        input_data = "test"
        
        # Act
        result = self.instance.method(input_data)
        
        # Assert
        assert result == "expected"

    def test_edge_case(self):
        """Test edge case handling"""
        with pytest.raises(ValueError):
            self.instance.method(None)
```

### Best Practices

1. **Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Follow the AAA pattern for test structure
3. **Independence**: Each test should be independent and not rely on other tests
4. **Edge Cases**: Test boundary conditions and error handling
5. **Mocking**: Use mocks for external dependencies (APIs, databases)

---

## Continuous Integration

Tests are automatically run on:

- Pull request creation
- Push to main branch
- Manual workflow dispatch

### CI Configuration

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          npm install
          pip install -r requirements.txt
          
      - name: Run TypeScript tests
        run: npx vitest run tests/
        
      - name: Run Python tests
        run: PYTHONPATH=. python -m pytest python_app/tests/ -v
```

---

## Troubleshooting

### Common Issues

#### TypeScript Tests

**Issue**: Module not found errors
```bash
# Solution: Ensure dependencies are installed
npm install
```

**Issue**: Tests timeout
```bash
# Solution: Increase timeout in vitest config
npx vitest run tests/ --testTimeout=30000
```

#### Python Tests

**Issue**: Import errors
```bash
# Solution: Set PYTHONPATH
PYTHONPATH=. python -m pytest python_app/tests/ -v
```

**Issue**: Database connection errors
```bash
# Solution: Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://..."
```

### Debug Mode

```bash
# TypeScript: Run single test with debug output
npx vitest run tests/unit/security.test.ts --reporter=verbose

# Python: Run with print output
PYTHONPATH=. python -m pytest python_app/tests/test_api.py -v -s
```

### Test Isolation

If tests are affecting each other:

```bash
# Run tests in random order to detect dependencies
npx vitest run tests/ --shuffle

# Python
PYTHONPATH=. python -m pytest python_app/tests/ -v --randomly-seed=random
```

---

## Running Both Servers for Testing

Use `start-all.sh` to run both servers before integration testing:

```bash
# Start both Python and Node.js servers
./start-all.sh

# In a separate terminal, run tests
npx vitest run tests/
```

The script handles:
- Starting Python backend on port 5001
- Waiting for Python to initialize (3 seconds)
- Verifying Python process is running
- Starting Node.js frontend on port 5000
- Cleaning up Python process on exit (Ctrl+C)

## References

- [Vitest Documentation](https://vitest.dev/)
- [pytest Documentation](https://docs.pytest.org/)
- [Testing Best Practices](https://martinfowler.com/articles/practical-test-pyramid.html)
