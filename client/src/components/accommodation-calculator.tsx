import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { City, AccommodationType } from "@shared/schema";
import { accommodationPrices, formatCurrency } from "@/lib/pricing-data";

interface AccommodationCalculatorProps {
  selectedCities: City[];
  accommodationType: AccommodationType;
  nights: number;
  travelers: number;
  onTypeChange: (type: AccommodationType) => void;
}

const accommodationOptions: {
  value: AccommodationType;
  label: string;
  description: string;
  stars: number;
}[] = [
  { value: "hostel", label: "Hostel / Capsule", description: "Shared rooms, communal spaces", stars: 1 },
  { value: "businessHotel", label: "Business Hotel", description: "APA, Toyoko Inn, Dormy Inn", stars: 2 },
  { value: "midrange", label: "3-Star Hotel", description: "Comfort with amenities", stars: 3 },
  { value: "luxury", label: "Luxury / Ryokan", description: "Premium experience", stars: 5 },
];

export const AccommodationCalculator = memo(function AccommodationCalculator({
  selectedCities,
  accommodationType,
  nights,
  travelers,
  onTypeChange,
}: AccommodationCalculatorProps) {
  const averageRate =
    selectedCities.length > 0
      ? selectedCities.reduce((sum, city) => sum + accommodationPrices[city][accommodationType], 0) /
        selectedCities.length
      : 0;
  
  const roomsNeeded = accommodationType === "hostel" ? travelers : Math.ceil(travelers / 2);
  const totalCost = Math.round(averageRate * nights * roomsNeeded);

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Accommodation
          </CardTitle>
          <span className="text-lg font-semibold tabular-nums text-primary" data-testid="text-accommodation-total">
            {formatCurrency(totalCost)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Accommodation Type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {accommodationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onTypeChange(option.value)}
                className={cn(
                  "p-3 rounded-md text-left transition-all border",
                  accommodationType === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                )}
                data-testid={`button-accommodation-${option.value}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{option.label}</span>
                  <div className="flex">
                    {Array.from({ length: option.stars }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedCities.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Daily Rates by City</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedCities.map((city) => (
                <div
                  key={city}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
                >
                  <span className="truncate">{city}</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(accommodationPrices[city][accommodationType])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border space-y-1">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span data-testid="text-accommodation-nights">
              {nights} night{nights !== 1 ? "s" : ""} × {roomsNeeded} room{roomsNeeded !== 1 ? "s" : ""}
            </span>
            <span data-testid="text-accommodation-avg-rate">Avg {formatCurrency(Math.round(averageRate))}/night</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold" data-testid="text-accommodation-subtotal">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
