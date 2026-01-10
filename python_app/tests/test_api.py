import pytest
from fastapi.testclient import TestClient
from python_app.main import app

client = TestClient(app)

class TestAPIEndpoints:
    def test_health_check(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["healthy", "ok"]
        assert "service" in data or "checks" in data

    def test_health_liveness_probe(self):
        response = client.get("/api/health/live")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"
        assert "timestamp" in data

    def test_health_readiness_probe(self):
        response = client.get("/api/health/ready")
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
        assert data["status"] in ["ready", "not_ready"]

    def test_get_exchange_rate(self):
        response = client.get("/api/exchange-rate")
        assert response.status_code == 200
        data = response.json()
        assert "rate" in data
        assert "lastUpdated" in data
        assert isinstance(data["rate"], (int, float))
        assert data["rate"] > 0

    def test_get_tips(self):
        response = client.get("/api/tips")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "tips" in data
        assert isinstance(data["tips"], list)
        assert len(data["tips"]) > 0

    def test_get_tips_with_style(self):
        response = client.get("/api/tips?travel_style=luxury")
        assert response.status_code == 200
        data = response.json()
        assert "tips" in data

    def test_get_recommendations_tokyo(self):
        response = client.get("/api/recommendations/Tokyo")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "must_see" in data
        assert "hidden_gems" in data
        assert "food_spots" in data

    def test_get_recommendations_kyoto(self):
        response = client.get("/api/recommendations/Kyoto")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "must_see" in data

    def test_get_recommendations_osaka(self):
        response = client.get("/api/recommendations/Osaka")
        assert response.status_code == 200
        data = response.json()
        assert "must_see" in data

    def test_get_recommendations_invalid_city(self):
        response = client.get("/api/recommendations/InvalidCity")
        assert response.status_code == 400

    def test_calculate_budget(self):
        response = client.post("/api/budget", json={
            "city": "Tokyo",
            "num_days": 7,
            "num_travelers": 2,
            "travel_style": "mid",
            "month": 4,
            "include_flights": True,
            "shopping_budget": 200
        })
        assert response.status_code == 200
        data = response.json()
        assert "breakdown" in data
        breakdown = data["breakdown"]
        assert "flights" in breakdown
        assert "accommodation" in breakdown
        assert "food" in breakdown
        assert "transport" in breakdown
        assert "activities" in breakdown
        assert "shopping" in breakdown
        assert "total" in breakdown
        assert "daily_average" in breakdown
        assert breakdown["total"] > 0
        assert "exchange_rate" in data
        assert "total_jpy" in data
        assert "season" in data

    def test_calculate_budget_budget_style(self):
        response = client.post("/api/budget", json={
            "city": "Osaka",
            "num_days": 5,
            "num_travelers": 1,
            "travel_style": "budget",
            "month": 1,
            "include_flights": True,
            "shopping_budget": 100
        })
        assert response.status_code == 200
        data = response.json()
        assert data["breakdown"]["total"] > 0

    def test_calculate_budget_luxury_style(self):
        response = client.post("/api/budget", json={
            "city": "Kyoto",
            "num_days": 10,
            "num_travelers": 2,
            "travel_style": "luxury",
            "month": 11,
            "include_flights": True,
            "shopping_budget": 500
        })
        assert response.status_code == 200
        data = response.json()
        assert data["breakdown"]["total"] > 0

    def test_calculate_budget_invalid_city(self):
        response = client.post("/api/budget", json={
            "city": "InvalidCity",
            "num_days": 5,
            "num_travelers": 1,
            "travel_style": "mid",
            "month": 4,
            "include_flights": True,
            "shopping_budget": 100
        })
        assert response.status_code == 400

    def test_calculate_budget_missing_fields(self):
        response = client.post("/api/budget", json={
            "city": "Tokyo"
        })
        assert response.status_code == 422

    def test_newsletter_subscribe(self):
        response = client.post("/api/newsletter", json={
            "email": "test@example.com"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "message" in data
