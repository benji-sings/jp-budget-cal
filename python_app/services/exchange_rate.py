import httpx
from datetime import datetime, timedelta
from typing import Optional
import os


class ExchangeRateService:
    EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/SGD"
    CACHE_DURATION = timedelta(hours=1)
    DEFAULT_RATE = 0.0089

    def __init__(self):
        self._cached_rate: Optional[float] = None
        self._cached_time: Optional[datetime] = None
        self._last_updated: Optional[str] = None

    async def get_exchange_rate(self) -> dict:
        now = datetime.utcnow()
        
        if (
            self._cached_rate is not None
            and self._cached_time is not None
            and now - self._cached_time < self.CACHE_DURATION
        ):
            return {
                "rate": self._cached_rate,
                "lastUpdated": self._last_updated
            }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.EXCHANGE_RATE_API)
                response.raise_for_status()
                data = response.json()
                
                jpy_rate = data.get("rates", {}).get("JPY")
                if jpy_rate:
                    self._cached_rate = 1 / jpy_rate
                    self._cached_time = now
                    self._last_updated = now.isoformat()
                    
                    return {
                        "rate": self._cached_rate,
                        "lastUpdated": self._last_updated
                    }
        except Exception as e:
            print(f"Exchange rate fetch error: {e}")
        
        return {
            "rate": self.DEFAULT_RATE,
            "lastUpdated": None
        }

    def get_cached_rate(self) -> float:
        return self._cached_rate if self._cached_rate else self.DEFAULT_RATE
