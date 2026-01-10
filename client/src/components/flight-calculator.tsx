import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane } from "lucide-react";
import type { City, AirlineType } from "@shared/schema";
import { cities } from "@shared/schema";
import { flightPrices, formatCurrency } from "@/lib/pricing-data";

interface FlightCalculatorProps {
  destinationCity: City;
  airlineType: AirlineType;
  travelers: number;
  onDestinationChange: (city: City) => void;
  onAirlineTypeChange: (type: AirlineType) => void;
}

const airlineOptions: { value: AirlineType; label: string; carriers: string[] }[] = [
  { value: "budget", label: "Budget Carriers", carriers: ["Scoot", "Jetstar", "AirAsia"] },
  { value: "fullService", label: "Full-Service", carriers: ["Singapore Airlines", "ANA", "JAL"] },
];

export const FlightCalculator = memo(function FlightCalculator({
  destinationCity,
  airlineType,
  travelers,
  onDestinationChange,
  onAirlineTypeChange,
}: FlightCalculatorProps) {
  const price = flightPrices[destinationCity][airlineType];
  const totalCost = price * travelers;

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plane className="h-5 w-5 text-primary" />
            Flights
          </CardTitle>
          <span className="text-lg font-semibold tabular-nums text-primary" data-testid="text-flights-total">
            {formatCurrency(totalCost)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Primary Destination</Label>
          <Select value={destinationCity} onValueChange={(v) => onDestinationChange(v as City)}>
            <SelectTrigger data-testid="select-destination-city">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Airline Type</Label>
          <RadioGroup
            value={airlineType}
            onValueChange={(v) => onAirlineTypeChange(v as AirlineType)}
            className="space-y-2"
          >
            {airlineOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-start space-x-3 p-3 rounded-md border border-border hover-elevate"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`airline-${option.value}`}
                  className="mt-0.5"
                  data-testid={`radio-airline-${option.value}`}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`airline-${option.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.carriers.join(", ")}
                  </p>
                  <p className="text-sm font-medium mt-1" data-testid={`text-price-${option.value}`}>
                    {formatCurrency(flightPrices[destinationCity][option.value])} per person
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground" data-testid="text-flights-calculation">
              {travelers} traveler{travelers > 1 ? "s" : ""} × {formatCurrency(price)}
            </span>
            <span className="font-semibold" data-testid="text-flights-subtotal">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
