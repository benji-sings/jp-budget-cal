import { z } from "zod";
import { pgTable, serial, text, timestamp, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgetCalculations = pgTable("budget_calculations", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  departureDate: text("departure_date"),
  returnDate: text("return_date"),
  travelers: integer("travelers").notNull(),
  cities: text("cities").array().notNull(),
  travelStyle: text("travel_style").notNull(),
  totalBudgetSgd: decimal("total_budget_sgd", { precision: 10, scale: 2 }).notNull(),
  perPersonSgd: decimal("per_person_sgd", { precision: 10, scale: 2 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).notNull(),
  breakdown: jsonb("breakdown").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  pagePath: text("page_path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userEvents = pgTable("user_events", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  eventType: text("event_type").notNull(),
  eventCategory: text("event_category").notNull(),
  eventData: jsonb("event_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetCalculationSchema = createInsertSchema(budgetCalculations).omit({ id: true, createdAt: true });
export const insertPageViewSchema = createInsertSchema(pageViews).omit({ id: true, createdAt: true });
export const insertUserEventSchema = createInsertSchema(userEvents).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, createdAt: true });

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type BudgetCalculation = typeof budgetCalculations.$inferSelect;
export type InsertBudgetCalculation = z.infer<typeof insertBudgetCalculationSchema>;
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type UserEvent = typeof userEvents.$inferSelect;
export type InsertUserEvent = z.infer<typeof insertUserEventSchema>;

export const cities = [
  "Tokyo",
  "Osaka",
  "Kyoto",
  "Hokkaido",
  "Fukuoka",
  "Okinawa",
  "Nagoya",
  "Hiroshima",
  "Nara",
  "Yokohama",
] as const;

export type City = (typeof cities)[number];

export const travelStyles = ["budget", "midrange", "luxury"] as const;
export type TravelStyle = (typeof travelStyles)[number];

export const airlineTypes = ["budget", "fullService"] as const;
export type AirlineType = (typeof airlineTypes)[number];

export const accommodationTypes = [
  "hostel",
  "businessHotel",
  "midrange",
  "luxury",
] as const;
export type AccommodationType = (typeof accommodationTypes)[number];

export const jrPassTypes = ["none", "7day", "14day", "21day"] as const;
export type JRPassType = (typeof jrPassTypes)[number];

export const foodTiers = ["budget", "midrange", "splurge"] as const;
export type FoodTier = (typeof foodTiers)[number];

export const seasons = ["regular", "cherryBlossom", "autumn", "yearEnd"] as const;
export type Season = (typeof seasons)[number];

export const tripConfigSchema = z.object({
  departureDate: z.string(),
  returnDate: z.string(),
  travelers: z.number().min(1).max(20),
  cities: z.array(z.enum(cities)).min(1),
  travelStyle: z.enum(travelStyles),
});

export type TripConfig = z.infer<typeof tripConfigSchema>;

export const flightConfigSchema = z.object({
  airlineType: z.enum(airlineTypes),
  destinationCity: z.enum(cities),
});

export type FlightConfig = z.infer<typeof flightConfigSchema>;

export const accommodationConfigSchema = z.object({
  type: z.enum(accommodationTypes),
  city: z.enum(cities),
});

export type AccommodationConfig = z.infer<typeof accommodationConfigSchema>;

export const transportConfigSchema = z.object({
  jrPass: z.enum(jrPassTypes),
  icCardBudget: z.number().min(0),
  airportTransfer: z.enum(["nex", "haruka", "limousineBus", "regularTrain"]),
});

export type TransportConfig = z.infer<typeof transportConfigSchema>;

export const foodConfigSchema = z.object({
  tier: z.enum(foodTiers),
  dailyBudget: z.number().min(0),
});

export type FoodConfig = z.infer<typeof foodConfigSchema>;

export interface Activity {
  id: string;
  name: string;
  city: City;
  priceJPY: number;
  priceSGD: number;
  category: "theme_park" | "museum" | "temple" | "experience" | "day_trip";
  seasonal?: boolean;
  lat?: number;
  lng?: number;
}

export interface CostBreakdown {
  flights: number;
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  shopping: number;
  misc: number;
  total: number;
  perPerson: number;
  dailyAverage: number;
}

export interface ExchangeRate {
  rate: number;
  lastUpdated: string;
}

export interface PricingData {
  flights: Record<City, { budget: number; fullService: number }>;
  accommodation: Record<City, Record<AccommodationType, number>>;
  jrPass: Record<JRPassType, number>;
  airportTransfers: Record<string, number>;
  activities: Activity[];
}

export interface TripSummary {
  config: TripConfig;
  breakdown: CostBreakdown;
  duration: number;
  exchangeRate: number;
}

export interface MoneyTip {
  title: string;
  description: string;
  icon: string;
}

export interface CityRecommendation {
  city: City;
  foods: string[];
  spots: string[];
}
