import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { HeroSection } from "@/components/hero-section";
import { TripConfiguration } from "@/components/trip-configuration";
import { FlightCalculator } from "@/components/flight-calculator";
import { AccommodationCalculator } from "@/components/accommodation-calculator";
import { TransportCalculator } from "@/components/transport-calculator";
import { FoodCalculator } from "@/components/food-calculator";
import { ActivitiesCalculator } from "@/components/activities-calculator";
import { ShoppingMiscCalculator } from "@/components/shopping-misc-calculator";
import { BudgetBreakdown } from "@/components/budget-breakdown";
import { NewsletterSubscription } from "@/components/newsletter-subscription";
import { TipsSection } from "@/components/tips-section";
import { Footer } from "@/components/footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

import { MapPin } from "lucide-react";
import type { City, TravelStyle, AirlineType, AccommodationType, JRPassType, FoodTier, CostBreakdown } from "@shared/schema";
import {
  DEFAULT_EXCHANGE_RATE,
  flightPrices,
  accommodationPrices,
  jrPassPrices,
  airportTransferPrices,
  carRentalPrices,
  foodBudgets,
  activities,
  getSeason,
  seasonalMultipliers,
  type CarRentalCompany,
} from "@/lib/pricing-data";

const WeatherForecast = lazy(() => import("@/components/weather-forecast").then(m => ({ default: m.WeatherForecast })));
const BeginnerGuide = lazy(() => import("@/components/beginner-guide").then(m => ({ default: m.BeginnerGuide })));
const Chatbot = lazy(() => import("@/components/chatbot").then(m => ({ default: m.Chatbot })));

function ComponentLoader() {
  return <div className="animate-pulse h-32 bg-muted/50 rounded-lg" />;
}

const POCKET_WIFI_DAILY = 8;

export default function Home() {
  const { toast } = useToast();
  const calculatorRef = useRef<HTMLDivElement>(null);

  const { data: exchangeData } = useQuery<{ rate: number; lastUpdated: string }>({
    queryKey: ["/api/exchange-rate"],
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const exchangeRate = exchangeData?.rate ?? DEFAULT_EXCHANGE_RATE;

  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [travelers, setTravelers] = useState(2);
  const [selectedCities, setSelectedCities] = useState<City[]>(["Tokyo"]);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("midrange");

  const [destinationCity, setDestinationCity] = useState<City>("Tokyo");
  const [airlineType, setAirlineType] = useState<AirlineType>("budget");

  const [accommodationType, setAccommodationType] = useState<AccommodationType>("businessHotel");

  const [jrPass, setJrPass] = useState<JRPassType>("none");
  const [icCardBudget, setIcCardBudget] = useState(15);
  const [airportTransfer, setAirportTransfer] = useState<"nex" | "haruka" | "limousineBus" | "regularTrain">("limousineBus");
  const [carRental, setCarRental] = useState<CarRentalCompany>("none");
  const [carRentalDays, setCarRentalDays] = useState(3);

  const [foodTier, setFoodTier] = useState<FoodTier>("midrange");
  const [dailyFoodBudget, setDailyFoodBudget] = useState(foodBudgets.midrange.average);

  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const [shoppingBudget, setShoppingBudget] = useState(200);
  const [connectivityType, setConnectivityType] = useState<"none" | "pocket-wifi" | "esim" | "tourist-sim">("esim");

  const duration = useMemo(() => {
    if (!departureDate || !returnDate) return 7;
    return Math.max(1, differenceInDays(returnDate, departureDate));
  }, [departureDate, returnDate]);

  const seasonMultiplier = useMemo(() => {
    if (!departureDate) return 1;
    const season = getSeason(departureDate);
    return seasonalMultipliers[season];
  }, [departureDate]);

  useEffect(() => {
    if (travelStyle === "budget") {
      setAirlineType("budget");
      setAccommodationType("hostel");
      setFoodTier("budget");
      setDailyFoodBudget(foodBudgets.budget.average);
    } else if (travelStyle === "midrange") {
      setAirlineType("budget");
      setAccommodationType("businessHotel");
      setFoodTier("midrange");
      setDailyFoodBudget(foodBudgets.midrange.average);
    } else {
      setAirlineType("fullService");
      setAccommodationType("luxury");
      setFoodTier("splurge");
      setDailyFoodBudget(foodBudgets.splurge.average);
    }
  }, [travelStyle]);

  useEffect(() => {
    if (selectedCities.length > 0 && !selectedCities.includes(destinationCity)) {
      setDestinationCity(selectedCities[0]);
    }
  }, [selectedCities, destinationCity]);

  const breakdown = useMemo<CostBreakdown>(() => {
    const flightCost = Math.round(flightPrices[destinationCity][airlineType] * travelers * seasonMultiplier);

    const avgAccommodationRate =
      selectedCities.length > 0
        ? selectedCities.reduce((sum, city) => sum + accommodationPrices[city][accommodationType], 0) /
          selectedCities.length
        : 0;
    const roomsNeeded = accommodationType === "hostel" ? travelers : Math.ceil(travelers / 2);
    const accommodationCost = Math.round(avgAccommodationRate * duration * roomsNeeded * seasonMultiplier);

    const jrPassCost = jrPassPrices[jrPass] * travelers;
    const icCardCost = icCardBudget * duration * travelers;
    const airportCost = airportTransferPrices[airportTransfer] * travelers * 2;
    const carCost = carRental && carRentalPrices[carRental] ? carRentalPrices[carRental].dailyRate * carRentalDays : 0;
    const transportCost = jrPassCost + icCardCost + airportCost + carCost;

    const foodCost = dailyFoodBudget * duration * travelers;

    const activitiesCost = selectedActivities.reduce((sum, id) => {
      const activity = activities.find((a) => a.id === id);
      return sum + (activity?.priceSGD || 0) * travelers;
    }, 0);

    const getConnectivityCost = () => {
      const ESIM_COST = 25;
      const TOURIST_SIM_COST = 30;
      switch (connectivityType) {
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
    const connectivityCost = getConnectivityCost();
    const emergencyFund = Math.round(shoppingBudget * 0.1);
    const shoppingCost = (shoppingBudget + emergencyFund) * travelers + connectivityCost;

    const total = flightCost + accommodationCost + transportCost + foodCost + activitiesCost + shoppingCost;
    const perPerson = travelers > 0 ? Math.round(total / travelers) : 0;
    const dailyAverage = duration > 0 ? Math.round(total / duration) : 0;

    return {
      flights: flightCost,
      accommodation: accommodationCost,
      transportation: transportCost,
      food: foodCost,
      activities: activitiesCost,
      shopping: shoppingCost,
      misc: 0,
      total,
      perPerson,
      dailyAverage,
    };
  }, [
    destinationCity,
    airlineType,
    travelers,
    selectedCities,
    accommodationType,
    duration,
    jrPass,
    icCardBudget,
    airportTransfer,
    carRental,
    carRentalDays,
    dailyFoodBudget,
    selectedActivities,
    shoppingBudget,
    connectivityType,
    seasonMultiplier,
  ]);

  const scrollToCalculator = () => {
    calculatorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleExport = () => {
    const travelStyleLabel = travelStyle === "budget" ? "Budget" : travelStyle === "midrange" ? "Mid-Range" : "Luxury";
    const dateStr = departureDate ? departureDate.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }) : "Not set";
    const returnDateStr = returnDate ? returnDate.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" }) : "Not set";
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Japan Trip Budget - ${selectedCities.join(" → ")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; min-height: 100vh; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .route { background: rgba(255,255,255,0.2); border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 18px; font-weight: 600; }
    .content { padding: 32px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 12px; font-weight: 600; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item { background: #f8f9fa; border-radius: 8px; padding: 12px; }
    .info-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 16px; font-weight: 600; color: #333; margin-top: 4px; }
    .breakdown { background: #f8f9fa; border-radius: 12px; padding: 20px; }
    .breakdown-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .breakdown-item:last-child { border-bottom: none; }
    .breakdown-label { color: #555; }
    .breakdown-value { font-weight: 600; color: #333; }
    .total-section { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; border-radius: 12px; padding: 24px; margin-top: 24px; }
    .total-main { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.3); }
    .total-label { font-size: 18px; }
    .total-value { font-size: 32px; font-weight: 700; }
    .total-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .total-detail { text-align: center; }
    .total-detail-label { font-size: 11px; opacity: 0.8; text-transform: uppercase; }
    .total-detail-value { font-size: 18px; font-weight: 600; margin-top: 4px; }
    .footer { text-align: center; padding: 24px; background: #f8f9fa; color: #888; font-size: 12px; }
    .footer strong { color: #2d5a87; }
    .exchange { background: #fff3cd; border-radius: 8px; padding: 12px; text-align: center; margin-top: 16px; font-size: 14px; color: #856404; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Japan Trip Budget</h1>
      <p>Your personalized travel cost estimate</p>
      <div class="route">Singapore → ${selectedCities.join(" → ")}</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Trip Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Duration</div>
            <div class="info-value">${duration} nights</div>
          </div>
          <div class="info-item">
            <div class="info-label">Travelers</div>
            <div class="info-value">${travelers} ${travelers === 1 ? "person" : "people"}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Departure</div>
            <div class="info-value">${dateStr}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Return</div>
            <div class="info-value">${returnDateStr}</div>
          </div>
          <div class="info-item" style="grid-column: span 2;">
            <div class="info-label">Travel Style</div>
            <div class="info-value">${travelStyleLabel}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Cost Breakdown (SGD)</div>
        <div class="breakdown">
          <div class="breakdown-item">
            <span class="breakdown-label">Flights</span>
            <span class="breakdown-value">S$${breakdown.flights.toLocaleString()}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Accommodation</span>
            <span class="breakdown-value">S$${breakdown.accommodation.toLocaleString()}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Transportation</span>
            <span class="breakdown-value">S$${breakdown.transportation.toLocaleString()}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Food & Dining</span>
            <span class="breakdown-value">S$${breakdown.food.toLocaleString()}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Activities</span>
            <span class="breakdown-value">S$${breakdown.activities.toLocaleString()}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Shopping & Misc</span>
            <span class="breakdown-value">S$${breakdown.shopping.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div class="total-section">
        <div class="total-main">
          <span class="total-label">Total Estimated Cost</span>
          <span class="total-value">S$${breakdown.total.toLocaleString()}</span>
        </div>
        <div class="total-details">
          <div class="total-detail">
            <div class="total-detail-label">Per Person</div>
            <div class="total-detail-value">S$${breakdown.perPerson.toLocaleString()}</div>
          </div>
          <div class="total-detail">
            <div class="total-detail-label">Daily Average</div>
            <div class="total-detail-value">S$${breakdown.dailyAverage.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      <div class="exchange">
        Exchange Rate: 1 SGD = ¥${Math.round(1 / exchangeRate).toLocaleString()}
      </div>
    </div>
    
    <div class="footer">
      Generated by <strong>Japan Travel Budget Calculator</strong><br>
      Made for Singaporeans, by Singaporeans
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    toast({
      title: "Budget exported!",
      description: "Your trip summary has been opened in a new tab.",
      duration: 5000,
    });
  };

  const handleShare = async () => {
    const shareText = `Planning a ${duration}-day Japan trip! Total budget: S$${breakdown.total.toLocaleString()} (S$${breakdown.perPerson.toLocaleString()}/person). Visiting: ${selectedCities.join(", ")}.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Japan Trip Budget",
          text: shareText,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Share your trip budget with friends.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" data-testid="header-logo">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">Travel to Japan</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm tabular-nums" data-testid="badge-exchange-rate">
              1 SGD = ¥{Math.round(1 / exchangeRate).toLocaleString()}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <HeroSection 
        exchangeRate={exchangeRate} 
        onStartPlanning={scrollToCalculator} 
        selectedCity={selectedCities.length > 0 ? selectedCities[0] : undefined}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 py-8">
        <div ref={calculatorRef} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <TripConfiguration
              departureDate={departureDate}
              returnDate={returnDate}
              travelers={travelers}
              selectedCities={selectedCities}
              travelStyle={travelStyle}
              onDepartureDateChange={setDepartureDate}
              onReturnDateChange={setReturnDate}
              onTravelersChange={setTravelers}
              onCitiesChange={setSelectedCities}
              onTravelStyleChange={setTravelStyle}
            />

            <FlightCalculator
              destinationCity={destinationCity}
              airlineType={airlineType}
              travelers={travelers}
              onDestinationChange={setDestinationCity}
              onAirlineTypeChange={setAirlineType}
            />

            <AccommodationCalculator
              selectedCities={selectedCities}
              accommodationType={accommodationType}
              nights={duration}
              travelers={travelers}
              onTypeChange={setAccommodationType}
            />

            <TransportCalculator
              jrPass={jrPass}
              icCardBudget={icCardBudget}
              airportTransfer={airportTransfer}
              carRental={carRental}
              carRentalDays={carRentalDays}
              travelers={travelers}
              duration={duration}
              onJRPassChange={setJrPass}
              onICCardBudgetChange={setIcCardBudget}
              onAirportTransferChange={setAirportTransfer}
              onCarRentalChange={setCarRental}
              onCarRentalDaysChange={setCarRentalDays}
            />

            <FoodCalculator
              foodTier={foodTier}
              dailyBudget={dailyFoodBudget}
              duration={duration}
              travelers={travelers}
              onTierChange={setFoodTier}
              onBudgetChange={setDailyFoodBudget}
            />

            <ActivitiesCalculator
              selectedCities={selectedCities}
              selectedActivities={selectedActivities}
              travelers={travelers}
              onActivitiesChange={setSelectedActivities}
            />

            <ShoppingMiscCalculator
              shoppingBudget={shoppingBudget}
              connectivityType={connectivityType}
              duration={duration}
              travelers={travelers}
              onShoppingBudgetChange={setShoppingBudget}
              onConnectivityChange={setConnectivityType}
            />

            
            {selectedCities.length > 0 && (
              <Suspense fallback={<ComponentLoader />}>
                <WeatherForecast 
                  city={selectedCities[0]} 
                  departureDate={departureDate}
                  returnDate={returnDate}
                />
              </Suspense>
            )}

            <Suspense fallback={<ComponentLoader />}>
              <BeginnerGuide />
            </Suspense>

            <TipsSection selectedCities={selectedCities} />
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-4 space-y-6">
              <BudgetBreakdown
                breakdown={breakdown}
                duration={duration}
                travelers={travelers}
                exchangeRate={exchangeRate}
                onExport={handleExport}
                onShare={handleShare}
              />
              <NewsletterSubscription />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </div>
  );
}
