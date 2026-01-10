from dataclasses import dataclass
from typing import List, Optional
from .seasonality import get_seasonal_multiplier


@dataclass
class CityPricing:
    accommodation_budget: float
    accommodation_mid: float
    accommodation_luxury: float
    food_budget: float
    food_mid: float
    food_luxury: float
    transport_daily: float
    activities_daily: float


CITY_PRICING = {
    "tokyo": CityPricing(
        accommodation_budget=80, accommodation_mid=180, accommodation_luxury=400,
        food_budget=30, food_mid=60, food_luxury=150,
        transport_daily=15, activities_daily=30
    ),
    "osaka": CityPricing(
        accommodation_budget=70, accommodation_mid=150, accommodation_luxury=350,
        food_budget=25, food_mid=50, food_luxury=120,
        transport_daily=12, activities_daily=25
    ),
    "kyoto": CityPricing(
        accommodation_budget=75, accommodation_mid=160, accommodation_luxury=380,
        food_budget=28, food_mid=55, food_luxury=130,
        transport_daily=10, activities_daily=35
    ),
    "hokkaido": CityPricing(
        accommodation_budget=65, accommodation_mid=140, accommodation_luxury=320,
        food_budget=25, food_mid=50, food_luxury=110,
        transport_daily=18, activities_daily=40
    ),
    "okinawa": CityPricing(
        accommodation_budget=60, accommodation_mid=130, accommodation_luxury=300,
        food_budget=22, food_mid=45, food_luxury=100,
        transport_daily=20, activities_daily=35
    ),
}

FLIGHT_PRICES = {
    "tokyo": {"budget": 350, "mid": 550, "luxury": 1200},
    "osaka": {"budget": 320, "mid": 500, "luxury": 1100},
    "kyoto": {"budget": 320, "mid": 500, "luxury": 1100},
    "hokkaido": {"budget": 400, "mid": 650, "luxury": 1400},
    "okinawa": {"budget": 380, "mid": 600, "luxury": 1300},
}


@dataclass
class CostBreakdown:
    flights: float
    accommodation: float
    food: float
    transport: float
    activities: float
    shopping: float
    total: float
    daily_average: float


class CostCalculator:
    def __init__(self, exchange_rate: float = 0.0089):
        self.exchange_rate = exchange_rate

    def calculate_budget(
        self,
        city: str,
        num_days: int,
        num_travelers: int,
        travel_style: str,
        month: int,
        include_flights: bool = True,
        shopping_budget: float = 200.0
    ) -> CostBreakdown:
        city_lower = city.lower()
        pricing = CITY_PRICING.get(city_lower, CITY_PRICING["tokyo"])
        
        style_map = {"budget": 0, "mid": 1, "luxury": 2}
        style_idx = style_map.get(travel_style.lower(), 1)
        
        seasonal_mult = get_seasonal_multiplier(month)
        
        acc_rates = [pricing.accommodation_budget, pricing.accommodation_mid, pricing.accommodation_luxury]
        food_rates = [pricing.food_budget, pricing.food_mid, pricing.food_luxury]
        
        daily_accommodation = acc_rates[style_idx] * seasonal_mult
        daily_food = food_rates[style_idx]
        daily_transport = pricing.transport_daily
        daily_activities = pricing.activities_daily
        
        accommodation_total = daily_accommodation * num_days
        food_total = daily_food * num_days * num_travelers
        transport_total = daily_transport * num_days * num_travelers
        activities_total = daily_activities * num_days * num_travelers
        shopping_total = shopping_budget * num_travelers
        
        flights_total = 0.0
        if include_flights:
            flight_prices = FLIGHT_PRICES.get(city_lower, FLIGHT_PRICES["tokyo"])
            flight_styles = ["budget", "mid", "luxury"]
            base_flight = flight_prices[flight_styles[style_idx]]
            flights_total = base_flight * num_travelers * seasonal_mult
        
        total = (
            flights_total + accommodation_total + food_total +
            transport_total + activities_total + shopping_total
        )
        
        daily_average = (total - flights_total) / num_days if num_days > 0 else 0
        
        return CostBreakdown(
            flights=round(flights_total, 2),
            accommodation=round(accommodation_total, 2),
            food=round(food_total, 2),
            transport=round(transport_total, 2),
            activities=round(activities_total, 2),
            shopping=round(shopping_total, 2),
            total=round(total, 2),
            daily_average=round(daily_average, 2)
        )

    def convert_to_jpy(self, sgd_amount: float) -> float:
        if self.exchange_rate > 0:
            jpy_per_sgd = 1 / self.exchange_rate
            return round(sgd_amount * jpy_per_sgd, 0)
        return 0.0
