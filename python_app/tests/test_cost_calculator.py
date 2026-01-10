import pytest
from python_app.domain.cost_calculator import CostCalculator, CostBreakdown

class TestCostCalculator:
    def setup_method(self):
        self.exchange_rate = 0.0082
        self.calculator = CostCalculator(self.exchange_rate)

    def test_calculate_budget_moderate_tokyo(self):
        breakdown = self.calculator.calculate_budget(
            city="tokyo",
            num_days=7,
            num_travelers=2,
            travel_style="mid",
            month=4
        )
        
        assert isinstance(breakdown, CostBreakdown)
        assert breakdown.flights > 0
        assert breakdown.accommodation > 0
        assert breakdown.food > 0
        assert breakdown.transport > 0
        assert breakdown.activities > 0
        assert breakdown.shopping > 0
        assert breakdown.total > 0
        assert breakdown.daily_average > 0

    def test_calculate_budget_budget_osaka(self):
        breakdown = self.calculator.calculate_budget(
            city="osaka",
            num_days=5,
            num_travelers=1,
            travel_style="budget",
            month=1
        )
        
        assert isinstance(breakdown, CostBreakdown)
        assert breakdown.total > 0

    def test_calculate_budget_luxury_kyoto(self):
        breakdown = self.calculator.calculate_budget(
            city="kyoto",
            num_days=10,
            num_travelers=2,
            travel_style="luxury",
            month=11
        )
        
        assert isinstance(breakdown, CostBreakdown)
        assert breakdown.total > 0

    def test_calculate_budget_without_flights(self):
        breakdown = self.calculator.calculate_budget(
            city="tokyo",
            num_days=7,
            num_travelers=1,
            travel_style="mid",
            month=4,
            include_flights=False
        )
        
        assert breakdown.flights == 0
        assert breakdown.total > 0

    def test_convert_to_jpy(self):
        sgd_amount = 100
        jpy = self.calculator.convert_to_jpy(sgd_amount)
        expected = round(sgd_amount * (1 / self.exchange_rate), 0)
        assert jpy == expected

    def test_convert_to_jpy_zero_rate(self):
        calculator = CostCalculator(0)
        jpy = calculator.convert_to_jpy(100)
        assert jpy == 0.0

    def test_seasonal_multiplier_applied(self):
        breakdown_peak = self.calculator.calculate_budget(
            city="tokyo",
            num_days=7,
            num_travelers=1,
            travel_style="mid",
            month=4
        )
        
        breakdown_off = self.calculator.calculate_budget(
            city="tokyo",
            num_days=7,
            num_travelers=1,
            travel_style="mid",
            month=2
        )
        
        assert breakdown_peak.total > breakdown_off.total

    def test_total_equals_sum_of_components(self):
        breakdown = self.calculator.calculate_budget(
            city="tokyo",
            num_days=7,
            num_travelers=1,
            travel_style="mid",
            month=6
        )
        
        expected_total = round(
            breakdown.flights + 
            breakdown.accommodation + 
            breakdown.food + 
            breakdown.transport + 
            breakdown.activities + 
            breakdown.shopping, 2
        )
        assert breakdown.total == expected_total

    def test_unknown_city_defaults_to_tokyo(self):
        breakdown = self.calculator.calculate_budget(
            city="unknown_city",
            num_days=3,
            num_travelers=1,
            travel_style="mid",
            month=5
        )
        
        assert breakdown.total > 0
