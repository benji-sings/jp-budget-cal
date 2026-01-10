import os
from typing import Optional


class GoogleMapsService:
    def __init__(self):
        self.api_key = os.environ.get("GOOGLE_MAPS_API_KEY")

    def get_api_key(self) -> Optional[str]:
        return self.api_key

    def is_configured(self) -> bool:
        return self.api_key is not None and len(self.api_key) > 0
