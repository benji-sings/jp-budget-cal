import { db } from "./db";
import { 
  chatSessions, 
  chatMessages, 
  newsletterSubscribers, 
  budgetCalculations,
  pageViews,
  userEvents,
  type ChatSession, 
  type ChatMessage, 
  type InsertChatMessage, 
  type NewsletterSubscriber,
  type BudgetCalculation,
  type InsertBudgetCalculation,
  type PageView,
  type InsertPageView,
  type UserEvent,
  type InsertUserEvent,
} from "@shared/schema";
import { eq, desc, sql, gte, count } from "drizzle-orm";

export interface IStorage {
  getOrCreateSession(sessionId: string): Promise<ChatSession>;
  getSessionMessages(sessionId: string): Promise<ChatMessage[]>;
  saveMessage(message: InsertChatMessage): Promise<ChatMessage>;
  subscribeNewsletter(email: string): Promise<NewsletterSubscriber>;
  trackBudgetCalculation(data: InsertBudgetCalculation): Promise<BudgetCalculation>;
  trackPageView(data: InsertPageView): Promise<PageView>;
  trackUserEvent(data: InsertUserEvent): Promise<UserEvent>;
  getAnalyticsSummary(days: number): Promise<AnalyticsSummary>;
}

export interface AnalyticsSummary {
  totalBudgetCalculations: number;
  totalPageViews: number;
  totalUserEvents: number;
  totalNewsletterSubscribers: number;
  totalChatSessions: number;
  popularCities: { city: string; count: number }[];
  popularTravelStyles: { style: string; count: number }[];
  averageBudget: number;
  averageTravelers: number;
  recentCalculations: BudgetCalculation[];
}

export class DatabaseStorage implements IStorage {
  async getOrCreateSession(sessionId: string): Promise<ChatSession> {
    const existing = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId)).limit(1);
    
    if (existing.length > 0) {
      await db.update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.sessionId, sessionId));
      return existing[0];
    }

    const [newSession] = await db.insert(chatSessions)
      .values({ sessionId })
      .returning();
    
    return newSession;
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    return db.select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async saveMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [saved] = await db.insert(chatMessages)
      .values(message)
      .returning();
    return saved;
  }

  async subscribeNewsletter(email: string): Promise<NewsletterSubscriber> {
    const [subscriber] = await db.insert(newsletterSubscribers)
      .values({ email })
      .onConflictDoNothing()
      .returning();
    
    if (!subscriber) {
      const [existing] = await db.select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, email))
        .limit(1);
      return existing;
    }
    return subscriber;
  }

  async trackBudgetCalculation(data: InsertBudgetCalculation): Promise<BudgetCalculation> {
    const [result] = await db.insert(budgetCalculations)
      .values(data)
      .returning();
    return result;
  }

  async trackPageView(data: InsertPageView): Promise<PageView> {
    const [result] = await db.insert(pageViews)
      .values(data)
      .returning();
    return result;
  }

  async trackUserEvent(data: InsertUserEvent): Promise<UserEvent> {
    const [result] = await db.insert(userEvents)
      .values(data)
      .returning();
    return result;
  }

  async getAnalyticsSummary(days: number): Promise<AnalyticsSummary> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [budgetCount] = await db.select({ count: count() })
      .from(budgetCalculations)
      .where(gte(budgetCalculations.createdAt, startDate));

    const [pageViewCount] = await db.select({ count: count() })
      .from(pageViews)
      .where(gte(pageViews.createdAt, startDate));

    const [eventCount] = await db.select({ count: count() })
      .from(userEvents)
      .where(gte(userEvents.createdAt, startDate));

    const [subscriberCount] = await db.select({ count: count() })
      .from(newsletterSubscribers);

    const [sessionCount] = await db.select({ count: count() })
      .from(chatSessions);

    const startDateStr = startDate.toISOString();
    
    const cityStats = await db.execute(sql`
      SELECT unnest(cities) as city, COUNT(*) as count 
      FROM budget_calculations 
      WHERE created_at >= ${startDateStr}::timestamp
      GROUP BY city 
      ORDER BY count DESC 
      LIMIT 10
    `);

    const styleStats = await db.execute(sql`
      SELECT travel_style as style, COUNT(*) as count 
      FROM budget_calculations 
      WHERE created_at >= ${startDateStr}::timestamp
      GROUP BY travel_style 
      ORDER BY count DESC
    `);

    const avgStats = await db.execute(sql`
      SELECT 
        COALESCE(AVG(total_budget_sgd::numeric), 0) as avg_budget,
        COALESCE(AVG(travelers), 0) as avg_travelers
      FROM budget_calculations 
      WHERE created_at >= ${startDateStr}::timestamp
    `);

    const recentCalcs = await db.select()
      .from(budgetCalculations)
      .orderBy(desc(budgetCalculations.createdAt))
      .limit(10);

    const cityRows = Array.isArray(cityStats) ? cityStats : [];
    const styleRows = Array.isArray(styleStats) ? styleStats : [];
    const avgRows = Array.isArray(avgStats) ? avgStats : [];

    return {
      totalBudgetCalculations: budgetCount?.count || 0,
      totalPageViews: pageViewCount?.count || 0,
      totalUserEvents: eventCount?.count || 0,
      totalNewsletterSubscribers: subscriberCount?.count || 0,
      totalChatSessions: sessionCount?.count || 0,
      popularCities: cityRows.map((row: any) => ({ 
        city: row.city, 
        count: Number(row.count) 
      })),
      popularTravelStyles: styleRows.map((row: any) => ({ 
        style: row.style, 
        count: Number(row.count) 
      })),
      averageBudget: Number(avgRows[0]?.avg_budget || 0),
      averageTravelers: Number(avgRows[0]?.avg_travelers || 0),
      recentCalculations: recentCalcs,
    };
  }
}

export const storage = new DatabaseStorage();
