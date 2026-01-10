import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Train, CreditCard, Info, Car, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JRPassType } from "@shared/schema";
import { jrPassPrices, airportTransferPrices, carRentalPrices, carRentalTips, formatCurrency, type CarRentalCompany } from "@/lib/pricing-data";

interface TransportCalculatorProps {
  jrPass: JRPassType;
  icCardBudget: number;
  airportTransfer: "nex" | "haruka" | "limousineBus" | "regularTrain";
  carRental: CarRentalCompany;
  carRentalDays: number;
  travelers: number;
  duration: number;
  onJRPassChange: (type: JRPassType) => void;
  onICCardBudgetChange: (budget: number) => void;
  onAirportTransferChange: (transfer: "nex" | "haruka" | "limousineBus" | "regularTrain") => void;
  onCarRentalChange: (company: CarRentalCompany) => void;
  onCarRentalDaysChange: (days: number) => void;
}

const jrPassOptions: { value: JRPassType; label: string; breakeven: string }[] = [
  { value: "none", label: "No JR Pass", breakeven: "Individual tickets" },
  { value: "7day", label: "7-Day Pass", breakeven: "Worth it for 2+ shinkansen trips" },
  { value: "14day", label: "14-Day Pass", breakeven: "Worth it for 3+ shinkansen trips" },
  { value: "21day", label: "21-Day Pass", breakeven: "Worth it for 4+ shinkansen trips" },
];

const airportTransferOptions = [
  { value: "nex", label: "Narita Express (N'EX)", description: "Fast to Tokyo/Shibuya" },
  { value: "haruka", label: "Haruka Express", description: "Kansai to Kyoto/Osaka" },
  { value: "limousineBus", label: "Limousine Bus", description: "Direct to major hotels" },
  { value: "regularTrain", label: "Regular Train", description: "Budget option, more transfers" },
];

export const TransportCalculator = memo(function TransportCalculator({
  jrPass,
  icCardBudget,
  airportTransfer,
  carRental,
  carRentalDays,
  travelers,
  duration,
  onJRPassChange,
  onICCardBudgetChange,
  onAirportTransferChange,
  onCarRentalChange,
  onCarRentalDaysChange,
}: TransportCalculatorProps) {
  const jrPassCost = jrPassPrices[jrPass] * travelers;
  const icCardTotal = icCardBudget * duration * travelers;
  const airportCost = airportTransferPrices[airportTransfer] * travelers * 2;
  const carRentalCost = carRental && carRentalPrices[carRental] ? carRentalPrices[carRental].dailyRate * carRentalDays : 0;
  const totalCost = jrPassCost + icCardTotal + airportCost + carRentalCost;

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Train className="h-5 w-5 text-primary" />
            Transportation
          </CardTitle>
          <span className="text-lg font-semibold tabular-nums text-primary" data-testid="text-transport-total">
            {formatCurrency(totalCost)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-medium">JR Pass</Label>
          <div className="grid grid-cols-2 gap-2">
            {jrPassOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onJRPassChange(option.value)}
                className={cn(
                  "p-3 rounded-md text-left transition-all border",
                  jrPass === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                )}
                data-testid={`button-jrpass-${option.value}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">{option.label}</span>
                  {option.value !== "none" && (
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrency(jrPassPrices[option.value])}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{option.breakeven}</p>
              </button>
            ))}
          </div>
          
          {jrPass !== "none" && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-primary/5 text-sm">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                JR Pass covers unlimited shinkansen (except Nozomi/Mizuho), local JR trains, and some JR buses.
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium">Daily IC Card Budget (Suica/Pasmo)</Label>
            <Badge variant="secondary" className="tabular-nums">
              {formatCurrency(icCardBudget)}/day
            </Badge>
          </div>
          <Slider
            value={[icCardBudget]}
            onValueChange={(v) => onICCardBudgetChange(v[0])}
            min={5}
            max={30}
            step={1}
            className="w-full"
            data-testid="slider-ic-card"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(5)} (minimal)</span>
            <span>{formatCurrency(30)} (heavy use)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3 inline mr-1" />
            For metro, buses, convenience stores. Avg: {formatCurrency(15)}/day
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Airport Transfer</Label>
          <Select
            value={airportTransfer}
            onValueChange={(v) => onAirportTransferChange(v as typeof airportTransfer)}
          >
            <SelectTrigger data-testid="select-airport-transfer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {airportTransferOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between gap-4 w-full">
                    <span>{option.label}</span>
                    <span className="text-muted-foreground text-sm">
                      {formatCurrency(airportTransferPrices[option.value as keyof typeof airportTransferPrices])}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Round-trip cost: {formatCurrency(airportTransferPrices[airportTransfer] * 2)} per person
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4" />
              Car Rental
            </Label>
            {carRental !== "none" && (
              <Badge variant="secondary" className="tabular-nums">
                {carRentalDays} day{carRentalDays !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <Select
            value={carRental}
            onValueChange={(v) => onCarRentalChange(v as CarRentalCompany)}
          >
            <SelectTrigger data-testid="select-car-rental">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(carRentalPrices) as CarRentalCompany[]).map((company) => (
                <SelectItem key={company} value={company}>
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div>
                      <span>{carRentalPrices[company].name}</span>
                      {company !== "none" && (
                        <span className="text-muted-foreground text-xs ml-2">
                          ({carRentalPrices[company].description})
                        </span>
                      )}
                    </div>
                    {company !== "none" && (
                      <span className="text-muted-foreground text-sm">
                        {formatCurrency(carRentalPrices[company].dailyRate)}/day
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {carRental !== "none" && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-muted-foreground">Rental Duration</Label>
                  <span className="text-sm font-medium tabular-nums">{carRentalDays} days</span>
                </div>
                <Slider
                  value={[carRentalDays]}
                  onValueChange={(v) => onCarRentalDaysChange(v[0])}
                  min={1}
                  max={Math.min(duration, 14)}
                  step={1}
                  className="w-full"
                  data-testid="slider-car-rental-days"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 day</span>
                  <span>{Math.min(duration, 14)} days</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-muted-foreground">
                  <p className="font-medium">Tips for renting a car in Japan:</p>
                  <ul className="space-y-0.5">
                    {carRentalTips.slice(0, 3).map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-2 border-t border-border space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span data-testid="text-jrpass-label">JR Pass ({travelers} pax)</span>
            <span className="tabular-nums" data-testid="text-jrpass-cost">{formatCurrency(jrPassCost)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span data-testid="text-iccard-label">IC Card ({duration} days)</span>
            <span className="tabular-nums" data-testid="text-iccard-cost">{formatCurrency(icCardTotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span data-testid="text-airport-label">Airport transfers</span>
            <span className="tabular-nums" data-testid="text-airport-cost">{formatCurrency(airportCost)}</span>
          </div>
          {carRental !== "none" && (
            <div className="flex justify-between text-muted-foreground">
              <span data-testid="text-carrental-label">Car rental ({carRentalDays} days)</span>
              <span className="tabular-nums" data-testid="text-carrental-cost">{formatCurrency(carRentalCost)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-1 border-t border-border">
            <span>Total</span>
            <span className="tabular-nums" data-testid="text-transport-subtotal">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
