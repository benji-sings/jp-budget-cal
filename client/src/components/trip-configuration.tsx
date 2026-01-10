import { useState, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, Minus, Plus, MapPin, Plane } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { City, TravelStyle } from "@shared/schema";
import { cities } from "@shared/schema";
import { getFlightRoute } from "@/lib/pricing-data";
import tokyoImage from "@assets/clay-banks-hwLAI5lRhdM-unsplash_1767887041996.jpg";
import osakaImage from "@assets/miram-oh-mYIgb7zl70M-unsplash_1767887171577.jpg";
import kyotoImage from "@assets/daisy-chen-J4H50uMTw3M-unsplash_1767887247671.jpg";
import hokkaidoImage from "@assets/backpacker-deogyusan-mountains-winter_1767887365106.jpg";
import fukuokaImage from "@assets/yux-xiang-bAsOgzNy3XM-unsplash_1767887662533.jpg";
import okinawaImage from "@assets/romeo-a-uvNQOFjqjns-unsplash_1767887767123.jpg";
import hiroshimaImage from "@assets/juliana-barquero-GptJ5L7niVk-unsplash_1767887831046.jpg";
import yokohamaImage from "@assets/finn-u1nFAZS_wcs-unsplash_1767887921215.jpg";
import nagoyaImage from "@assets/tim-d-XL7BJV4zWhg-unsplash_1767888053492.jpg";
import naraImage from "@assets/timo-volz-tEOhkLuqmUI-unsplash_1767888427864.jpg";

interface TripConfigurationProps {
  departureDate: Date | undefined;
  returnDate: Date | undefined;
  travelers: number;
  selectedCities: City[];
  travelStyle: TravelStyle;
  onDepartureDateChange: (date: Date | undefined) => void;
  onReturnDateChange: (date: Date | undefined) => void;
  onTravelersChange: (count: number) => void;
  onCitiesChange: (cities: City[]) => void;
  onTravelStyleChange: (style: TravelStyle) => void;
}

const travelStyleOptions: { value: TravelStyle; label: string; description: string }[] = [
  { value: "budget", label: "Budget", description: "Hostels, konbini meals" },
  { value: "midrange", label: "Mid-range", description: "Business hotels, izakaya" },
  { value: "luxury", label: "Luxury", description: "Ryokans, fine dining" },
];

const cityInfo: Record<City, { image: string }> = {
  Tokyo: { image: tokyoImage },
  Osaka: { image: osakaImage },
  Kyoto: { image: kyotoImage },
  Hokkaido: { image: hokkaidoImage },
  Fukuoka: { image: fukuokaImage },
  Okinawa: { image: okinawaImage },
  Nagoya: { image: nagoyaImage },
  Hiroshima: { image: hiroshimaImage },
  Nara: { image: naraImage },
  Yokohama: { image: yokohamaImage },
};

export const TripConfiguration = memo(function TripConfiguration({
  departureDate,
  returnDate,
  travelers,
  selectedCities,
  travelStyle,
  onDepartureDateChange,
  onReturnDateChange,
  onTravelersChange,
  onCitiesChange,
  onTravelStyleChange,
}: TripConfigurationProps) {
  const duration = departureDate && returnDate ? differenceInDays(returnDate, departureDate) : 0;

  const toggleCity = (city: City) => {
    if (selectedCities.includes(city)) {
      onCitiesChange(selectedCities.filter((c) => c !== city));
    } else {
      onCitiesChange([...selectedCities, city]);
    }
  };

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <MapPin className="h-5 w-5 text-primary" />
          Trip Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departure" className="text-sm font-medium">Departure Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="departure"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !departureDate && "text-muted-foreground"
                  )}
                  data-testid="button-departure-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={onDepartureDateChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="return" className="text-sm font-medium">Return Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="return"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !returnDate && "text-muted-foreground"
                  )}
                  data-testid="button-return-date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={onReturnDateChange}
                  disabled={(date) => !departureDate || date <= departureDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {duration > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm" data-testid="badge-duration-nights">
              {duration} {duration === 1 ? "night" : "nights"}
            </Badge>
            <span className="text-sm text-muted-foreground" data-testid="text-duration-days">
              ({duration + 1} days)
            </span>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Number of Travelers</Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
              disabled={travelers <= 1}
              data-testid="button-decrease-travelers"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-[80px] justify-center">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-semibold tabular-nums" data-testid="text-travelers-count">
                {travelers}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onTravelersChange(Math.min(20, travelers + 1))}
              disabled={travelers >= 20}
              data-testid="button-increase-travelers"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Destination Cities</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                className={cn(
                  "relative rounded-md overflow-visible transition-all p-0 border-2",
                  selectedCities.includes(city)
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover-elevate"
                )}
                data-testid={`button-city-${city.toLowerCase()}`}
              >
                <div className="aspect-square w-full overflow-hidden rounded-md">
                  <img
                    src={cityInfo[city].image}
                    alt={city}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={160}
                    height={160}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-md" />
                  <span className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium text-center truncate">
                    {city}
                  </span>
                </div>
                {selectedCities.includes(city) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {selectedCities.indexOf(city) + 1}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {selectedCities.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-primary" data-testid="text-flight-route">
                <Plane className="h-4 w-4" />
                {getFlightRoute(selectedCities[0])}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-selected-cities">
                Route: {selectedCities.join(" → ")}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Travel Style</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {travelStyleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTravelStyleChange(option.value)}
                className={cn(
                  "p-4 rounded-md text-left transition-all border",
                  travelStyle === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                )}
                data-testid={`button-style-${option.value}`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
