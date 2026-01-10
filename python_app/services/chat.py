import httpx
import os
from typing import List, Dict, Optional


JAPAN_TRAVEL_SYSTEM_PROMPT = """You are a friendly and knowledgeable Japan travel assistant specifically designed to help Singaporean travelers plan their trips to Japan. 

Your expertise includes:
- Best times to visit Japan (cherry blossom season, autumn leaves, ski season, festivals)
- Transportation in Japan (JR Pass, IC cards like Suica/Pasmo, Shinkansen, local trains, buses)
- Accommodation options (hotels, ryokans, hostels, Airbnb)
- Popular destinations (Tokyo, Osaka, Kyoto, Hokkaido, Okinawa, etc.)
- Japanese cuisine and restaurant etiquette
- Shopping tips (tax-free shopping, popular items, where to shop)
- Cultural etiquette and customs
- Budget planning and money-saving tips
- Visa requirements for Singaporeans
- Weather and what to pack
- Safety tips and emergency information

IMPORTANT RULES:
1. ONLY answer questions related to Japan travel, tourism, culture, food, or trip planning.
2. If a user asks about anything unrelated to Japan travel, politely redirect them.
3. Keep responses concise but helpful.
4. Use SGD when mentioning prices where relevant.
5. Be warm and encouraging to first-time travelers."""


class ChatService:
    OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

    def __init__(self):
        self.api_key = os.environ.get("OPENROUTER_API_KEY")

    async def send_message(
        self,
        message: str,
        history: Optional[List[Dict]] = None,
        referer: str = "https://japan-travel-budget.replit.app"
    ) -> str:
        if not self.api_key:
            raise ValueError("Chat service not configured - missing API key")

        messages = [
            {"role": "system", "content": JAPAN_TRAVEL_SYSTEM_PROMPT}
        ]
        
        if history:
            for msg in history:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
        
        messages.append({"role": "user", "content": message})

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.OPENROUTER_API_URL,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": referer,
                        "X-Title": "Japan Travel Budget Calculator"
                    },
                    json={
                        "model": "anthropic/claude-sonnet-4",
                        "messages": messages,
                        "max_tokens": 1024
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                return data.get("choices", [{}])[0].get("message", {}).get(
                    "content", "Sorry, I couldn't process your request."
                )
        except httpx.TimeoutException:
            raise ValueError("Chat request timed out")
        except httpx.HTTPStatusError as e:
            raise ValueError(f"Chat service error: {e.response.status_code}")
        except Exception as e:
            raise ValueError(f"Chat error: {str(e)}")
