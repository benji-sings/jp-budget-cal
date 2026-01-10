import pytest
from python_app.domain.travel_tips import (
    get_travel_tips,
    get_city_recommendations,
    MONEY_SAVING_TIPS,
    CITY_RECOMMENDATIONS
)

class TestTravelTips:
    def test_get_travel_tips_default(self):
        tips = get_travel_tips()
        assert isinstance(tips, list)
        assert len(tips) > 0
        assert all(isinstance(tip, dict) for tip in tips)
        assert all("category" in tip for tip in tips)
        assert all("title" in tip for tip in tips)
        assert all("description" in tip for tip in tips)

    def test_get_travel_tips_luxury(self):
        tips = get_travel_tips("luxury")
        assert isinstance(tips, list)
        assert len(tips) > 0
        for tip in tips:
            assert tip["category"] in ["Transport", "Shopping"]

    def test_get_city_recommendations_tokyo(self):
        recs = get_city_recommendations("tokyo")
        assert isinstance(recs, dict)
        assert "must_see" in recs
        assert "hidden_gems" in recs
        assert "food_spots" in recs
        assert isinstance(recs["must_see"], list)
        assert len(recs["must_see"]) > 0

    def test_get_city_recommendations_kyoto(self):
        recs = get_city_recommendations("kyoto")
        assert isinstance(recs, dict)
        assert "must_see" in recs

    def test_get_city_recommendations_osaka(self):
        recs = get_city_recommendations("osaka")
        assert isinstance(recs, dict)
        assert "must_see" in recs

    def test_get_city_recommendations_hokkaido(self):
        recs = get_city_recommendations("hokkaido")
        assert isinstance(recs, dict)
        assert "must_see" in recs

    def test_get_city_recommendations_unknown(self):
        recs = get_city_recommendations("unknown_city")
        assert isinstance(recs, dict)
        assert "must_see" in recs

    def test_money_saving_tips_structure(self):
        assert len(MONEY_SAVING_TIPS) > 0
        for tip in MONEY_SAVING_TIPS:
            assert "category" in tip
            assert "title" in tip
            assert "description" in tip
            assert "savings" in tip

    def test_city_recommendations_structure(self):
        assert "tokyo" in CITY_RECOMMENDATIONS
        assert "osaka" in CITY_RECOMMENDATIONS
        assert "kyoto" in CITY_RECOMMENDATIONS
        assert "hokkaido" in CITY_RECOMMENDATIONS
        assert "okinawa" in CITY_RECOMMENDATIONS
