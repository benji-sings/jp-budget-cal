import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  flightPrices,
  accommodationPrices,
  jrPassPrices,
  airportTransferPrices,
  foodBudgets,
  activities,
  getSeason,
  seasonalMultipliers,
} from '../../client/src/lib/pricing-data';

describe('formatCurrency', () => {
  it('formats positive numbers with S$ prefix', () => {
    expect(formatCurrency(1000)).toBe('S$1,000');
    expect(formatCurrency(100)).toBe('S$100');
    expect(formatCurrency(1234567)).toBe('S$1,234,567');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('S$0');
  });

  it('formats decimal numbers by rounding', () => {
    expect(formatCurrency(99.99)).toBe('S$100');
    expect(formatCurrency(99.49)).toBe('S$99');
  });

  it('formats JPY currency correctly', () => {
    expect(formatCurrency(1000, 'JPY')).toContain('1,000');
    expect(formatCurrency(50000, 'JPY')).toContain('50,000');
  });

  it('handles small amounts', () => {
    expect(formatCurrency(1)).toBe('S$1');
    expect(formatCurrency(0.5)).toBe('S$1');
  });
});

describe('flightPrices', () => {
  it('has prices for all major cities', () => {
    const cities = ['Tokyo', 'Osaka', 'Fukuoka', 'Okinawa', 'Nagoya', 'Hiroshima'];
    cities.forEach(city => {
      expect(flightPrices[city as keyof typeof flightPrices]).toBeDefined();
      expect(flightPrices[city as keyof typeof flightPrices].budget).toBeGreaterThan(0);
      expect(flightPrices[city as keyof typeof flightPrices].fullService).toBeGreaterThan(0);
    });
  });

  it('full service flights cost more than budget', () => {
    Object.values(flightPrices).forEach(prices => {
      expect(prices.fullService).toBeGreaterThan(prices.budget);
    });
  });
});

describe('accommodationPrices', () => {
  it('has prices for all accommodation types', () => {
    const cities = ['Tokyo', 'Osaka', 'Kyoto'];
    cities.forEach(city => {
      const prices = accommodationPrices[city as keyof typeof accommodationPrices];
      expect(prices.hostel).toBeGreaterThan(0);
      expect(prices.businessHotel).toBeGreaterThan(0);
    });
  });

  it('business hotels cost more than hostels', () => {
    Object.values(accommodationPrices).forEach(prices => {
      expect(prices.businessHotel).toBeGreaterThan(prices.hostel);
    });
  });
});

describe('jrPassPrices', () => {
  it('has correct pass types', () => {
    expect(jrPassPrices.none).toBe(0);
    expect(jrPassPrices['7day']).toBeGreaterThan(0);
    expect(jrPassPrices['14day']).toBeGreaterThan(jrPassPrices['7day']);
    expect(jrPassPrices['21day']).toBeGreaterThan(jrPassPrices['14day']);
  });
});

describe('airportTransferPrices', () => {
  it('has all transfer options', () => {
    expect(airportTransferPrices.nex).toBeGreaterThan(0);
    expect(airportTransferPrices.haruka).toBeGreaterThan(0);
    expect(airportTransferPrices.limousineBus).toBeGreaterThan(0);
    expect(airportTransferPrices.regularTrain).toBeGreaterThan(0);
  });
});

describe('foodBudgets', () => {
  it('has tiers with valid ranges', () => {
    expect(foodBudgets.budget.min).toBeLessThan(foodBudgets.budget.max);
    expect(foodBudgets.midrange.min).toBeLessThan(foodBudgets.midrange.max);
    expect(foodBudgets.splurge.min).toBeLessThan(foodBudgets.splurge.max);
  });

  it('splurge tier costs more than budget tier', () => {
    expect(foodBudgets.splurge.average).toBeGreaterThan(foodBudgets.budget.average);
  });
});

describe('activities', () => {
  it('has activities with required properties', () => {
    activities.forEach(activity => {
      expect(activity.id).toBeDefined();
      expect(activity.name).toBeDefined();
      expect(activity.priceSGD).toBeGreaterThanOrEqual(0);
      expect(activity.city).toBeDefined();
      expect(activity.category).toBeDefined();
    });
  });

  it('has activities for multiple cities', () => {
    const cities = new Set(activities.map(a => a.city));
    expect(cities.size).toBeGreaterThan(1);
  });

  it('has activities with lat/lng coordinates', () => {
    const activitiesWithCoords = activities.filter(a => a.lat && a.lng);
    expect(activitiesWithCoords.length).toBeGreaterThan(0);
  });
});

describe('getSeason', () => {
  it('returns cherryBlossom for late March to mid April', () => {
    expect(getSeason(new Date('2025-03-25'))).toBe('cherryBlossom');
    expect(getSeason(new Date('2025-04-10'))).toBe('cherryBlossom');
  });

  it('returns regular at cherryBlossom boundaries', () => {
    expect(getSeason(new Date('2025-03-19'))).toBe('regular');
    expect(getSeason(new Date('2025-04-16'))).toBe('regular');
  });

  it('returns autumn for late October and November', () => {
    expect(getSeason(new Date('2025-10-25'))).toBe('autumn');
    expect(getSeason(new Date('2025-11-15'))).toBe('autumn');
    expect(getSeason(new Date('2025-11-30'))).toBe('autumn');
  });

  it('returns regular at autumn boundaries', () => {
    expect(getSeason(new Date('2025-10-19'))).toBe('regular');
  });

  it('returns yearEnd for late December', () => {
    expect(getSeason(new Date('2025-12-25'))).toBe('yearEnd');
    expect(getSeason(new Date('2025-12-31'))).toBe('yearEnd');
  });

  it('returns regular at yearEnd boundary', () => {
    expect(getSeason(new Date('2025-12-19'))).toBe('regular');
  });

  it('returns regular for other dates', () => {
    expect(getSeason(new Date('2025-06-15'))).toBe('regular');
    expect(getSeason(new Date('2025-02-15'))).toBe('regular');
    expect(getSeason(new Date('2025-01-15'))).toBe('regular');
    expect(getSeason(new Date('2025-05-15'))).toBe('regular');
    expect(getSeason(new Date('2025-09-15'))).toBe('regular');
  });
});

describe('seasonalMultipliers', () => {
  it('yearEnd and cherryBlossom have higher multipliers than regular', () => {
    expect(seasonalMultipliers.cherryBlossom).toBeGreaterThan(seasonalMultipliers.regular);
    expect(seasonalMultipliers.yearEnd).toBeGreaterThan(seasonalMultipliers.regular);
  });

  it('all multipliers are positive', () => {
    Object.values(seasonalMultipliers).forEach(multiplier => {
      expect(multiplier).toBeGreaterThan(0);
    });
  });
});
