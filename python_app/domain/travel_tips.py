from typing import List, Dict


MONEY_SAVING_TIPS = [
    {
        "category": "Transport",
        "title": "Get a JR Pass",
        "description": "Save up to 50% on shinkansen and JR trains with a 7, 14, or 21-day pass",
        "savings": "Up to S$300+ for a week of travel"
    },
    {
        "category": "Transport",
        "title": "Use IC Cards",
        "description": "Get a Suica or Pasmo card for convenient tap-and-go on all trains and buses",
        "savings": "Saves time and small change"
    },
    {
        "category": "Food",
        "title": "Eat at Convenience Stores",
        "description": "7-Eleven, Lawson, and FamilyMart offer quality onigiri, bento, and snacks",
        "savings": "S$5-10 per meal vs restaurants"
    },
    {
        "category": "Food",
        "title": "Try Department Store Basement Food Halls",
        "description": "Depachika offers discounted bento and food near closing time",
        "savings": "30-50% off quality food after 7pm"
    },
    {
        "category": "Accommodation",
        "title": "Stay in Business Hotels",
        "description": "Chains like Toyoko Inn, APA, and Dormy Inn offer clean rooms at good prices",
        "savings": "S$50-80 per night vs mid-range hotels"
    },
    {
        "category": "Accommodation",
        "title": "Consider Capsule Hotels",
        "description": "A unique Japanese experience that's budget-friendly",
        "savings": "S$30-50 per night"
    },
    {
        "category": "Shopping",
        "title": "Tax-Free Shopping",
        "description": "Spend over ¥5,000 at participating stores to get 10% consumption tax refunded",
        "savings": "10% off major purchases"
    },
    {
        "category": "Activities",
        "title": "Free Shrines and Temples",
        "description": "Many famous shrines and temple grounds are free to enter",
        "savings": "S$5-15 per attraction"
    },
]

CITY_RECOMMENDATIONS = {
    "tokyo": {
        "must_see": [
            "Senso-ji Temple in Asakusa",
            "Shibuya Crossing",
            "Meiji Shrine",
            "Tokyo Skytree",
            "Tsukiji Outer Market"
        ],
        "hidden_gems": [
            "Yanaka neighborhood for old Tokyo charm",
            "Shimokitazawa for vintage shopping",
            "Koenji for live music and izakayas"
        ],
        "food_spots": [
            "Ramen at Ichiran or Fuunji",
            "Sushi at Tsukiji Outer Market",
            "Yakitori at Yurakucho under the tracks"
        ]
    },
    "osaka": {
        "must_see": [
            "Osaka Castle",
            "Dotonbori",
            "Shinsekai",
            "Kuromon Market",
            "Universal Studios Japan"
        ],
        "hidden_gems": [
            "Nakazakicho for retro cafes",
            "Shinsekai for classic atmosphere",
            "Hozenji Yokocho for traditional vibes"
        ],
        "food_spots": [
            "Takoyaki at Dotonbori",
            "Okonomiyaki at Mizuno",
            "Kushikatsu at Daruma"
        ]
    },
    "kyoto": {
        "must_see": [
            "Fushimi Inari Shrine",
            "Kinkaku-ji (Golden Pavilion)",
            "Arashiyama Bamboo Grove",
            "Gion District",
            "Nijo Castle"
        ],
        "hidden_gems": [
            "Philosopher's Path at dawn",
            "Nishiki Market backstreets",
            "Kurama-dera mountain temple"
        ],
        "food_spots": [
            "Kaiseki at traditional ryokan",
            "Matcha everything in Uji",
            "Yudofu (tofu hot pot) near temples"
        ]
    },
    "hokkaido": {
        "must_see": [
            "Sapporo Beer Museum",
            "Otaru Canal",
            "Blue Pond in Biei",
            "Niseko Ski Resort (winter)",
            "Lavender fields in Furano (summer)"
        ],
        "hidden_gems": [
            "Noboribetsu Onsen",
            "Shakotan Peninsula",
            "Asahikawa Zoo"
        ],
        "food_spots": [
            "Miso ramen in Sapporo",
            "Fresh seafood at Nijo Market",
            "Genghis Khan BBQ (lamb)"
        ]
    },
    "okinawa": {
        "must_see": [
            "Shuri Castle",
            "Churaumi Aquarium",
            "Kerama Islands",
            "Kokusai Street",
            "American Village"
        ],
        "hidden_gems": [
            "Naminoue Shrine beach",
            "Zakimi Castle ruins",
            "Yanbaru National Park"
        ],
        "food_spots": [
            "Okinawa soba",
            "Taco rice (local fusion)",
            "Umi-budo (sea grapes)"
        ]
    }
}


def get_travel_tips(travel_style: str = "mid") -> List[Dict]:
    if travel_style == "luxury":
        return [tip for tip in MONEY_SAVING_TIPS if tip["category"] in ["Transport", "Shopping"]]
    return MONEY_SAVING_TIPS


def get_city_recommendations(city: str) -> Dict:
    city_lower = city.lower()
    return CITY_RECOMMENDATIONS.get(city_lower, CITY_RECOMMENDATIONS["tokyo"])
