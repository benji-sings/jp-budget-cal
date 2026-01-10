import { describe, it, expect } from 'vitest';
import {
  jrPassPrices,
  airportTransferPrices,
  accommodationPrices,
} from '../../client/src/lib/pricing-data';

const POCKET_WIFI_DAILY = 8;
const ESIM_COST = 25;
const TOURIST_SIM_COST = 35;
const EMERGENCY_FUND_PER_PERSON = 100;

describe('Connectivity Cost Calculations', () => {
  const getConnectivityCost = (type: string, duration: number) => {
    switch (type) {
      case "pocket-wifi":
        return POCKET_WIFI_DAILY * duration;
      case "esim":
        return ESIM_COST;
      case "tourist-sim":
        return TOURIST_SIM_COST;
      default:
        return 0;
    }
  };

  it('calculates pocket wifi cost correctly', () => {
    expect(getConnectivityCost('pocket-wifi', 7)).toBe(56);
    expect(getConnectivityCost('pocket-wifi', 14)).toBe(112);
    expect(getConnectivityCost('pocket-wifi', 1)).toBe(8);
  });

  it('returns fixed cost for eSIM', () => {
    expect(getConnectivityCost('esim', 7)).toBe(25);
    expect(getConnectivityCost('esim', 14)).toBe(25);
    expect(getConnectivityCost('esim', 30)).toBe(25);
  });

  it('returns fixed cost for tourist SIM', () => {
    expect(getConnectivityCost('tourist-sim', 7)).toBe(35);
    expect(getConnectivityCost('tourist-sim', 14)).toBe(35);
  });

  it('returns 0 for no connectivity', () => {
    expect(getConnectivityCost('none', 7)).toBe(0);
    expect(getConnectivityCost('', 7)).toBe(0);
  });
});

describe('Emergency Fund Calculation', () => {
  it('calculates emergency fund per person correctly', () => {
    expect(EMERGENCY_FUND_PER_PERSON).toBe(100);
    expect(EMERGENCY_FUND_PER_PERSON * 1).toBe(100);
    expect(EMERGENCY_FUND_PER_PERSON * 2).toBe(200);
    expect(EMERGENCY_FUND_PER_PERSON * 4).toBe(400);
  });
});

describe('Shopping/Misc Total Cost Calculation', () => {
  const calculateTotalCost = (
    shoppingBudget: number,
    travelers: number,
    connectivityType: string,
    duration: number
  ) => {
    const getConnectivityCost = (type: string) => {
      switch (type) {
        case "pocket-wifi":
          return POCKET_WIFI_DAILY * duration;
        case "esim":
          return ESIM_COST;
        case "tourist-sim":
          return TOURIST_SIM_COST;
        default:
          return 0;
      }
    };
    
    const connectivityCost = getConnectivityCost(connectivityType);
    const emergencyFund = EMERGENCY_FUND_PER_PERSON;
    return (shoppingBudget + emergencyFund) * travelers + connectivityCost;
  };

  it('calculates total cost for single traveler', () => {
    const result = calculateTotalCost(200, 1, 'esim', 7);
    expect(result).toBe((200 + 100) * 1 + 25);
    expect(result).toBe(325);
  });

  it('calculates total cost for multiple travelers', () => {
    const result = calculateTotalCost(200, 2, 'pocket-wifi', 7);
    expect(result).toBe((200 + 100) * 2 + 56);
    expect(result).toBe(656);
  });

  it('calculates total cost with no connectivity', () => {
    const result = calculateTotalCost(300, 2, 'none', 7);
    expect(result).toBe((300 + 100) * 2 + 0);
    expect(result).toBe(800);
  });
});

describe('Transport Cost Calculations', () => {
  it('calculates JR Pass costs correctly', () => {
    const travelers = 2;
    expect(jrPassPrices['7day'] * travelers).toBeGreaterThan(0);
    expect(jrPassPrices['14day'] * travelers).toBeGreaterThan(jrPassPrices['7day'] * travelers);
    expect(jrPassPrices['21day'] * travelers).toBeGreaterThan(jrPassPrices['14day'] * travelers);
    expect(jrPassPrices.none * travelers).toBe(0);
  });

  it('calculates airport transfer costs for round trip', () => {
    const travelers = 2;
    const nexCostRoundTrip = airportTransferPrices.nex * travelers * 2;
    const harukaCostRoundTrip = airportTransferPrices.haruka * travelers * 2;
    expect(nexCostRoundTrip).toBeGreaterThan(0);
    expect(harukaCostRoundTrip).toBeGreaterThan(0);
  });

  it('calculates IC card budget correctly', () => {
    const icCardBudget = 15;
    const duration = 7;
    const travelers = 2;
    const icCardTotal = icCardBudget * duration * travelers;
    expect(icCardTotal).toBe(210);
  });
});

describe('Accommodation Cost Calculations', () => {
  it('calculates rooms needed for hostels (1 per person)', () => {
    const calculateRoomsNeeded = (type: string, travelers: number) => {
      return type === "hostel" ? travelers : Math.ceil(travelers / 2);
    };
    
    expect(calculateRoomsNeeded('hostel', 1)).toBe(1);
    expect(calculateRoomsNeeded('hostel', 2)).toBe(2);
    expect(calculateRoomsNeeded('hostel', 4)).toBe(4);
  });

  it('calculates rooms needed for hotels (2 per room)', () => {
    const calculateRoomsNeeded = (type: string, travelers: number) => {
      return type === "hostel" ? travelers : Math.ceil(travelers / 2);
    };
    
    expect(calculateRoomsNeeded('businessHotel', 1)).toBe(1);
    expect(calculateRoomsNeeded('businessHotel', 2)).toBe(1);
    expect(calculateRoomsNeeded('businessHotel', 3)).toBe(2);
    expect(calculateRoomsNeeded('businessHotel', 4)).toBe(2);
  });

  it('calculates average rate for multiple cities', () => {
    const selectedCities = ['Tokyo', 'Osaka'] as const;
    const averageRate = selectedCities.reduce(
      (sum, city) => sum + accommodationPrices[city].businessHotel, 
      0
    ) / selectedCities.length;
    
    expect(averageRate).toBeGreaterThan(0);
    expect(averageRate).toBe(
      (accommodationPrices.Tokyo.businessHotel + accommodationPrices.Osaka.businessHotel) / 2
    );
  });

  it('calculates total accommodation cost correctly', () => {
    const nights = 7;
    const roomsNeeded = 1;
    const rate = 100;
    const totalCost = Math.round(rate * nights * roomsNeeded);
    expect(totalCost).toBe(700);
  });
});
