import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  chatRateLimiter,
  chatValidation,
  cityParamValidation,
  placeDetailsValidation,
  mapsEmbedValidation,
  handleValidationErrors,
  validateSessionId,
  sanitizeString,
  validateCity,
  normalizeCity,
  maliciousUserAgentBlocker,
  attackPatternBlocker,
} from "./security";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const JAPAN_TRAVEL_SYSTEM_PROMPT = `You are a friendly and knowledgeable Japan travel assistant specifically designed to help Singaporean travelers plan their trips to Japan. 

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
2. If a user asks about anything unrelated to Japan travel (like coding, politics, other countries, personal advice, etc.), politely redirect them by saying: "I'm your Japan travel assistant and can only help with Japan travel-related questions. Is there anything about your Japan trip I can help you with?"
3. Keep responses concise but helpful.
4. Use SGD when mentioning prices where relevant.
5. Be warm and encouraging to first-time travelers.`;

const DEFAULT_EXCHANGE_RATE = 0.0089;
const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/SGD";

const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  Tokyo: { lat: 35.6762, lon: 139.6503 },
  Osaka: { lat: 34.6937, lon: 135.5023 },
  Kyoto: { lat: 35.0116, lon: 135.7681 },
  Hokkaido: { lat: 43.0618, lon: 141.3545 },
  Fukuoka: { lat: 33.5904, lon: 130.4017 },
  Okinawa: { lat: 26.2124, lon: 127.6809 },
  Nagoya: { lat: 35.1815, lon: 136.9066 },
  Hiroshima: { lat: 34.3853, lon: 132.4553 },
  Nara: { lat: 34.6851, lon: 135.8048 },
  Yokohama: { lat: 35.4437, lon: 139.6380 },
};

let cachedExchangeRate: { rate: number; lastUpdated: string } | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000;

interface OSMAttraction {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  category: string;
}

const attractionsCache: Record<string, { data: OSMAttraction[]; timestamp: number }> = {};
const ATTRACTIONS_CACHE_DURATION = 24 * 60 * 60 * 1000;

interface PlaceDetailsCache {
  placeId?: string;
  name?: string;
  rating: number | null;
  userRatingsTotal: number;
  lat?: number;
  lng?: number;
  vicinity?: string;
  timestamp: number;
}
const placeDetailsCache: Record<string, PlaceDetailsCache> = {};
const PLACE_DETAILS_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

interface ServerActivity {
  id: string;
  name: string;
  city: string;
  priceSGD: number;
  category: string;
  lat?: number;
  lng?: number;
}

const curatedActivities: ServerActivity[] = [
  { id: "teamlab-planets", name: "TeamLab Planets", city: "Tokyo", priceSGD: 34, category: "museum", lat: 35.6426, lng: 139.7836 },
  { id: "teamlab-borderless", name: "TeamLab Borderless", city: "Tokyo", priceSGD: 34, category: "museum", lat: 35.6256, lng: 139.7785 },
  { id: "disney-sea", name: "Tokyo DisneySea", city: "Tokyo", priceSGD: 84, category: "theme_park", lat: 35.6267, lng: 139.8850 },
  { id: "disneyland", name: "Tokyo Disneyland", city: "Tokyo", priceSGD: 84, category: "theme_park", lat: 35.6329, lng: 139.8804 },
  { id: "skytree", name: "Tokyo Skytree", city: "Tokyo", priceSGD: 19, category: "experience", lat: 35.7101, lng: 139.8107 },
  { id: "senso-ji", name: "Senso-ji Temple", city: "Tokyo", priceSGD: 0, category: "temple", lat: 35.7148, lng: 139.7967 },
  { id: "meiji-shrine", name: "Meiji Shrine", city: "Tokyo", priceSGD: 0, category: "temple", lat: 35.6764, lng: 139.6993 },
  { id: "tokyo-tower", name: "Tokyo Tower", city: "Tokyo", priceSGD: 11, category: "experience", lat: 35.6586, lng: 139.7454 },
  { id: "shibuya-sky", name: "Shibuya Sky", city: "Tokyo", priceSGD: 20, category: "experience", lat: 35.6580, lng: 139.7016 },
  { id: "national-museum", name: "Tokyo National Museum", city: "Tokyo", priceSGD: 9, category: "museum", lat: 35.7189, lng: 139.7765 },
  { id: "ueno-zoo", name: "Ueno Zoo", city: "Tokyo", priceSGD: 5, category: "experience", lat: 35.7163, lng: 139.7714 },
  { id: "shinjuku-gyoen", name: "Shinjuku Gyoen Garden", city: "Tokyo", priceSGD: 4, category: "experience", lat: 35.6852, lng: 139.7100 },
  { id: "sanrio-puroland", name: "Sanrio Puroland", city: "Tokyo", priceSGD: 32, category: "theme_park", lat: 35.6254, lng: 139.4287 },
  { id: "robot-restaurant", name: "Robot Restaurant Show", city: "Tokyo", priceSGD: 76, category: "experience", lat: 35.6940, lng: 139.7036 },
  { id: "usj", name: "Universal Studios Japan", city: "Osaka", priceSGD: 85, category: "theme_park", lat: 34.6656, lng: 135.4323 },
  { id: "osaka-castle", name: "Osaka Castle", city: "Osaka", priceSGD: 5, category: "museum", lat: 34.6873, lng: 135.5262 },
  { id: "dotonbori", name: "Dotonbori Food Tour", city: "Osaka", priceSGD: 0, category: "experience", lat: 34.6687, lng: 135.5011 },
  { id: "osaka-aquarium", name: "Osaka Aquarium Kaiyukan", city: "Osaka", priceSGD: 24, category: "museum", lat: 34.6545, lng: 135.4290 },
  { id: "umeda-sky", name: "Umeda Sky Building", city: "Osaka", priceSGD: 13, category: "experience", lat: 34.7052, lng: 135.4906 },
  { id: "shinsekai", name: "Shinsekai District Tour", city: "Osaka", priceSGD: 0, category: "experience", lat: 34.6522, lng: 135.5062 },
  { id: "sumiyoshi-taisha", name: "Sumiyoshi Taisha Shrine", city: "Osaka", priceSGD: 0, category: "temple", lat: 34.6118, lng: 135.4928 },
  { id: "fushimi-inari", name: "Fushimi Inari Shrine", city: "Kyoto", priceSGD: 0, category: "temple", lat: 34.9671, lng: 135.7727 },
  { id: "kinkaku-ji", name: "Kinkaku-ji (Golden Pavilion)", city: "Kyoto", priceSGD: 4, category: "temple", lat: 35.0394, lng: 135.7292 },
  { id: "arashiyama", name: "Arashiyama Bamboo Grove", city: "Kyoto", priceSGD: 0, category: "experience", lat: 35.0094, lng: 135.6722 },
  { id: "gion", name: "Gion District Walking Tour", city: "Kyoto", priceSGD: 0, category: "experience", lat: 35.0036, lng: 135.7756 },
  { id: "nijo-castle", name: "Nijo Castle", city: "Kyoto", priceSGD: 7, category: "museum", lat: 35.0142, lng: 135.7481 },
  { id: "kiyomizu-dera", name: "Kiyomizu-dera Temple", city: "Kyoto", priceSGD: 4, category: "temple", lat: 34.9949, lng: 135.7850 },
  { id: "ginkaku-ji", name: "Ginkaku-ji (Silver Pavilion)", city: "Kyoto", priceSGD: 4, category: "temple", lat: 35.0270, lng: 135.7982 },
  { id: "ryoan-ji", name: "Ryoan-ji Zen Garden", city: "Kyoto", priceSGD: 5, category: "temple", lat: 35.0345, lng: 135.7184 },
  { id: "philosopher-path", name: "Philosopher's Path Walk", city: "Kyoto", priceSGD: 0, category: "experience", lat: 35.0233, lng: 135.7944 },
  { id: "nishiki-market", name: "Nishiki Market Food Tour", city: "Kyoto", priceSGD: 0, category: "experience", lat: 35.0050, lng: 135.7649 },
  { id: "niseko-ski", name: "Niseko Ski Pass (1 day)", city: "Hokkaido", priceSGD: 67, category: "experience", lat: 42.8048, lng: 140.6874 },
  { id: "otaru", name: "Otaru Day Trip", city: "Hokkaido", priceSGD: 0, category: "day_trip", lat: 43.1907, lng: 140.9947 },
  { id: "shiroi-koibito", name: "Shiroi Koibito Park", city: "Hokkaido", priceSGD: 7, category: "museum", lat: 43.1056, lng: 141.2583 },
  { id: "sapporo-beer", name: "Sapporo Beer Museum", city: "Hokkaido", priceSGD: 4, category: "museum", lat: 43.0707, lng: 141.3633 },
  { id: "noboribetsu", name: "Noboribetsu Onsen Day Trip", city: "Hokkaido", priceSGD: 0, category: "day_trip", lat: 42.4561, lng: 141.1649 },
  { id: "asahiyama-zoo", name: "Asahiyama Zoo", city: "Hokkaido", priceSGD: 9, category: "experience", lat: 43.7681, lng: 142.4792 },
  { id: "dazaifu", name: "Dazaifu Tenmangu Shrine", city: "Fukuoka", priceSGD: 0, category: "temple", lat: 33.5191, lng: 130.5350 },
  { id: "fukuoka-tower", name: "Fukuoka Tower", city: "Fukuoka", priceSGD: 7, category: "experience", lat: 33.5933, lng: 130.3518 },
  { id: "ohori-park", name: "Ohori Park", city: "Fukuoka", priceSGD: 0, category: "experience", lat: 33.5847, lng: 130.3771 },
  { id: "canal-city", name: "Canal City Hakata", city: "Fukuoka", priceSGD: 0, category: "experience", lat: 33.5897, lng: 130.4111 },
  { id: "yanagawa", name: "Yanagawa River Cruise", city: "Fukuoka", priceSGD: 15, category: "experience", lat: 33.1633, lng: 130.4061 },
  { id: "churaumi", name: "Okinawa Churaumi Aquarium", city: "Okinawa", priceSGD: 19, category: "museum", lat: 26.6942, lng: 127.8779 },
  { id: "shuri-castle", name: "Shuri Castle", city: "Okinawa", priceSGD: 4, category: "museum", lat: 26.2170, lng: 127.7195 },
  { id: "american-village", name: "American Village", city: "Okinawa", priceSGD: 0, category: "experience", lat: 26.3177, lng: 127.7558 },
  { id: "kokusai-street", name: "Kokusai Street Shopping", city: "Okinawa", priceSGD: 0, category: "experience", lat: 26.2155, lng: 127.6847 },
  { id: "kerama-snorkel", name: "Kerama Islands Snorkeling", city: "Okinawa", priceSGD: 71, category: "experience", lat: 26.1972, lng: 127.3003 },
  { id: "okinawa-world", name: "Okinawa World Cave", city: "Okinawa", priceSGD: 18, category: "experience", lat: 26.1419, lng: 127.7480 },
  { id: "nara-park", name: "Nara Park & Deer", city: "Nara", priceSGD: 0, category: "experience", lat: 34.6851, lng: 135.8430 },
  { id: "todai-ji", name: "Todai-ji Temple", city: "Nara", priceSGD: 5, category: "temple", lat: 34.6890, lng: 135.8398 },
  { id: "kasuga-taisha", name: "Kasuga Grand Shrine", city: "Nara", priceSGD: 4, category: "temple", lat: 34.6812, lng: 135.8480 },
  { id: "naramachi", name: "Naramachi Old Town Walk", city: "Nara", priceSGD: 0, category: "experience", lat: 34.6794, lng: 135.8290 },
  { id: "peace-memorial", name: "Hiroshima Peace Memorial", city: "Hiroshima", priceSGD: 2, category: "museum", lat: 34.3955, lng: 132.4536 },
  { id: "miyajima", name: "Miyajima Island Day Trip", city: "Hiroshima", priceSGD: 4, category: "day_trip", lat: 34.2963, lng: 132.3198 },
  { id: "hiroshima-castle", name: "Hiroshima Castle", city: "Hiroshima", priceSGD: 3, category: "museum", lat: 34.4016, lng: 132.4594 },
  { id: "shukkei-en", name: "Shukkei-en Garden", city: "Hiroshima", priceSGD: 2, category: "experience", lat: 34.3987, lng: 132.4665 },
  { id: "nagoya-castle", name: "Nagoya Castle", city: "Nagoya", priceSGD: 4, category: "museum", lat: 35.1856, lng: 136.8999 },
  { id: "toyota-museum", name: "Toyota Museum", city: "Nagoya", priceSGD: 18, category: "museum", lat: 35.1721, lng: 136.9251 },
  { id: "osu-shopping", name: "Osu Shopping District", city: "Nagoya", priceSGD: 0, category: "experience", lat: 35.1593, lng: 136.9046 },
  { id: "atsuta-shrine", name: "Atsuta Shrine", city: "Nagoya", priceSGD: 0, category: "temple", lat: 35.1278, lng: 136.9091 },
  { id: "minato-mirai", name: "Minato Mirai", city: "Yokohama", priceSGD: 0, category: "experience", lat: 35.4558, lng: 139.6323 },
  { id: "cup-noodles", name: "Cup Noodles Museum", city: "Yokohama", priceSGD: 4, category: "museum", lat: 35.4544, lng: 139.6365 },
  { id: "yokohama-chinatown", name: "Yokohama Chinatown", city: "Yokohama", priceSGD: 0, category: "experience", lat: 35.4423, lng: 139.6453 },
  { id: "landmark-tower", name: "Landmark Tower Sky Garden", city: "Yokohama", priceSGD: 9, category: "experience", lat: 35.4553, lng: 139.6310 },
];

function generateGoogleMapsLink(activity: ServerActivity): string {
  if (activity.lat && activity.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${activity.lat},${activity.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.name + " " + activity.city + " Japan")}`;
}

function getItineraryForCity(city: string, days: number, maxBudgetPerPlace: number): { activities: Array<ServerActivity & { mapsLink: string }>, totalBudget: number } {
  const cityActivities = curatedActivities
    .filter(a => a.city === city && a.priceSGD <= maxBudgetPerPlace)
    .sort((a, b) => {
      if (a.priceSGD === 0 && b.priceSGD > 0) return -1;
      if (b.priceSGD === 0 && a.priceSGD > 0) return 1;
      return 0;
    });
  
  const activitiesPerDay = Math.min(4, Math.ceil(cityActivities.length / days));
  const selectedActivities = cityActivities.slice(0, days * activitiesPerDay);
  
  const result = selectedActivities.map(a => ({
    ...a,
    mapsLink: generateGoogleMapsLink(a)
  }));
  
  const totalBudget = result.reduce((sum, a) => sum + a.priceSGD, 0);
  
  return { activities: result, totalBudget };
}

async function fetchOSMAttractions(city: string): Promise<OSMAttraction[]> {
  const coords = cityCoordinates[city];
  if (!coords) return [];

  const cached = attractionsCache[city];
  if (cached && Date.now() - cached.timestamp < ATTRACTIONS_CACHE_DURATION) {
    return cached.data;
  }

  const radius = city === "Hokkaido" ? 50000 : 15000;
  
  const query = `
    [out:json][timeout:30];
    (
      node["tourism"~"attraction|museum|viewpoint|theme_park|artwork|gallery|zoo"](around:${radius},${coords.lat},${coords.lon});
      node["historic"~"castle|monument|memorial|shrine|temple"](around:${radius},${coords.lat},${coords.lon});
      node["leisure"~"park|garden|water_park"](around:${radius},${coords.lat},${coords.lon});
      way["tourism"~"attraction|museum|viewpoint|theme_park|zoo"](around:${radius},${coords.lat},${coords.lon});
      way["historic"~"castle"](around:${radius},${coords.lat},${coords.lon});
    );
    out body center 50;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error("Overpass API request failed");
    }

    const data = await response.json();
    const attractions: OSMAttraction[] = [];

    for (const element of data.elements || []) {
      const tags = element.tags || {};
      const name = tags.name || tags["name:en"];
      if (!name) continue;

      const lat = element.lat || element.center?.lat;
      const lon = element.lon || element.center?.lon;
      if (!lat || !lon) continue;

      let category = "experience";
      if (tags.tourism === "museum" || tags.tourism === "gallery") category = "museum";
      else if (tags.tourism === "theme_park" || tags.leisure === "water_park") category = "theme_park";
      else if (tags.historic === "shrine" || tags.historic === "temple") category = "temple";
      else if (tags.tourism === "viewpoint") category = "viewpoint";
      else if (tags.historic === "castle" || tags.historic === "monument") category = "landmark";
      else if (tags.leisure === "park" || tags.leisure === "garden") category = "nature";

      attractions.push({
        id: `osm-${element.id}`,
        name,
        type: tags.tourism || tags.historic || tags.leisure || "attraction",
        lat,
        lon,
        category,
      });
    }

    attractionsCache[city] = { data: attractions, timestamp: Date.now() };
    return attractions;
  } catch (error) {
    console.error("Error fetching OSM attractions:", error);
    return cached?.data || [];
  }
}

async function fetchExchangeRate(): Promise<{ rate: number; lastUpdated: string }> {
  const now = Date.now();
  
  if (cachedExchangeRate && now - lastFetchTime < CACHE_DURATION) {
    return cachedExchangeRate;
  }

  try {
    const response = await fetch(EXCHANGE_RATE_API);
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate");
    }
    const data = await response.json();
    const jpyRate = data.rates?.JPY;
    
    if (jpyRate) {
      const sgdToJpyRate = 1 / jpyRate;
      cachedExchangeRate = {
        rate: sgdToJpyRate,
        lastUpdated: new Date().toISOString(),
      };
      lastFetchTime = now;
      return cachedExchangeRate;
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
  }

  return {
    rate: DEFAULT_EXCHANGE_RATE,
    lastUpdated: new Date().toISOString(),
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api", maliciousUserAgentBlocker);
  app.use("/api", attackPatternBlocker);

  app.get("/api/exchange-rate", async (req, res) => {
    try {
      const exchangeData = await fetchExchangeRate();
      const etag = `"${exchangeData.lastUpdated}"`;
      
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
      
      res.json(exchangeData);
    } catch (error) {
      res.status(500).json({ 
        rate: DEFAULT_EXCHANGE_RATE, 
        lastUpdated: new Date().toISOString(),
        error: "Failed to fetch live rate, using default" 
      });
    }
  });

  app.get("/api/health", async (req, res) => {
    const checks: Record<string, string> = {
      server: "healthy",
    };
    
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`SELECT 1`);
      checks.database = "healthy";
    } catch (error) {
      checks.database = "unhealthy";
    }

    const allHealthy = Object.values(checks).every(status => status === "healthy");
    
    res.status(allHealthy ? 200 : 503).json({ 
      status: allHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    });
  });

  app.get("/api/health/live", (req, res) => {
    res.json({ status: "alive", timestamp: new Date().toISOString() });
  });

  app.get("/api/health/ready", async (req, res) => {
    try {
      const { db } = await import("./db");
      const { sql } = await import("drizzle-orm");
      await db.execute(sql`SELECT 1`);
      res.json({ status: "ready", timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(503).json({ 
        status: "not_ready", 
        timestamp: new Date().toISOString(),
        error: "Database connection failed" 
      });
    }
  });

  const weatherCache: Record<string, { data: any; timestamp: number }> = {};
  const WEATHER_CACHE_DURATION = 15 * 60 * 1000;

  app.get("/api/weather/:city", cityParamValidation, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const city = req.params.city;
      const coords = cityCoordinates[city];
      
      if (!coords) {
        return res.status(400).json({ error: "Unknown city" });
      }

      const cached = weatherCache[city];
      const now = Date.now();
      
      if (cached && now - cached.timestamp < WEATHER_CACHE_DURATION) {
        const etag = `"weather-${city}-${cached.timestamp}"`;
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'public, max-age=900');
        
        if (req.headers['if-none-match'] === etag) {
          return res.status(304).end();
        }
        return res.json(cached.data);
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=Asia/Tokyo&forecast_days=14`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }
      
      const data = await response.json();
      const weatherData = {
        city,
        daily: data.daily,
        timezone: data.timezone,
      };
      
      weatherCache[city] = { data: weatherData, timestamp: now };
      
      const etag = `"weather-${city}-${now}"`;
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=900');
      
      res.json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  app.get("/api/attractions/:city", cityParamValidation, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const city = req.params.city;
      
      if (!cityCoordinates[city]) {
        return res.status(400).json({ error: "Unknown city" });
      }

      const existingCache = attractionsCache[city];
      const existingEtag = existingCache ? `"attractions-${city}-${existingCache.timestamp}"` : null;
      
      if (existingEtag && req.headers['if-none-match'] === existingEtag) {
        res.setHeader('ETag', existingEtag);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(304).end();
      }

      const attractions = await fetchOSMAttractions(city);
      const cached = attractionsCache[city];
      const etag = `"attractions-${city}-${cached?.timestamp || Date.now()}"`;
      
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      res.json({
        city,
        attractions,
        source: "OpenStreetMap",
      });
    } catch (error) {
      console.error("Attractions API error:", error);
      res.status(500).json({ error: "Failed to fetch attractions" });
    }
  });

  app.get("/api/place-details", placeDetailsValidation, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      if (!GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ error: "Google Maps API not configured" });
      }

      const { name, lat, lng } = req.query;

      const cacheKey = `${name}-${lat}-${lng}`;
      const cached = placeDetailsCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < PLACE_DETAILS_CACHE_DURATION) {
        const { timestamp, ...cacheData } = cached;
        return res.json(cacheData);
      }

      const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&keyword=${encodeURIComponent(name as string)}&key=${GOOGLE_MAPS_API_KEY}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.results && searchData.results.length > 0) {
        const place = searchData.results[0];
        const result = {
          placeId: place.place_id,
          name: place.name,
          rating: place.rating || null,
          userRatingsTotal: place.user_ratings_total || 0,
          lat: place.geometry?.location?.lat,
          lng: place.geometry?.location?.lng,
          vicinity: place.vicinity,
        };
        placeDetailsCache[cacheKey] = { ...result, timestamp: Date.now() };
        res.json(result);
      } else {
        const result = { rating: null, userRatingsTotal: 0 };
        placeDetailsCache[cacheKey] = { ...result, timestamp: Date.now() };
        res.json(result);
      }
    } catch (error) {
      console.error("Place details API error:", error);
      res.status(500).json({ error: "Failed to fetch place details" });
    }
  });

  app.get("/api/maps-embed", mapsEmbedValidation, handleValidationErrors, (req: Request, res: Response) => {
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: "Google Maps API not configured" });
    }

    const { lat, lng, name } = req.query;

    const q = name ? encodeURIComponent(name as string) : `${lat},${lng}`;
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${q}&center=${lat},${lng}&zoom=15`;
    
    res.json({ embedUrl });
  });

  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      if (!sessionId || !validateSessionId(sessionId)) {
        return res.status(400).json({ error: "Valid session ID required" });
      }
      
      const messages = await storage.getSessionMessages(sessionId);
      res.json({ messages: messages.map(m => ({ role: m.role, content: m.content })) });
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ error: "Failed to get chat history" });
    }
  });

  app.post("/api/chat", chatRateLimiter, async (req, res) => {
    try {
      if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "Chat service not configured" });
      }

      const { messages, sessionId } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
        return res.status(400).json({ error: "Messages must be an array with 1-50 items" });
      }

      if (!sessionId || typeof sessionId !== "string" || !validateSessionId(sessionId)) {
        return res.status(400).json({ error: "Valid session ID required (UUID format)" });
      }

      const validatedMessages = messages
        .filter((msg): msg is { role: string; content: string } => 
          typeof msg === "object" && 
          msg !== null &&
          typeof msg.content === "string" &&
          msg.content.length > 0 &&
          msg.content.length <= 4000 &&
          (msg.role === "user" || msg.role === "assistant")
        )
        .map(msg => ({
          role: msg.role as "user" | "assistant",
          content: sanitizeString(msg.content, 4000),
        }));

      if (validatedMessages.length === 0) {
        return res.status(400).json({ error: "No valid messages provided" });
      }

      await storage.getOrCreateSession(sessionId);
      
      const lastUserMessage = validatedMessages[validatedMessages.length - 1];
      if (lastUserMessage?.role === "user") {
        await storage.saveMessage({ sessionId, role: "user", content: lastUserMessage.content });
      }

      let itineraryContext = "";
      if (lastUserMessage?.role === "user") {
        const userText = lastUserMessage.content.toLowerCase();
        const isTripPlanning = 
          (userText.includes("itinerary") || userText.includes("plan") || userText.includes("trip") || userText.includes("visit")) &&
          (userText.includes("day") || userText.includes("days"));
        
        if (isTripPlanning) {
          const cities = ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Okinawa", "Nagoya", "Hiroshima", "Nara", "Yokohama"];
          const detectedCity = cities.find(city => userText.includes(city.toLowerCase()));
          
          const daysMatch = userText.match(/(\d+)\s*days?/);
          const days = daysMatch ? parseInt(daysMatch[1]) : 3;
          
          const budgetMatch = userText.match(/s?\$?\s*(\d+)/);
          const maxBudget = budgetMatch ? parseInt(budgetMatch[1]) : 50;
          
          if (detectedCity) {
            const itinerary = getItineraryForCity(detectedCity, days, maxBudget);
            
            itineraryContext = `\n\nITINERARY DATA FOR ${detectedCity.toUpperCase()} (${days} days, max S$${maxBudget} per place):
Available activities within budget (with Google Maps links):
${itinerary.activities.map((a, i) => 
  `${i + 1}. ${a.name} - ${a.priceSGD === 0 ? "FREE" : `S$${a.priceSGD}`} (${a.category})
   Google Maps: ${a.mapsLink}`
).join("\n")}

Total estimated activity cost: S$${itinerary.totalBudget}

INSTRUCTIONS: When creating the itinerary, you MUST:
1. Group these activities by day for an optimal route (nearby locations on the same day)
2. Include the Google Maps link for EACH place in your response
3. Format links as clickable markdown: [Location Name](maps_link)
4. Suggest visiting order to minimize travel time
5. Mention the entry fee (or "Free") for each attraction`;
          }
        }
      }

      const enhancedSystemPrompt = JAPAN_TRAVEL_SYSTEM_PROMPT + itineraryContext;

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://japan-travel-budget.replit.app",
          "X-Title": "Japan Travel Budget Calculator",
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4",
          messages: [
            { role: "system", content: enhancedSystemPrompt },
            ...validatedMessages,
          ],
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", errorText);
        return res.status(response.status).json({ error: "Failed to get response from AI" });
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";
      
      await storage.saveMessage({ sessionId, role: "assistant", content: assistantMessage });
      
      res.json({ message: assistantMessage });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const subscriber = await storage.subscribeNewsletter(email.toLowerCase().trim());
      res.json({ success: true, message: "Successfully subscribed to newsletter!" });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      res.status(500).json({ error: "Failed to subscribe. Please try again." });
    }
  });

  app.post("/api/analytics/budget", async (req, res) => {
    try {
      const { 
        sessionId, 
        departureDate, 
        returnDate, 
        travelers, 
        cities, 
        travelStyle, 
        totalBudgetSgd, 
        perPersonSgd, 
        exchangeRate, 
        breakdown 
      } = req.body;

      if (!travelers || !cities || !travelStyle || !totalBudgetSgd || !perPersonSgd || !exchangeRate || !breakdown) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!Array.isArray(cities) || cities.length === 0) {
        return res.status(400).json({ error: "Cities must be a non-empty array" });
      }

      const result = await storage.trackBudgetCalculation({
        sessionId: sessionId ? sanitizeString(sessionId, 100) : null,
        departureDate: departureDate ? sanitizeString(departureDate, 20) : null,
        returnDate: returnDate ? sanitizeString(returnDate, 20) : null,
        travelers: Number(travelers),
        cities: cities.map((c: string) => sanitizeString(c, 50)),
        travelStyle: sanitizeString(travelStyle, 20),
        totalBudgetSgd: String(totalBudgetSgd),
        perPersonSgd: String(perPersonSgd),
        exchangeRate: String(exchangeRate),
        breakdown,
      });

      res.json({ success: true, id: result.id });
    } catch (error) {
      console.error("Budget tracking error:", error);
      res.status(500).json({ error: "Failed to track budget calculation" });
    }
  });

  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const { sessionId, pagePath, referrer, userAgent } = req.body;

      if (!pagePath || typeof pagePath !== "string") {
        return res.status(400).json({ error: "Page path is required" });
      }

      const result = await storage.trackPageView({
        sessionId: sessionId ? sanitizeString(sessionId, 100) : null,
        pagePath: sanitizeString(pagePath, 500),
        referrer: referrer ? sanitizeString(referrer, 500) : null,
        userAgent: userAgent ? sanitizeString(userAgent, 500) : null,
      });

      res.json({ success: true, id: result.id });
    } catch (error) {
      console.error("Page view tracking error:", error);
      res.status(500).json({ error: "Failed to track page view" });
    }
  });

  app.post("/api/analytics/event", async (req, res) => {
    try {
      const { sessionId, eventType, eventCategory, eventData } = req.body;

      if (!eventType || !eventCategory) {
        return res.status(400).json({ error: "Event type and category are required" });
      }

      const result = await storage.trackUserEvent({
        sessionId: sessionId ? sanitizeString(sessionId, 100) : null,
        eventType: sanitizeString(eventType, 100),
        eventCategory: sanitizeString(eventCategory, 100),
        eventData: eventData || null,
      });

      res.json({ success: true, id: result.id });
    } catch (error) {
      console.error("Event tracking error:", error);
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const maxDays = 365;
      const limitedDays = Math.min(Math.max(1, days), maxDays);

      const summary = await storage.getAnalyticsSummary(limitedDays);
      res.json({
        period: `${limitedDays} days`,
        ...summary,
      });
    } catch (error) {
      console.error("Analytics dashboard error:", error);
      res.status(500).json({ error: "Failed to get analytics data" });
    }
  });

  return httpServer;
}
