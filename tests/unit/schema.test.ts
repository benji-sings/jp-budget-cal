import { describe, it, expect } from 'vitest';
import {
  tripConfigSchema,
  flightConfigSchema,
  accommodationConfigSchema,
  transportConfigSchema,
  insertNewsletterSubscriberSchema,
  insertChatMessageSchema,
  cities,
  travelStyles,
  airlineTypes,
  accommodationTypes,
} from '../../shared/schema';

describe('tripConfigSchema', () => {
  it('validates a valid trip configuration', () => {
    const validConfig = {
      departureDate: '2025-04-01',
      returnDate: '2025-04-10',
      travelers: 2,
      cities: ['Tokyo', 'Kyoto'],
      travelStyle: 'midrange',
    };
    
    const result = tripConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('rejects invalid number of travelers', () => {
    const invalidConfig = {
      departureDate: '2025-04-01',
      returnDate: '2025-04-10',
      travelers: 0,
      cities: ['Tokyo'],
      travelStyle: 'midrange',
    };
    
    const result = tripConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('rejects empty cities array', () => {
    const invalidConfig = {
      departureDate: '2025-04-01',
      returnDate: '2025-04-10',
      travelers: 2,
      cities: [],
      travelStyle: 'midrange',
    };
    
    const result = tripConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('rejects invalid travel style', () => {
    const invalidConfig = {
      departureDate: '2025-04-01',
      returnDate: '2025-04-10',
      travelers: 2,
      cities: ['Tokyo'],
      travelStyle: 'super-luxury',
    };
    
    const result = tripConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});

describe('flightConfigSchema', () => {
  it('validates valid flight configuration', () => {
    const validConfig = {
      destinationCity: 'Tokyo',
      airlineType: 'budget',
    };
    
    const result = flightConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('rejects invalid airline type', () => {
    const invalidConfig = {
      destinationCity: 'Tokyo',
      airlineType: 'premium',
    };
    
    const result = flightConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});

describe('accommodationConfigSchema', () => {
  it('validates valid accommodation configuration', () => {
    const validConfig = {
      type: 'businessHotel',
      city: 'Osaka',
    };
    
    const result = accommodationConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('validates hostel accommodation', () => {
    const validConfig = {
      type: 'hostel',
      city: 'Tokyo',
    };
    
    const result = accommodationConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });
});

describe('transportConfigSchema', () => {
  it('validates valid transport configuration', () => {
    const validConfig = {
      jrPass: '7day',
      icCardBudget: 20,
      airportTransfer: 'nex',
    };
    
    const result = transportConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('rejects negative IC card budget', () => {
    const invalidConfig = {
      jrPass: '7day',
      icCardBudget: -10,
      airportTransfer: 'nex',
    };
    
    const result = transportConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});

describe('insertNewsletterSubscriberSchema', () => {
  it('validates valid email', () => {
    const result = insertNewsletterSubscriberSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('requires email field', () => {
    const result = insertNewsletterSubscriberSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('insertChatMessageSchema', () => {
  it('validates valid chat message', () => {
    const validMessage = {
      sessionId: 'session-123',
      role: 'user',
      content: 'What are some things to do in Tokyo?',
    };
    
    const result = insertChatMessageSchema.safeParse(validMessage);
    expect(result.success).toBe(true);
  });

  it('validates assistant role', () => {
    const validMessage = {
      sessionId: 'session-123',
      role: 'assistant',
      content: 'Here are some recommendations...',
    };
    
    const result = insertChatMessageSchema.safeParse(validMessage);
    expect(result.success).toBe(true);
  });
});

describe('constants', () => {
  it('has valid cities list', () => {
    expect(cities).toContain('Tokyo');
    expect(cities).toContain('Osaka');
    expect(cities).toContain('Kyoto');
    expect(cities.length).toBeGreaterThan(5);
  });

  it('has valid travel styles', () => {
    expect(travelStyles).toContain('budget');
    expect(travelStyles).toContain('midrange');
    expect(travelStyles).toContain('luxury');
  });

  it('has valid airline types', () => {
    expect(airlineTypes).toContain('budget');
    expect(airlineTypes).toContain('fullService');
  });

  it('has valid accommodation types', () => {
    expect(accommodationTypes).toContain('hostel');
    expect(accommodationTypes).toContain('businessHotel');
    expect(accommodationTypes.length).toBeGreaterThanOrEqual(2);
  });
});
