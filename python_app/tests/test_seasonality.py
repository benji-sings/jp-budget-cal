import pytest
from python_app.domain.seasonality import (
    get_season,
    get_seasonal_multiplier,
    get_weather_info
)

class TestSeasonality:
    def test_get_season_spring(self):
        season, label = get_season(4)
        assert season == "spring"
        assert "Cherry" in label or "Golden" in label or "Season" in label

    def test_get_season_summer(self):
        season, label = get_season(7)
        assert season == "summer"

    def test_get_season_autumn(self):
        season, label = get_season(10)
        assert season == "autumn"

    def test_get_season_winter(self):
        season, label = get_season(1)
        assert season == "winter"

    def test_get_seasonal_multiplier_spring(self):
        multiplier = get_seasonal_multiplier(4)
        assert multiplier > 1.0

    def test_get_seasonal_multiplier_winter_low(self):
        multiplier = get_seasonal_multiplier(2)
        assert multiplier < 1.0

    def test_get_seasonal_multiplier_invalid_month(self):
        multiplier = get_seasonal_multiplier(0)
        assert isinstance(multiplier, float)
        
        multiplier = get_seasonal_multiplier(13)
        assert isinstance(multiplier, float)

    def test_get_weather_info_tokyo(self):
        info = get_weather_info("tokyo", 4)
        assert isinstance(info, dict)
        assert "temp_low" in info
        assert "temp_high" in info
        assert "rainfall" in info
        assert "description" in info

    def test_get_weather_info_unknown_city(self):
        info = get_weather_info("unknown_city", 6)
        assert isinstance(info, dict)
        assert "temp_low" in info
