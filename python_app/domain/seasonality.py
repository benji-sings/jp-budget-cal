from typing import Tuple


SEASONS = {
    1: ("winter", "Low Season"),
    2: ("winter", "Low Season"),
    3: ("spring", "Cherry Blossom Season"),
    4: ("spring", "Cherry Blossom Season"),
    5: ("spring", "Golden Week"),
    6: ("summer", "Rainy Season"),
    7: ("summer", "Summer Holidays"),
    8: ("summer", "Obon Festival"),
    9: ("autumn", "Shoulder Season"),
    10: ("autumn", "Autumn Leaves"),
    11: ("autumn", "Autumn Leaves"),
    12: ("winter", "Year-End Holidays"),
}

SEASONAL_MULTIPLIERS = {
    "winter": 1.0,
    "spring": 1.3,
    "summer": 1.15,
    "autumn": 1.2,
}

MONTH_MULTIPLIERS = {
    1: 0.9,
    2: 0.85,
    3: 1.2,
    4: 1.4,
    5: 1.3,
    6: 0.95,
    7: 1.1,
    8: 1.15,
    9: 1.0,
    10: 1.25,
    11: 1.3,
    12: 1.2,
}


def get_season(month: int) -> Tuple[str, str]:
    if month < 1 or month > 12:
        month = max(1, min(12, month))
    return SEASONS.get(month, ("spring", "Shoulder Season"))


def get_seasonal_multiplier(month: int) -> float:
    if month < 1 or month > 12:
        month = max(1, min(12, month))
    return MONTH_MULTIPLIERS.get(month, 1.0)


def get_weather_info(city: str, month: int) -> dict:
    weather_data = {
        "tokyo": {
            1: {"temp_low": 2, "temp_high": 10, "rainfall": 50, "description": "Cold and dry"},
            2: {"temp_low": 3, "temp_high": 11, "rainfall": 55, "description": "Cold with occasional snow"},
            3: {"temp_low": 6, "temp_high": 14, "rainfall": 115, "description": "Warming up, cherry blossoms begin"},
            4: {"temp_low": 11, "temp_high": 19, "rainfall": 130, "description": "Mild, peak cherry blossom season"},
            5: {"temp_low": 15, "temp_high": 24, "rainfall": 140, "description": "Pleasant warm weather"},
            6: {"temp_low": 19, "temp_high": 26, "rainfall": 165, "description": "Rainy season begins"},
            7: {"temp_low": 23, "temp_high": 30, "rainfall": 155, "description": "Hot and humid"},
            8: {"temp_low": 24, "temp_high": 31, "rainfall": 150, "description": "Hottest month"},
            9: {"temp_low": 21, "temp_high": 27, "rainfall": 210, "description": "Typhoon season"},
            10: {"temp_low": 15, "temp_high": 22, "rainfall": 195, "description": "Cooling down, autumn colors"},
            11: {"temp_low": 10, "temp_high": 17, "rainfall": 95, "description": "Autumn foliage peak"},
            12: {"temp_low": 5, "temp_high": 12, "rainfall": 50, "description": "Cold and dry"},
        }
    }
    city_lower = city.lower()
    city_data = weather_data.get(city_lower, weather_data["tokyo"])
    return city_data.get(month, city_data[1])
