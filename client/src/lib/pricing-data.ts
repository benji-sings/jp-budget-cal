import type { City, AccommodationType, JRPassType, Activity } from "@shared/schema";

export const DEFAULT_EXCHANGE_RATE = 0.0089;

export const cityAirports: Record<City, { codes: string; name: string }> = {
  Tokyo: { codes: "NRT/HND", name: "Narita / Haneda" },
  Osaka: { codes: "KIX", name: "Kansai International" },
  Kyoto: { codes: "KIX", name: "Kansai International" },
  Hokkaido: { codes: "CTS", name: "New Chitose" },
  Fukuoka: { codes: "FUK", name: "Fukuoka Airport" },
  Okinawa: { codes: "OKA", name: "Naha Airport" },
  Nagoya: { codes: "NGO", name: "Chubu Centrair" },
  Hiroshima: { codes: "HIJ", name: "Hiroshima Airport" },
  Nara: { codes: "KIX", name: "Kansai International" },
  Yokohama: { codes: "NRT/HND", name: "Narita / Haneda" },
};

export function getFlightRoute(city: City): string {
  const airport = cityAirports[city];
  return `Singapore (SIN) → ${city} (${airport.codes})`;
}

export const flightPrices: Record<City, { budget: number; fullService: number }> = {
  Tokyo: { budget: 350, fullService: 650 },
  Osaka: { budget: 320, fullService: 600 },
  Kyoto: { budget: 350, fullService: 650 },
  Hokkaido: { budget: 400, fullService: 750 },
  Fukuoka: { budget: 300, fullService: 580 },
  Okinawa: { budget: 380, fullService: 700 },
  Nagoya: { budget: 340, fullService: 620 },
  Hiroshima: { budget: 360, fullService: 680 },
  Nara: { budget: 350, fullService: 650 },
  Yokohama: { budget: 350, fullService: 650 },
};

export const accommodationPrices: Record<City, Record<AccommodationType, number>> = {
  Tokyo: { hostel: 50, businessHotel: 100, midrange: 180, luxury: 400 },
  Osaka: { hostel: 40, businessHotel: 80, midrange: 150, luxury: 350 },
  Kyoto: { hostel: 45, businessHotel: 90, midrange: 170, luxury: 450 },
  Hokkaido: { hostel: 45, businessHotel: 85, midrange: 160, luxury: 380 },
  Fukuoka: { hostel: 35, businessHotel: 70, midrange: 130, luxury: 300 },
  Okinawa: { hostel: 40, businessHotel: 75, midrange: 140, luxury: 350 },
  Nagoya: { hostel: 38, businessHotel: 75, midrange: 140, luxury: 320 },
  Hiroshima: { hostel: 35, businessHotel: 70, midrange: 130, luxury: 300 },
  Nara: { hostel: 40, businessHotel: 80, midrange: 150, luxury: 350 },
  Yokohama: { hostel: 45, businessHotel: 90, midrange: 165, luxury: 380 },
};

export const jrPassPrices: Record<JRPassType, number> = {
  none: 0,
  "7day": 380,
  "14day": 610,
  "21day": 780,
};

export const airportTransferPrices = {
  nex: 40,
  haruka: 35,
  limousineBus: 25,
  regularTrain: 15,
};

export type CarRentalCompany = "toyota" | "nippon" | "times" | "orix" | "budget" | "none";

export const carRentalPrices: Record<CarRentalCompany, { dailyRate: number; name: string; description: string }> = {
  none: { dailyRate: 0, name: "No car rental", description: "Use public transport only" },
  toyota: { dailyRate: 55, name: "Toyota Rent a Car", description: "Largest network, reliable service" },
  nippon: { dailyRate: 50, name: "Nippon Rent-A-Car", description: "Good English support, wide coverage" },
  times: { dailyRate: 45, name: "Times Car Rental", description: "Budget-friendly, popular choice" },
  orix: { dailyRate: 48, name: "ORIX Rent A Car", description: "Good for long-term rentals" },
  budget: { dailyRate: 40, name: "Budget Rent A Car", description: "International brand, familiar service" },
};

export const carRentalTips = [
  "International Driving Permit (IDP) required - get it from AA Singapore before traveling",
  "Japan drives on the left side of the road (same as Singapore)",
  "Expressway tolls can add ¥5,000-10,000/day - consider an ETC card",
  "Parking in cities is expensive (¥1,500-3,000/day) - best for countryside trips",
  "GPS navigation usually available in English - request when booking",
  "Best value for Hokkaido, Okinawa, or rural areas where trains are limited",
];

export const foodBudgets = {
  budget: { min: 20, max: 35, average: 28, examples: ["Konbini meals", "Ramen", "Gyudon chains", "Udon"] },
  midrange: { min: 40, max: 70, average: 55, examples: ["Izakaya", "Family restaurants", "Sushi-go-round", "Tonkatsu"] },
  splurge: { min: 100, max: 250, average: 150, examples: ["Omakase sushi", "Kaiseki", "Wagyu beef", "Michelin restaurants"] },
};

export const activities: Activity[] = [
  { id: "teamlab-planets", name: "TeamLab Planets", city: "Tokyo", priceJPY: 3800, priceSGD: 34, category: "museum", lat: 35.6426, lng: 139.7836 },
  { id: "teamlab-borderless", name: "TeamLab Borderless", city: "Tokyo", priceJPY: 3800, priceSGD: 34, category: "museum", lat: 35.6256, lng: 139.7785 },
  { id: "disney-sea", name: "Tokyo DisneySea", city: "Tokyo", priceJPY: 9400, priceSGD: 84, category: "theme_park", lat: 35.6267, lng: 139.8850 },
  { id: "disneyland", name: "Tokyo Disneyland", city: "Tokyo", priceJPY: 9400, priceSGD: 84, category: "theme_park", lat: 35.6329, lng: 139.8804 },
  { id: "skytree", name: "Tokyo Skytree", city: "Tokyo", priceJPY: 2100, priceSGD: 19, category: "experience", lat: 35.7101, lng: 139.8107 },
  { id: "senso-ji", name: "Senso-ji Temple", city: "Tokyo", priceJPY: 0, priceSGD: 0, category: "temple", lat: 35.7148, lng: 139.7967 },
  { id: "meiji-shrine", name: "Meiji Shrine", city: "Tokyo", priceJPY: 0, priceSGD: 0, category: "temple", lat: 35.6764, lng: 139.6993 },
  { id: "tokyo-tower", name: "Tokyo Tower", city: "Tokyo", priceJPY: 1200, priceSGD: 11, category: "experience", lat: 35.6586, lng: 139.7454 },
  { id: "shibuya-sky", name: "Shibuya Sky", city: "Tokyo", priceJPY: 2200, priceSGD: 20, category: "experience", lat: 35.6580, lng: 139.7016 },
  { id: "national-museum", name: "Tokyo National Museum", city: "Tokyo", priceJPY: 1000, priceSGD: 9, category: "museum", lat: 35.7189, lng: 139.7765 },
  { id: "ueno-zoo", name: "Ueno Zoo", city: "Tokyo", priceJPY: 600, priceSGD: 5, category: "experience", lat: 35.7163, lng: 139.7714 },
  { id: "shinjuku-gyoen", name: "Shinjuku Gyoen Garden", city: "Tokyo", priceJPY: 500, priceSGD: 4, category: "experience", lat: 35.6852, lng: 139.7100 },
  { id: "sanrio-puroland", name: "Sanrio Puroland", city: "Tokyo", priceJPY: 3600, priceSGD: 32, category: "theme_park", lat: 35.6254, lng: 139.4287 },
  { id: "robot-restaurant", name: "Robot Restaurant Show", city: "Tokyo", priceJPY: 8500, priceSGD: 76, category: "experience", lat: 35.6940, lng: 139.7036 },
  { id: "usj", name: "Universal Studios Japan", city: "Osaka", priceJPY: 9500, priceSGD: 85, category: "theme_park", lat: 34.6656, lng: 135.4323 },
  { id: "osaka-castle", name: "Osaka Castle", city: "Osaka", priceJPY: 600, priceSGD: 5, category: "museum", lat: 34.6873, lng: 135.5262 },
  { id: "dotonbori", name: "Dotonbori Food Tour", city: "Osaka", priceJPY: 0, priceSGD: 0, category: "experience", lat: 34.6687, lng: 135.5011 },
  { id: "osaka-aquarium", name: "Osaka Aquarium Kaiyukan", city: "Osaka", priceJPY: 2700, priceSGD: 24, category: "museum", lat: 34.6545, lng: 135.4290 },
  { id: "umeda-sky", name: "Umeda Sky Building", city: "Osaka", priceJPY: 1500, priceSGD: 13, category: "experience", lat: 34.7052, lng: 135.4906 },
  { id: "shinsekai", name: "Shinsekai District Tour", city: "Osaka", priceJPY: 0, priceSGD: 0, category: "experience", lat: 34.6522, lng: 135.5062 },
  { id: "sumiyoshi-taisha", name: "Sumiyoshi Taisha Shrine", city: "Osaka", priceJPY: 0, priceSGD: 0, category: "temple", lat: 34.6118, lng: 135.4928 },
  { id: "fushimi-inari", name: "Fushimi Inari Shrine", city: "Kyoto", priceJPY: 0, priceSGD: 0, category: "temple", lat: 34.9671, lng: 135.7727 },
  { id: "kinkaku-ji", name: "Kinkaku-ji (Golden Pavilion)", city: "Kyoto", priceJPY: 500, priceSGD: 4, category: "temple", lat: 35.0394, lng: 135.7292 },
  { id: "arashiyama", name: "Arashiyama Bamboo Grove", city: "Kyoto", priceJPY: 0, priceSGD: 0, category: "experience", lat: 35.0094, lng: 135.6722 },
  { id: "gion", name: "Gion District Walking Tour", city: "Kyoto", priceJPY: 0, priceSGD: 0, category: "experience", lat: 35.0036, lng: 135.7756 },
  { id: "nijo-castle", name: "Nijo Castle", city: "Kyoto", priceJPY: 800, priceSGD: 7, category: "museum", lat: 35.0142, lng: 135.7481 },
  { id: "kiyomizu-dera", name: "Kiyomizu-dera Temple", city: "Kyoto", priceJPY: 400, priceSGD: 4, category: "temple", lat: 34.9949, lng: 135.7850 },
  { id: "ginkaku-ji", name: "Ginkaku-ji (Silver Pavilion)", city: "Kyoto", priceJPY: 500, priceSGD: 4, category: "temple", lat: 35.0270, lng: 135.7982 },
  { id: "ryoan-ji", name: "Ryoan-ji Zen Garden", city: "Kyoto", priceJPY: 600, priceSGD: 5, category: "temple", lat: 35.0345, lng: 135.7184 },
  { id: "philosopher-path", name: "Philosopher's Path Walk", city: "Kyoto", priceJPY: 0, priceSGD: 0, category: "experience", lat: 35.0233, lng: 135.7944 },
  { id: "nishiki-market", name: "Nishiki Market Food Tour", city: "Kyoto", priceJPY: 0, priceSGD: 0, category: "experience", lat: 35.0050, lng: 135.7649 },
  { id: "niseko-ski", name: "Niseko Ski Pass (1 day)", city: "Hokkaido", priceJPY: 7500, priceSGD: 67, category: "experience", seasonal: true, lat: 42.8048, lng: 140.6874 },
  { id: "otaru", name: "Otaru Day Trip", city: "Hokkaido", priceJPY: 0, priceSGD: 0, category: "day_trip", lat: 43.1907, lng: 140.9947 },
  { id: "shiroi-koibito", name: "Shiroi Koibito Park", city: "Hokkaido", priceJPY: 800, priceSGD: 7, category: "museum", lat: 43.1056, lng: 141.2583 },
  { id: "sapporo-beer", name: "Sapporo Beer Museum", city: "Hokkaido", priceJPY: 500, priceSGD: 4, category: "museum", lat: 43.0707, lng: 141.3633 },
  { id: "noboribetsu", name: "Noboribetsu Onsen Day Trip", city: "Hokkaido", priceJPY: 0, priceSGD: 0, category: "day_trip", lat: 42.4561, lng: 141.1649 },
  { id: "asahiyama-zoo", name: "Asahiyama Zoo", city: "Hokkaido", priceJPY: 1000, priceSGD: 9, category: "experience", lat: 43.7681, lng: 142.4792 },
  { id: "dazaifu", name: "Dazaifu Tenmangu Shrine", city: "Fukuoka", priceJPY: 0, priceSGD: 0, category: "temple", lat: 33.5191, lng: 130.5350 },
  { id: "fukuoka-tower", name: "Fukuoka Tower", city: "Fukuoka", priceJPY: 800, priceSGD: 7, category: "experience", lat: 33.5933, lng: 130.3518 },
  { id: "ohori-park", name: "Ohori Park", city: "Fukuoka", priceJPY: 0, priceSGD: 0, category: "experience", lat: 33.5847, lng: 130.3771 },
  { id: "canal-city", name: "Canal City Hakata", city: "Fukuoka", priceJPY: 0, priceSGD: 0, category: "experience", lat: 33.5897, lng: 130.4111 },
  { id: "yanagawa", name: "Yanagawa River Cruise", city: "Fukuoka", priceJPY: 1650, priceSGD: 15, category: "experience", lat: 33.1633, lng: 130.4061 },
  { id: "churaumi", name: "Okinawa Churaumi Aquarium", city: "Okinawa", priceJPY: 2180, priceSGD: 19, category: "museum", lat: 26.6942, lng: 127.8779 },
  { id: "shuri-castle", name: "Shuri Castle", city: "Okinawa", priceJPY: 400, priceSGD: 4, category: "museum", lat: 26.2170, lng: 127.7195 },
  { id: "american-village", name: "American Village", city: "Okinawa", priceJPY: 0, priceSGD: 0, category: "experience", lat: 26.3177, lng: 127.7558 },
  { id: "kokusai-street", name: "Kokusai Street Shopping", city: "Okinawa", priceJPY: 0, priceSGD: 0, category: "experience", lat: 26.2155, lng: 127.6847 },
  { id: "kerama-snorkel", name: "Kerama Islands Snorkeling", city: "Okinawa", priceJPY: 8000, priceSGD: 71, category: "experience", lat: 26.1972, lng: 127.3003 },
  { id: "okinawa-world", name: "Okinawa World Cave", city: "Okinawa", priceJPY: 2000, priceSGD: 18, category: "experience", lat: 26.1419, lng: 127.7480 },
  { id: "nara-park", name: "Nara Park & Deer", city: "Nara", priceJPY: 0, priceSGD: 0, category: "experience", lat: 34.6851, lng: 135.8430 },
  { id: "todai-ji", name: "Todai-ji Temple", city: "Nara", priceJPY: 600, priceSGD: 5, category: "temple", lat: 34.6890, lng: 135.8398 },
  { id: "kasuga-taisha", name: "Kasuga Grand Shrine", city: "Nara", priceJPY: 500, priceSGD: 4, category: "temple", lat: 34.6812, lng: 135.8480 },
  { id: "naramachi", name: "Naramachi Old Town Walk", city: "Nara", priceJPY: 0, priceSGD: 0, category: "experience", lat: 34.6794, lng: 135.8290 },
  { id: "peace-memorial", name: "Hiroshima Peace Memorial", city: "Hiroshima", priceJPY: 200, priceSGD: 2, category: "museum", lat: 34.3955, lng: 132.4536 },
  { id: "miyajima", name: "Miyajima Island Day Trip", city: "Hiroshima", priceJPY: 500, priceSGD: 4, category: "day_trip", lat: 34.2963, lng: 132.3198 },
  { id: "hiroshima-castle", name: "Hiroshima Castle", city: "Hiroshima", priceJPY: 370, priceSGD: 3, category: "museum", lat: 34.4016, lng: 132.4594 },
  { id: "shukkei-en", name: "Shukkei-en Garden", city: "Hiroshima", priceJPY: 260, priceSGD: 2, category: "experience", lat: 34.3987, lng: 132.4665 },
  { id: "nagoya-castle", name: "Nagoya Castle", city: "Nagoya", priceJPY: 500, priceSGD: 4, category: "museum", lat: 35.1856, lng: 136.8999 },
  { id: "toyota-museum", name: "Toyota Museum", city: "Nagoya", priceJPY: 2000, priceSGD: 18, category: "museum", lat: 35.1721, lng: 136.9251 },
  { id: "osu-shopping", name: "Osu Shopping District", city: "Nagoya", priceJPY: 0, priceSGD: 0, category: "experience", lat: 35.1593, lng: 136.9046 },
  { id: "atsuta-shrine", name: "Atsuta Shrine", city: "Nagoya", priceJPY: 0, priceSGD: 0, category: "temple", lat: 35.1278, lng: 136.9091 },
  { id: "minato-mirai", name: "Minato Mirai", city: "Yokohama", priceJPY: 0, priceSGD: 0, category: "experience", lat: 35.4558, lng: 139.6323 },
  { id: "cup-noodles", name: "Cup Noodles Museum", city: "Yokohama", priceJPY: 500, priceSGD: 4, category: "museum", lat: 35.4544, lng: 139.6365 },
  { id: "yokohama-chinatown", name: "Yokohama Chinatown", city: "Yokohama", priceJPY: 0, priceSGD: 0, category: "experience", lat: 35.4423, lng: 139.6453 },
  { id: "landmark-tower", name: "Landmark Tower Sky Garden", city: "Yokohama", priceJPY: 1000, priceSGD: 9, category: "experience", lat: 35.4553, lng: 139.6310 },
];

export const cityRecommendations = {
  Tokyo: {
    foods: ["Tsukiji Outer Market sushi", "Ichiran Ramen", "Gyukatsu Motomura", "Afuri Yuzu Ramen", "Shibuya yakitori"],
    spots: ["Shibuya Crossing", "Harajuku", "Akihabara", "Shinjuku Gyoen", "Tsukiji Market", "Ginza shopping"],
  },
  Osaka: {
    foods: ["Takoyaki at Dotonbori", "Okonomiyaki at Mizuno", "Kushikatsu", "Kani Doraku crab", "Rikuro cheesecake"],
    spots: ["Dotonbori", "Shinsekai", "Kuromon Market", "Umeda Sky Building", "Namba"],
  },
  Kyoto: {
    foods: ["Tofu kaiseki", "Matcha everything", "Yudofu (hot tofu)", "Nishin soba", "Yuba"],
    spots: ["Philosopher's Path", "Kiyomizu-dera", "Gion at night", "Nishiki Market", "Pontocho"],
  },
  Hokkaido: {
    foods: ["Miso ramen", "Genghis Khan BBQ", "Uni (sea urchin)", "Shiroi Koibito", "Yubari melon"],
    spots: ["Sapporo Beer Museum", "Noboribetsu Onsen", "Furano lavender fields", "Snow festivals"],
  },
  Fukuoka: {
    foods: ["Hakata ramen", "Mentaiko", "Motsunabe", "Mizutaki", "Yatai street food"],
    spots: ["Canal City", "Ohori Park", "Hakata Old Town", "Yanagawa boat cruise"],
  },
  Okinawa: {
    foods: ["Okinawa soba", "Goya champuru", "Sata andagi", "Awamori", "Purple sweet potato tarts"],
    spots: ["Kokusai Street", "American Village", "Kerama Islands", "Shikinaen Garden"],
  },
  Nagoya: {
    foods: ["Hitsumabushi (eel)", "Miso katsu", "Tebasaki wings", "Kishimen noodles"],
    spots: ["Nagoya Castle", "Osu Shopping District", "Toyota Museum"],
  },
  Hiroshima: {
    foods: ["Hiroshima-style okonomiyaki", "Momiji manju", "Oysters", "Anago (conger eel)"],
    spots: ["Peace Memorial Park", "Itsukushima Shrine", "Shukkei-en Garden"],
  },
  Nara: {
    foods: ["Kakinoha-zushi", "Miwa somen", "Kuzu mochi", "Narazuke pickles"],
    spots: ["Nara Park", "Kasuga Grand Shrine", "Naramachi"],
  },
  Yokohama: {
    foods: ["Chinatown dim sum", "Sanma-men", "Yokohama ramen", "Cup Noodles"],
    spots: ["Minato Mirai", "Chinatown", "Cup Noodles Museum", "Yamashita Park"],
  },
};

export const moneyTips = [
  {
    title: "Tax-Free Shopping",
    description: "As a tourist, you can get 10% consumption tax refund on purchases over ¥5,000 at tax-free shops. Look for the 'Tax Free' signs and bring your passport!",
    icon: "receipt",
  },
  {
    title: "IC Cards Save Time",
    description: "Get a Suica or Pasmo card immediately upon arrival. Use it for trains, buses, convenience stores, and vending machines. Avoids fumbling for exact change.",
    icon: "credit-card",
  },
  {
    title: "Konbini is Your Friend",
    description: "7-Eleven, Lawson, and FamilyMart offer quality meals from $3-8 SGD. Onigiri, bento boxes, and sandwiches are fresh and delicious. ATMs here also accept foreign cards.",
    icon: "store",
  },
  {
    title: "JR Pass Timing",
    description: "The JR Pass is worth it only if you're doing multiple long-distance shinkansen trips. A Tokyo-Osaka round trip alone almost covers a 7-day pass.",
    icon: "train",
  },
  {
    title: "Free Attractions",
    description: "Many temples, shrines, and parks are free to enter. Senso-ji, Meiji Shrine, Fushimi Inari, and Nara Park offer world-class experiences at no cost.",
    icon: "landmark",
  },
  {
    title: "Seasonal Pricing",
    description: "Avoid peak seasons (late March-early April for cherry blossoms, November for autumn leaves, year-end holidays) for cheaper flights and accommodation.",
    icon: "calendar",
  },
  {
    title: "Cash is King",
    description: "Japan is still largely cash-based. Withdraw yen from 7-Eleven ATMs which accept foreign cards with reasonable fees.",
    icon: "banknote",
  },
  {
    title: "Don's Don't Tip",
    description: "Tipping is not customary in Japan and can even be considered rude. Service is already included and excellent everywhere.",
    icon: "hand-coins",
  },
];

export const seasonalMultipliers = {
  regular: 1.0,
  cherryBlossom: 1.35,
  autumn: 1.25,
  yearEnd: 1.40,
};

export function getSeason(date: Date): "regular" | "cherryBlossom" | "autumn" | "yearEnd" {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 20) || (month === 4 && day <= 15)) {
    return "cherryBlossom";
  }
  if (month === 11 || (month === 10 && day >= 20)) {
    return "autumn";
  }
  if (month === 12 && day >= 20) {
    return "yearEnd";
  }
  if (month === 1 && day <= 7) {
    return "yearEnd";
  }
  return "regular";
}

export function formatCurrency(amount: number, currency: "SGD" | "JPY" = "SGD"): string {
  if (currency === "SGD") {
    return `S$${amount.toLocaleString("en-SG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function convertToJPY(sgd: number, rate: number = DEFAULT_EXCHANGE_RATE): number {
  return Math.round(sgd / rate);
}
